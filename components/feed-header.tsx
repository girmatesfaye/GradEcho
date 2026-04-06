import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

type Props = {
  // onMenuPress?: () => void;
  avatarUri?: string;
};

export function FeedHeader({ avatarUri }: Props) {
  return (
    <View className="flex-row items-center justify-between bg-surface/80 px-6 py-4">
      <View className="flex-row items-center gap-3">
        {/* <Pressable onPress={onMenuPress} hitSlop={12}>
          <Ionicons name="menu" size={26} color="#ffd700" />
        </Pressable> */}
        <Text className="font-headline text-2xl font-black tracking-tighter text-primary-container">
          GradEcho
        </Text>
      </View>
      {avatarUri ? (
        <Pressable className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-container">
          <Image
            source={{ uri: avatarUri }}
            className="h-full w-full"
            contentFit="cover"
          />
        </Pressable>
      ) : null}
    </View>
  );
}
