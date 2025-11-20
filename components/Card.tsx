import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface CardProps {
    children: React.ReactNode;
    borderColor?: string;
    style?: ViewStyle;
}

export default function Card({
    children,
    borderColor = colors.text.primary,
    style
}: CardProps) {
    return (
        <View style={[styles.card, { borderLeftColor: borderColor }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background.card,
        padding: spacing.lg,
        borderLeftWidth: 4,
        position: "relative",
    },
});