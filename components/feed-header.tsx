import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  actionType?: "coffee" | "logout";
  onActionPress?: () => void;
};

export function FeedHeader({ actionType = "coffee", onActionPress }: Props) {
  return (
    <View className="flex-row items-center justify-between bg-surface/80 px-6 py-4">
      <View className="flex-row items-center gap-3">
        <Text className="font-headline text-2xl font-black tracking-tighter text-primary-container">
          GC Magazine
        </Text>
      </View>
      <Pressable
        onPress={onActionPress}
        className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary-container bg-surface"
      >
        <Ionicons
          name={actionType === "logout" ? "log-out-outline" : "cafe-outline"}
          size={20}
          color="#fff6df"
        />
      </Pressable>
    </View>
  );
}
