import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";

import { FeedHeader } from "@/components/feed-header";
import { MemoryCard } from "@/components/memory-card";
import { MOCK_MEMORIES } from "@/constants/mock-memories";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5mO7GArcByAeXNz-sZ1-AMeU53V4H6qnZMAAzif-HqYGpQH9sisieHwLQeDX0iDxwSVmaG17bqwKXmz5fIlCk0Ga8CGq2ojNFhZDdBBxRmUi0PhclcW8MC2cwIoO1fPxjqLot4xAVQYrJZKKUO62ZfUf8RyqJ1kdEw9XPM34V7XkVFPVaMyptlzoKNvgZinOmrp4tpbzzCpIn6JA83McF1sjPVOCaMX9YRET3b8yKCsMaQi8fDOmDXqbXQN7VJExQzYJfRDYQA5OD";

const ARCHIVE_DATES = ["May 24, 2024", "Apr 12, 2024"];

export default function ProfileScreen() {
  const archive = MOCK_MEMORIES.slice(0, 2).map((m, i) => ({
    ...m,
    dateLabel: ARCHIVE_DATES[i] ?? m.dateLabel,
  }));

  return (
    <View className="flex-1 bg-surface">
      <FeedHeader avatarUri={AVATAR} />
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerClassName="pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="mb-10 flex-row items-center gap-4 px-2">
          <View className="relative">
            <View className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary-container p-0.5">
              <View className="h-full w-full overflow-hidden rounded-full border-2 border-surface">
                <Image source={{ uri: AVATAR }} className="h-full w-full" contentFit="cover" />
              </View>
            </View>
            <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-primary-container">
              <Ionicons name="checkmark" size={14} color="#705e00" />
            </View>
          </View>
          <View>
            <Text className="font-headline text-2xl font-bold leading-tight text-primary">
              Julian Thorne
            </Text>
            <Text className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Computer Science 2024
            </Text>
            <Text className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container/70">
              Stanford University
            </Text>
          </View>
        </View>
        <View className="mb-10 flex-row items-center justify-between rounded-2xl border border-outline-variant/10 bg-surface-container-low/40 p-6">
          <View className="flex-1 items-center">
            <Text className="font-headline text-xl font-bold text-primary">24</Text>
            <Text className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              Memories
            </Text>
          </View>
          <View className="h-8 w-px bg-outline-variant/20" />
          <View className="flex-1 items-center">
            <Text className="font-headline text-xl font-bold text-primary">142</Text>
            <Text className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              Echoes
            </Text>
          </View>
          <View className="h-8 w-px bg-outline-variant/20" />
          <View className="flex-1 items-center">
            <Text className="font-headline text-xl font-bold text-primary">8</Text>
            <Text className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              Awards
            </Text>
          </View>
        </View>
        <View className="mb-6 flex-row items-baseline justify-between px-2">
          <Text className="font-headline text-lg font-bold text-primary">Personal Archive</Text>
          <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
            Chronological
          </Text>
        </View>
        {archive.map((m) => (
          <MemoryCard key={m.id} memory={m} variant="profile" />
        ))}
      </ScrollView>
    </View>
  );
}
