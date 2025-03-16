import { useEffect, useMemo } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/useColorScheme';
import 'react-native-reanimated';
import '../style/global.css';
import { Slot } from "expo-router";
import { useAuthListener } from "../config/firebase";
import { useAuthStore } from "../store/authStore";
import AuthenticationScreen from '@/components/AuthenticationScreen';
import LoadingScreen from "@/components/LoadingScreen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const theme = useMemo(() => (colorScheme === 'dark' ? DarkTheme : DefaultTheme), [colorScheme]);

  // Initialize auth listener
  useAuthListener();
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // If not authenticated, show login screen
  if (!user) {
    return <AuthenticationScreen />;
  }
  
  // User is authenticated
  return <Slot />;
}
