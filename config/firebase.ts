import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential 
} from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useAuthStore } from "../store/authStore";

const firebaseConfig = {
  apiKey: process.env['EXPO_PUBLIC_FIREBASE_API_KEY'],
  authDomain: process.env['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['EXPO_PUBLIC_FIREBASE_PROJECT_ID'],
  storageBucket: process.env['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: process.env['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  appId: process.env['EXPO_PUBLIC_FIREBASE_APP_ID'],
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Google Authentication
const signInWithGoogle = async () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env['EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'],
    iosClientId: process.env['EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'],
    webClientId: process.env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'],
  });

  if (response?.type === "success") {
    const { id_token } = response.params;
    const credential = GoogleAuthProvider.credential(id_token);
    return signInWithCredential(auth, credential);
  } else {
    return promptAsync();
  }
};

// Email/Password Authentication
const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const createUserWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const logOut = async () => {
  await signOut(auth);
  useAuthStore.getState().logout();
};

const useAuthListener = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      useAuthStore.getState().setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
};

export { 
  app, 
  auth, 
  db, 
  storage, 
  signInWithGoogle, 
  signInWithEmail,
  createUserWithEmail,
  logOut, 
  useAuthListener 
};
