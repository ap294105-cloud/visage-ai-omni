import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GlassCard({ children, style }: GlassCardProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <BlurView intensity={80} tint="dark" style={styles.blur}>
          <View style={styles.content}>
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  // Fallback for Native (iOS/Android) to avoid expo-blur rendering issues
  return (
    <View style={[styles.container, styles.nativeContainer, style]}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Glassmorphism dark base
  },
  nativeContainer: {
    backgroundColor: '#0c0c16', // Solid dark purple-black for native mobile
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  blur: {
    flex: 1,
  },
  content: {
    padding: 20,
  }
});
