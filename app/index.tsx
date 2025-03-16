import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { useRecordingsStore, Recording } from "../store/recordingsStore";
import { fetchUserRecordings } from "../config/firestoreServices";
import RecordingListItem from "@/components/RecordingListItem";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { recordings, setRecordings, error } = useRecordingsStore();
  
  useEffect(() => {
    if (user) {
      loadRecordings();
    }
  }, [user]);
  
  const loadRecordings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const fetchedRecordings = await fetchUserRecordings(user.uid);
      setRecordings(fetchedRecordings);
    } catch (error) {
      console.error("Failed to load recordings:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToRecorder = () => {
    router.push("/recorder");
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Recordings</Text>
        <TouchableOpacity onPress={loadRecordings}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading recordings...</Text>
        </View>
      ) : recordings.length > 0 ? (
        <FlatList
          data={recordings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecordingListItem recording={item} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="mic-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No recordings yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the button below to start recording
          </Text>
        </View>
      )}
      
      <FloatingActionButton
        icon="mic"
        onPress={navigateToRecorder}
      />
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
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});
