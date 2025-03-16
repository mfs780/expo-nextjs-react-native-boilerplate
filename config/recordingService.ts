import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { addRecording } from './firestoreServices';
import { useAuthStore } from '../store/authStore';
import { useRecordingsStore } from '../store/recordingsStore';

// Configuration for audio recording
const RECORDING_OPTIONS = {
    android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 64000,
    },
    ios: {
        extension: '.m4a',
        audioQuality: Audio.IOSAudioQuality.LOW,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 64000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
};

class RecordingService {
    recording: Audio.Recording | null = null;

    async startRecording() {
        try {
            // Request permission
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                throw new Error('Permission to record audio was denied');
            }

            // Set up audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            // Start recording
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets['LOW_QUALITY']);

            this.recording = recording;
            return true;
        } catch (error) {
            console.error('Failed to start recording', error);
            return false;
        }
    }

    async stopRecording() {
        if (!this.recording) {
            return null;
        }

        try {
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            this.recording = null;

            return uri;
        } catch (error) {
            console.error('Failed to stop recording', error);
            return null;
        }
    }

    async saveRecording(uri: string, name: string, tags: string[] = []) {
        try {
            const user = useAuthStore.getState().user;
            if (!user) throw new Error('User not authenticated');

            // Read the file
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('Recording file does not exist');
            }

            // Read the file into a blob
            const fileBlob = await new Promise<Blob>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    resolve(xhr.response);
                };
                xhr.onerror = (e) => {
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
                duration: '00:00', // This would need to be calculated from the recording
                tags,
            };

            // Save to Firestore and Storage
            const recording = await addRecording(user.uid, fileBlob, metadata);

            // Update local store
            useRecordingsStore.getState().addRecording(recording);

            return recording;
        } catch (error) {
            console.error('Error saving recording:', error);
            throw error;
        }
    }
}

export default new RecordingService();
