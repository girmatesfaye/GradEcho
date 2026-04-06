import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  fullWidth?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  className = "",
  textClassName = "",
  fullWidth = true,
  rightIcon,
  disabled = false,
}: Props) {
  const widthClass = fullWidth ? "w-full" : "w-auto self-start px-8";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-full bg-primary-container active:opacity-90 ${widthClass} ${
        disabled ? "opacity-60" : ""
      } ${className}`}
    >
      <Text className={`font-label text-lg font-bold text-on-primary-container ${textClassName}`}>
        {label}
      </Text>
      {rightIcon ? <Ionicons name={rightIcon} size={20} color="#705e00" /> : null}
    </Pressable>
  );
}
