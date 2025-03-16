import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { addRecording } from "./firestoreServices";
import { useAuthStore } from "../store/authStore";
import { useRecordingsStore } from "../store/recordingsStore";

class CallRecordingService {
  private isCallRecordingEnabled = false;
  private recording: Audio.Recording | null = null;
  private callStartTime: Date | null = null;
  
  // Initialize - should be called at app startup
  async initialize() {
    if (Platform.OS !== "android") {
      console.log("Call recording is only supported on Android");
      return false;
    }
    
    try {
      // Request necessary permissions
      const { granted: audioPermission } = await Audio.requestPermissionsAsync();
      
      if (!audioPermission) {
        console.error("Audio recording permission denied");
        return false;
      }
      
      // Note: For proper call recording on Android, we would need:
      // 1. Accessibility service permissions (requires native code)
      // 2. A background service to monitor call state
      // These would be implemented in native Android code and bridged to JS
      
      // This is a simplified version that just demonstrates the concept
      // In a real implementation, you'd need a native module for call detection
      
      this.isCallRecordingEnabled = audioPermission;
      return true;
    } catch (error) {
      console.error("Error initializing call recording:", error);
      return false;
    }
  }
  
  // Enable/disable call recording
  setEnabled(enabled: boolean) {
    // In a real implementation, this would enable/disable the native
    // accessibility service and call monitoring
    this.isCallRecordingEnabled = enabled;
    return this.isCallRecordingEnabled;
  }
  
  // This would be called by the native module when a call starts
  async onCallStarted(phoneNumber: string) {
    if (!this.isCallRecordingEnabled || Platform.OS !== "android") {
      return;
    }
    
    try {
      // Set up audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // Not applicable for iOS
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets['LOW_QUALITY']);
      this.recording = recording;
      this.callStartTime = new Date();
      
      console.log("Call recording started", phoneNumber);
    } catch (error) {
      console.error("Failed to start call recording:", error);
    }
  }
  
  // This would be called by the native module when a call ends
  async onCallEnded(phoneNumber: string) {
    if (!this.recording || !this.callStartTime) {
      return;
    }
    
    try {
      // Stop recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (uri) {
        const callDuration = Math.floor((new Date().getTime() - this.callStartTime.getTime()) / 1000);
        const minutes = Math.floor(callDuration / 60);
        const seconds = callDuration % 60;
        const durationStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Sanitize the phone number for display
        const sanitizedNumber = phoneNumber.replace(/[^0-9+]/g, '');
        const name = `Call with ${sanitizedNumber}`;
        
        // Save the recording
        await this.saveCallRecording(uri, name, durationStr);
      }
      
      this.recording = null;
      this.callStartTime = null;
    } catch (error) {
      console.error("Failed to save call recording:", error);
      this.recording = null;
      this.callStartTime = null;
    }
  }
  
  private async saveCallRecording(uri: string, name: string, duration: string) {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      // Read the file into a blob
      const fileBlob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = () => {
          reject(new Error('Failed to convert file to blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
      
      // Create metadata
      const metadata = {
        name,
        timestamp: new Date().toISOString(),
        duration,
        tags: ['call'],
      };
      
      // Save to Firestore and Storage
      const recording = await addRecording(user.uid, fileBlob, metadata);
      
      // Update local store
      useRecordingsStore.getState().addRecording(recording);
      
      console.log("Call recording saved:", name);
      
      return recording;
    } catch (error) {
      console.error('Error saving call recording:', error);
      throw error;
    }
  }
  
  // For manual testing (simulates a call)
  async simulateCall(phoneNumber: string, durationMs: number = 10000) {
    if (Platform.OS !== "android") {
      console.log("Call simulation only works on Android");
      return;
    }
    
    await this.onCallStarted(phoneNumber);
    
    // Simulate call duration
    await new Promise(resolve => setTimeout(resolve, durationMs));
    
    await this.onCallEnded(phoneNumber);
    console.log(`Simulated ${durationMs / 1000}s call completed`);
  }
}

export default new CallRecordingService();
