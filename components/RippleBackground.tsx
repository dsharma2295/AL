import { useEffect, useReducer, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Ripple {
  id: number;
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
}

interface RippleBackgroundProps {
  children: React.ReactNode;
  rippleColor?: string;
  rippleSize?: number;
  rippleDuration?: number;
  rippleOpacity?: number;
  starCount?: number;
}

export default function RippleBackground({
  children,
  rippleColor = 'rgba(52, 152, 219, 0.6)',
  rippleSize = 500,
  rippleDuration = 2000,
  rippleOpacity = 0.3,
  starCount = 100,
}: RippleBackgroundProps) {
  const ripples = useRef<Ripple[]>([]);
  const [stars, setStars] = useState<Star[]>([]);  // ← Change from useRef to useState
  const rippleCounter = useRef(0);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Generate stars on mount
  useEffect(() => {
    console.log("=== GENERATING STARS ===");
    const newStars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const star: Star = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 20,
        opacity: new Animated.Value(0.8),
      };
      newStars.push(star);
    }

    console.log("Setting stars state:", newStars.length);
    setStars(newStars);  // ← Use setState instead of ref
  }, [starCount]);
  const createRipple = (x: number, y: number) => {
    const id = rippleCounter.current++;
    const scale = new Animated.Value(0);
    const opacity = new Animated.Value(rippleOpacity);

    const ripple: Ripple = { id, x, y, scale, opacity };
    ripples.current.push(ripple);
    forceUpdate();

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: rippleDuration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: rippleDuration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      ripples.current = ripples.current.filter(r => r.id !== id);
      forceUpdate();
    });
  };

  useEffect(() => {
    (global as any).triggerRipple = createRipple;
    return () => {
      delete (global as any).triggerRipple;
    };
  }, [rippleColor, rippleSize, rippleDuration, rippleOpacity]);

  return (
    <View style={styles.container}>
      {/* Stars layer - deepest */}
      <View style={styles.starsContainer} pointerEvents="none">
        {stars.map((star) => (  // ← Use stars state, not stars.current
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Ripple layer - middle */}
      <View style={styles.rippleContainer} pointerEvents="none">
        {ripples.current.map((ripple) => (
          <Animated.View
            key={ripple.id}
            style={[
              styles.ripple,
              {
                left: ripple.x - rippleSize / 2,
                top: ripple.y - rippleSize / 2,
                width: rippleSize,
                height: rippleSize,
                borderRadius: rippleSize / 2,
                backgroundColor: rippleColor,
                transform: [{ scale: ripple.scale }],
                opacity: ripple.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Content layer - on top */}
      {children}
    </View>
  );
}

export function triggerRipple(x: number, y: number) {
  if ((global as any).triggerRipple) {
    (global as any).triggerRipple(x, y);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0d1420',  // Dark sky blue
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ff0000',  // Bright red
    borderRadius: 50,
  },
  rippleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ripple: {
    position: 'absolute',
  },
});