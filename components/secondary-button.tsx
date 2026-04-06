import { Pressable, Text } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  fullWidth?: boolean;
  disabled?: boolean;
};

export function SecondaryButton({
  label,
  onPress,
  className = "",
  textClassName = "",
  fullWidth = true,
  disabled = false,
}: Props) {
  const widthClass = fullWidth ? "w-full" : "w-auto self-start px-8";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      className={`h-14 items-center justify-center rounded-full border border-outline-variant/20 bg-transparent active:bg-surface-container-low/30 ${widthClass} ${
        disabled ? "opacity-60" : ""
      } ${className}`}
    >
      <Text className={`font-label text-lg font-medium text-primary ${textClassName}`}>{label}</Text>
    </Pressable>
  );
}
