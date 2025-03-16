import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import recordingService from "../config/recordingService";
import { useAuthStore } from "../store/authStore";
import TagInput from "@/components/TagInput";

export default function RecorderScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingName, setRecordingName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    // Clean up timer when component unmounts
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    const success = await recordingService.startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
    } else {
      Alert.alert("Error", "Failed to start recording. Please check permissions.");
    }
  };

  const stopRecording = async () => {
    if (timer) clearInterval(timer);
    setTimer(null);
    
    const uri = await recordingService.stopRecording();
    setIsRecording(false);
    
    if (uri) {
      // Generate default name if empty
      const finalName = recordingName.trim() || `Recording ${new Date().toLocaleString()}`;
      try {
        const savedRecording = await recordingService.saveRecording(uri, finalName, tags);
        Alert.alert(
          "Recording Saved", 
          "Your recording has been saved successfully.",
          [
            { 
              text: "OK", 
              onPress: () => router.back() 
            }
          ]
        );
      } catch (error: any) {
        Alert.alert("Error", "Failed to save recording: " + error.message);
      }
    }
  };

  const handleCancel = async () => {
    if (isRecording) {
      if (timer) clearInterval(timer);
      setTimer(null);
      await recordingService.stopRecording();
      setIsRecording(false);
    }
    router.back();
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="close" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isRecording ? "Recording..." : "New Recording"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(recordingTime)}</Text>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording</Text>
            </View>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Recording name"
          value={recordingName}
          onChangeText={setRecordingName}
          editable={!isRecording}
        />

        <TagInput 
          tags={tags}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          disabled={isRecording}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording ? styles.stopButton : styles.startButton,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={30}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  timer: {
    fontSize: 60,
    fontVariant: ["tabular-nums"],
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
    marginRight: 8,
  },
  recordingText: {
    color: "red",
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginVertical: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButton: {
    backgroundColor: "#007AFF",
  },
  stopButton: {
    backgroundColor: "red",
  },
});
