import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/primary-button";

const DEPTS = [
  "Software Engineering",
  "Business Administration",
  "Architecture & Design",
  "Liberal Arts",
  "Applied Sciences",
];

export default function UserSetupScreen() {
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState(DEPTS[0]);
  const [year, setYear] = useState("2024");

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 px-6 py-12"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text className="font-headline text-4xl font-extrabold leading-tight tracking-tight text-primary">
            Create Your{"\n"}
            <Text className="text-primary-container">Digital Keepsake</Text>
          </Text>
          <Text className="mt-4 max-w-md font-body text-lg text-on-surface-variant">
            Complete your profile to begin archiving your graduation journey and
            connecting with your batch.
          </Text>
        </View>
        <View className="gap-6">
          <View>
            <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Full Name
            </Text>
            <View className="relative">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Johnathan Echo"
                placeholderTextColor="#d0c6ab66"
                className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
              />
              <View className="absolute right-6 top-1/2 -translate-y-1/2">
                <Ionicons name="person-outline" size={22} color="#d0c6ab55" />
              </View>
            </View>
          </View>
          <View>
            <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              University
            </Text>
            <View className="relative">
              <TextInput
                value={university}
                onChangeText={setUniversity}
                placeholder="Enter University Name"
                placeholderTextColor="#d0c6ab66"
                className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
              />
              <View className="absolute right-6 top-1/2 -translate-y-1/2">
                <Ionicons name="school-outline" size={22} color="#d0c6ab55" />
              </View>
            </View>
          </View>
          <View>
            <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Department
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row flex-wrap gap-2">
                {DEPTS.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDepartment(d)}
                    className={`rounded-full px-4 py-2 ${department === d ? "bg-primary-container" : "bg-surface-container-low"}`}
                  >
                    <Text
                      className={`font-label text-xs ${department === d ? "text-on-primary-container" : "text-on-surface-variant"}`}
                      numberOfLines={1}
                    >
                      {d}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
          <View>
            <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Graduation Year
            </Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
              placeholder="2024"
              placeholderTextColor="#d0c6ab66"
              className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
            />
          </View>
        </View>
        <PrimaryButton
          label="Enter the Archive"
          onPress={() => router.replace("/home")}
          className="mt-10"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
