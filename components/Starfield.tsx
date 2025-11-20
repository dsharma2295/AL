import { useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
}

export default function Starfield({ count = 80 }: { count?: number }) {
    const stars = useRef<Star[]>([]);

    if (stars.current.length === 0) {
        for (let i = 0; i < count; i++) {
            stars.current.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 0.5, // 0.5-2.5px
                opacity: Math.random() * 0.6 + 0.2, // 0.2-0.8
            });
        }
    }

    return (
        <View style={styles.container} pointerEvents="none">
            {stars.current.map((star, i) => (
                <View
                    key={i}
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
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    star: {
        position: 'absolute',
        backgroundColor: '#ffffff',
        borderRadius: 50,
    },
});