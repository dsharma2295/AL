import { Platform } from 'react-native';

// Detect if device supports 120Hz (ProMotion)
const isProMotion = () => {
  // ProMotion devices: iPhone 13 Pro, 14 Pro, 15 Pro, 16 Pro
  // React Native doesn't expose refresh rate directly, so we estimate
  // In production, you'd use a native module or react-native-device-info
  
  // For now, we'll use a multiplier that adapts
  // 120Hz devices benefit from 0.5x duration for same visual speed
  return Platform.OS === 'ios'; // Simplified - assume ProMotion capable
};

export const getAnimationDuration = (baseDuration: number): number => {
  // If 120Hz capable, halve the duration for smoother animations
  return isProMotion() ? baseDuration * 0.7 : baseDuration;
};

export const getSpringConfig = () => {
  return isProMotion() 
    ? { friction: 5, tension: 60 }  // Snappier for 120Hz
    : { friction: 3, tension: 40 }; // Standard for 60Hz
};

// Animation constants
export const ANIMATION_DURATIONS = {
  fast: getAnimationDuration(150),
  medium: getAnimationDuration(300),
  slow: getAnimationDuration(600),
  pulse: getAnimationDuration(1000),
};