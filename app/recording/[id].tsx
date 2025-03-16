import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Recording } from "../../store/recordingsStore";
import { useAuthStore } from "../../store/authStore";
import { useRecordingsStore } from "../../store/recordingsStore";
import { updateRecordingMetadata, deleteRecording } from "../../config/firestoreServices";
import TagInput from "../../components/TagInput";

export default function RecordingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { recordings, updateRecording, deleteRecording: removeRecording } = useRecordingsStore();
  
  const [recording, setRecording] = useState<Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (recordings.length > 0 && id) {
      const rec = recordings.find(r => r.id === id);
      if (rec) {
        setRecording(rec);
        setName(rec.name);
        setTags([...rec.tags]);
        setIsLoading(false);
      }
    }
  }, [recordings, id]);

  useEffect(() => {
    return () => {
      // Clean up sound when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    if (!recording) return;

    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recording.fileURL },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading sound:", error);
      Alert.alert("Error", "Failed to load recording.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (recording) {
      loadSound();
    }
  }, [recording]);

  // TODO
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!recording || !user) return;
    
    try {
      const updates = {
        name,
        tags,
      };
      
      await updateRecordingMetadata(user.uid, recording.id, updates);
      updateRecording(recording.id, updates);
      setIsEditing(false);
      Alert.alert("Success", "Recording details updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update recording details.");
    }
  };

  const handleDelete = async () => {
    if (!recording || !user) return;
    
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this recording? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecording(user.uid, recording);
              removeRecording(recording.id);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete recording.");
            }
          }
        }
      ]
    );
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!recording) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Recording not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {recording.name}
        </Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Ionicons name={isEditing ? "checkmark" : "pencil"} size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Recording name"
            />

            <TagInput
              tags={tags}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={handleDelete}
              >
                <Text style={[styles.buttonText, styles.deleteText]}>Delete Recording</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoContainer}>
              <Text style={styles.date}>
                {new Date(recording.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.duration}>{recording.duration}</Text>
            </View>

            <View style={styles.playerContainer}>
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(position / duration) * 100}%` }
                  ]} 
                />
              </View>
              
              <View style={styles.timeContainer}>
                <Text style={styles.time}>{formatTime(position)}</Text>
                <Text style={styles.time}>{formatTime(duration)}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={handlePlayPause}
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={40} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            {recording.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={styles.tagsTitle}>Tags:</Text>
                <View style={styles.tagsList}>
                  {recording.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  duration: {
    fontSize: 14,
    fontWeight: "500",
  },
  playerContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  progressContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  timeContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  time: {
    fontSize: 12,
    color: "#666",
    fontVariant: ["tabular-nums"],
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tagsContainer: {
    marginTop: 30,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#E1EFFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#007AFF",
  },
  editContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  buttonRow: {
    marginTop: 30,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteText: {
    color: "#FF3B30",
  },
});
