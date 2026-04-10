import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Image as NativeImage,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { isAuthExpiredErrorMessage } from "@/lib/auth-errors";
import { uploadMemoryAudio, uploadMemoryImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

const USER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAH2kjIoZLn6ZXpKx6f3Mmfx0sclCivIJdkRXHOAUqtqL-vGa-VmQhhpyrxVhrQ4Uldi3Aw2pKNOZVmC3UX-a_59oQRx0Ue8JewbVw-Xra6t3_nvTH2505UsDjN6-xrkebk7CSCF5bjMTN4IqapIiZw6Dw_dUl_HiXSv1IVptje0t_m05CS-ivDVFxy-NWBdXlKUI5v_WCtSUpPxp8N_ozGErVcZhLwq1moW7HW4pJWkg8zPamp_BfBVESacvtXVimMbfwUs1VhdxtK";
const TITLE_CHAR_LIMIT = 260;
const END_WORDS_CHAR_LIMIT = 600;

function normalizeTitle(text: string) {
  const compact = text.trim().replace(/\s+/g, " ");
  return compact;
}

function parseTags(rawTags: string) {
  return rawTags
    .split(" ")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function CreateMemoryScreen() {
  const insets = useSafeAreaInsets();
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverLoadFailed, setCoverLoadFailed] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [recordingMillis, setRecordingMillis] = useState(0);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [voiceBase64, setVoiceBase64] = useState<string | null>(null);
  const [voiceExtension, setVoiceExtension] = useState<string>("m4a");
  const [voiceDuration, setVoiceDuration] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [tagsText, setTagsText] = useState("#graduation #memories");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCoverLoadFailed(false);
  }, [coverUri]);

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync().catch(() => {
          // Ignore cleanup races when the recording was already unloaded.
        });
      }
    };
  }, []);

  const pickCoverImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to choose a cover image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
      base64: false,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });

    if (!result.canceled) {
      const picked = result.assets[0]?.uri;

      if (!picked) {
        setCoverUri(null);
        return;
      }

      setCoverLoadFailed(false);
      setCoverUri(picked);
    }
  };

  const handleShareMemory = async () => {
    if (!coverUri) {
      Alert.alert("Missing image", "Please choose a cover image first.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Missing text", "Please add your memory title.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      Alert.alert("Please login", "Your session expired. Please login again.");
      router.replace("/login?reason=expired");
      return;
    }

    try {
      const imageUrl = await uploadMemoryImage({
        userId: user.id,
        uri: coverUri,
      });

      let voiceUrl: string | null = null;
      if (voiceUri) {
        voiceUrl = await uploadMemoryAudio({
          userId: user.id,
          uri: voiceUri,
          base64: voiceBase64 ?? undefined,
          extension: voiceExtension,
        });
      }

      const payload = {
        user_id: user.id,
        title: normalizeTitle(title),
        reflection: reflection.trim() || null,
        image_url: imageUrl,
        voice_url: voiceUrl,
        voice_label: voiceUrl ? "Voice Memo" : null,
        voice_duration: voiceUrl ? voiceDuration : null,
        tags: parseTags(tagsText),
      };

      const { data, error } = await supabase
        .from("memories")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      router.replace({ pathname: "/memory/[id]", params: { id: data.id } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save memory.";
      if (isAuthExpiredErrorMessage(message)) {
        Alert.alert(
          "Please login",
          "Your session expired. Please login again.",
        );
        router.replace("/login?reason=expired");
        return;
      }
      Alert.alert("Upload failed", `Create-memory failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecording = async () => {
    if (recording) {
      return;
    }

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Microphone required",
        "Please allow microphone access to record voice memories.",
      );
      return;
    }

    try {
      setVoiceUri(null);
      setVoiceBase64(null);
      setVoiceExtension("m4a");
      setVoiceDuration(null);
      setRecordingMillis(0);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: nextRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setRecordingMillis(status.durationMillis ?? 0);
          }
        },
        300,
      );

      setRecording(nextRecording);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start recording.";
      Alert.alert("Recording failed", message);
    }
  };

  const stopVoiceRecording = async () => {
    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const duration = formatDuration(recordingMillis);

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri) {
        const normalizedVoiceUri = uri;
        const extension =
          uri.split(".").pop()?.split("?")[0]?.split("#")[0]?.toLowerCase() ??
          "m4a";

        let encodedVoice: string | null = null;
        try {
          encodedVoice = await FileSystem.readAsStringAsync(
            normalizedVoiceUri,
            {
              encoding: FileSystem.EncodingType.Base64,
            },
          );
        } catch {
          encodedVoice = null;
        }

        setVoiceUri(normalizedVoiceUri);
        setVoiceBase64(encodedVoice);
        setVoiceExtension(extension);
        setVoiceDuration(duration);
      } else {
        setVoiceUri(null);
        setVoiceBase64(null);
        setVoiceExtension("m4a");
        setVoiceDuration(null);
      }

      setRecording(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not stop recording.";
      Alert.alert("Recording failed", message);
      setRecording(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1 bg-surface"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center justify-between bg-surface/80 px-6 py-4">
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="close" size={28} color="#ffd700" />
            </Pressable>
            <Text className="font-headline text-xl font-black tracking-tighter text-primary-container">
              GC Magazine
            </Text>
          </View>
          <View className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant/20">
            <Image
              source={{ uri: USER_AVATAR }}
              className="h-full w-full"
              contentFit="cover"
            />
          </View>
        </View>
        <ScrollView
          className="flex-1 px-6 pt-8"
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text className="mb-2 font-headline text-4xl font-bold tracking-tight text-primary">
            Immortalize the Moment
          </Text>
          <Text className="mb-10 font-body text-lg text-on-surface-variant">
            Every frame tells a story of your journey.
          </Text>

          <Pressable
            onPress={pickCoverImage}
            className="relative mb-8 overflow-hidden rounded-lg bg-surface-container-low"
          >
            <View className="aspect-[16/10] w-full items-center justify-center">
              {coverUri && !coverLoadFailed ? (
                <>
                  <NativeImage
                    key={coverUri}
                    source={{ uri: coverUri }}
                    className="absolute inset-0 h-full w-full"
                    resizeMode="cover"
                    onError={() => setCoverLoadFailed(true)}
                  />
                  <View className="absolute inset-0 bg-black/10" />
                </>
              ) : (
                <>
                  <Image
                    source={{
                      uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3SI7ZozL6Ty8bYxPxcPEgufRNu54weHaJWR1Nksas5LNYUcjp3LtkCAnWPHo96TibgdFMcfhCUwHQvX1w4TfD3D7JNf69Xqmu3fSCIshRpJjqhvdWreph__lu9QAOmV7cNpRyq-M8XdXAsxpJECXEK7VGzJeKWiJVYHwtn06L3Pc9ePDA6d1_mmkPe6RqOKPWj8ezSf6-OmCqll4-Zt2GNwj8iYCUWFK_TzG26MMnb-LIHfucTtzgwNHEMZpjqoBNGsSeo8mqcHWm",
                    }}
                    className="absolute inset-0 h-full w-full opacity-40"
                    contentFit="cover"
                  />
                  <View className="z-10 items-center gap-4">
                    <View className="h-16 w-16 items-center justify-center rounded-full border border-outline-variant/15 bg-surface-container-high/80">
                      <Ionicons name="camera" size={32} color="#fff6df" />
                    </View>
                    <Text className="font-label text-sm uppercase tracking-[0.1em] text-primary">
                      Tap to choose cover image
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Pressable>

          <View className="mb-8 rounded-lg border border-outline-variant/10 bg-surface-container-high/40 p-6">
            <Text className="mb-4 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              The Title
            </Text>
            <TextInput
              multiline
              value={title}
              onChangeText={setTitle}
              placeholder="Write the memory title"
              placeholderTextColor="#353534"
              maxLength={TITLE_CHAR_LIMIT}
              className="min-h-[120px] flex-1 font-headline text-xl text-on-surface"
            />
            <Text className="mt-2 text-right font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {title.length}/{TITLE_CHAR_LIMIT}
            </Text>
            <View className="mt-4 gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container-low px-4 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name={recording ? "radio" : "mic"}
                    size={18}
                    color="#ffd700"
                  />
                  <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {recording
                      ? `Recording ${formatDuration(recordingMillis)}`
                      : voiceUri
                        ? `Voice memo ready (${voiceDuration ?? "00:00"})`
                        : "Optional voice memo"}
                  </Text>
                </View>
                <Pressable
                  onPress={recording ? stopVoiceRecording : startVoiceRecording}
                  className={`rounded-full px-4 py-2 ${recording ? "bg-error/20" : "bg-primary-container/20"}`}
                >
                  <Text
                    className={`font-label text-[10px] font-bold uppercase tracking-widest ${recording ? "text-error" : "text-primary"}`}
                  >
                    {recording ? "Stop" : "Record"}
                  </Text>
                </Pressable>
              </View>
              {voiceUri ? (
                <Pressable
                  onPress={() => {
                    setVoiceUri(null);
                    setVoiceDuration(null);
                  }}
                  className="self-start rounded-full border border-outline-variant/20 px-3 py-1.5"
                >
                  <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Remove voice memo
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View className="mb-6 rounded-lg border border-outline-variant/10 bg-surface-container-high/40 p-6">
            <Text className="mb-4 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              End Words
            </Text>
            <TextInput
              multiline
              value={reflection}
              onChangeText={setReflection}
              placeholder="Your final words to the class..."
              placeholderTextColor="#353534"
              maxLength={END_WORDS_CHAR_LIMIT}
              className="min-h-[80px] font-headline text-xl text-on-surface"
            />
            <Text className="mt-2 text-right font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {reflection.length}/{END_WORDS_CHAR_LIMIT}
            </Text>
          </View>

          <View className="mb-8 flex-row items-center gap-4 rounded-lg border border-outline-variant/10 bg-surface-container-high/40 p-6">
            <Ionicons name="pricetag-outline" size={24} color="#d0c6ab" />
            <View className="flex-1">
              <Text className="mb-1 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Memory Tags
              </Text>
              <TextInput
                value={tagsText}
                onChangeText={setTagsText}
                placeholder="Add tags (e.g., #graduation #memories)"
                placeholderTextColor="#353534"
                className="font-body text-base text-on-surface"
              />
            </View>
          </View>
        </ScrollView>
        <View
          className="border-t border-outline-variant/20 bg-surface/90 px-6 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <PrimaryButton
            label={loading ? "Saving..." : "Share Memory"}
            onPress={handleShareMemory}
            className="h-16"
            textClassName="font-headline text-xl font-extrabold tracking-tight"
            disabled={loading}
          />
          {loading ? (
            <View className="mt-3 flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#ffd700" />
              <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Uploading memory...
              </Text>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
