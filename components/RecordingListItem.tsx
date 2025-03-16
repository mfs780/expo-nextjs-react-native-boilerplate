import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Recording } from "../store/recordingsStore";

type Props = {
  recording: Recording;
};

export default function RecordingListItem({ recording }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handlePress = () => {
    router.push({
      pathname: "/recording/[id]",
      params: { id: recording.id },
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Ionicons name="mic" size={24} color="#007AFF" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {recording.name}
        </Text>
        <Text style={styles.timestamp}>
          {formatDate(recording.timestamp)}
        </Text>
        <View style={styles.tagsContainer}>
          {recording.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.duration}>{recording.duration}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E1EFFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tag: {
    backgroundColor: "#E1EFFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 11,
    color: "#007AFF",
  },
  duration: {
    fontSize: 14,
    color: "#666",
  },
});
