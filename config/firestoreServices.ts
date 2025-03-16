import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Recording } from '../store/recordingsStore';

// Firestore collection reference
const getUserRecordingsRef = (userId: string) => {
  return collection(db, 'users', userId, 'recordings');
};

// Get all recordings for a user
export const fetchUserRecordings = async (userId: string): Promise<Recording[]> => {
  try {
    const q = query(
      getUserRecordingsRef(userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const recordings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Recording));
    
    return recordings;
  } catch (error) {
    console.error('Error fetching recordings:', error);
    throw error;
  }
};

// Add a new recording
export const addRecording = async (
  userId: string,
  recordingFile: File | Blob,
  metadata: Omit<Recording, 'id' | 'fileURL'>
): Promise<Recording> => {
  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `recordings/${userId}/${Date.now()}-recording`);
    await uploadBytes(storageRef, recordingFile);
    const fileURL = await getDownloadURL(storageRef);
    
    // Add metadata to Firestore
    const recordingData = {
      ...metadata,
      fileURL,
    };
    
    const docRef = await addDoc(getUserRecordingsRef(userId), recordingData);
    
    return {
      id: docRef.id,
      ...recordingData,
    } as Recording;
  } catch (error) {
    console.error('Error adding recording:', error);
    throw error;
  }
};

// Update recording metadata
export const updateRecordingMetadata = async (
  userId: string,
  recordingId: string,
  updates: Partial<Recording>
): Promise<void> => {
  try {
    const recordingRef = doc(getUserRecordingsRef(userId), recordingId);
    await updateDoc(recordingRef, updates);
  } catch (error) {
    console.error('Error updating recording:', error);
    throw error;
  }
};

// Delete a recording
export const deleteRecording = async (
  userId: string,
  recording: Recording
): Promise<void> => {
  try {
    // Delete from Firestore
    const recordingRef = doc(getUserRecordingsRef(userId), recording.id);
    await deleteDoc(recordingRef);
    
    // Delete from Storage
    if (recording.fileURL) {
      const fileRef = ref(storage, recording.fileURL);
      await deleteObject(fileRef);
    }
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw error;
  }
};

// Search recordings by tags
export const searchRecordingsByTags = async (
  userId: string,
  tags: string[]
): Promise<Recording[]> => {
  try {
    const recordings = await fetchUserRecordings(userId);
    return recordings.filter((rec) => 
      tags.some(tag => rec.tags.includes(tag))
    );
  } catch (error) {
    console.error('Error searching recordings:', error);
    throw error;
  }
};
