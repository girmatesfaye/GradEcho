import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

import { supabase } from "@/lib/supabase";

const MEMORY_MEDIA_BUCKET = "memory-media";

export async function normalizeImage(uri: string) {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      {
        compress: 0.72,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    return result.uri;
  } catch {
    return uri;
  }
}

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(uri);
    if (response.ok) {
      return response.arrayBuffer();
    }
  } catch {
    // Fall back to reading from the local filesystem.
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return decode(base64);
}

function getFileExtension(uri: string, fallback = "jpg") {
  const match = uri.split(".").pop()?.split("?")[0]?.split("#")[0];
  if (!match || match.length > 5) {
    return fallback;
  }

  return match;
}

function getAudioMimeTypeFromExtension(extension: string) {
  switch (extension.toLowerCase()) {
    case "m4a":
      return "audio/mp4";
    case "aac":
      return "audio/aac";
    case "wav":
      return "audio/wav";
    case "mp3":
      return "audio/mpeg";
    case "caf":
      return "audio/x-caf";
    default:
      return "audio/mp4";
  }
}

export async function uploadMemoryImage({
  userId,
  uri,
}: {
  userId: string;
  uri?: string;
}) {
  const normalizedUri = uri ? await normalizeImage(uri) : undefined;
  const filePath = `${userId}/${Date.now()}.jpg`;
  const mimeType = "image/jpeg";

  let bytes: ArrayBuffer;
  try {
    const source = normalizedUri ?? uri;
    if (!source) {
      throw new Error("No image source provided.");
    }

    bytes = await uriToArrayBuffer(source);
  } catch {
    throw new Error("Could not read selected image file.");
  }

  const { data, error } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .upload(filePath, bytes, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const persistedPath = data?.path ?? filePath;
  const { data: verifyData, error: verifyError } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .createSignedUrl(persistedPath, 60);

  if (verifyError || !verifyData?.signedUrl) {
    throw new Error("Image uploaded but verification failed.");
  }

  return persistedPath;
}

export async function uploadMemoryAudio({
  userId,
  uri,
  base64,
  extension,
}: {
  userId: string;
  uri?: string;
  base64?: string;
  extension?: string;
}) {
  const fileExtension = extension ?? getFileExtension(uri ?? "", "m4a");
  const mimeType = getAudioMimeTypeFromExtension(fileExtension);
  const filePath = `${userId}/${Date.now()}-voice.${fileExtension}`;

  let bytes: ArrayBuffer;
  try {
    if (base64) {
      bytes = decode(base64);
    } else if (uri) {
      bytes = await uriToArrayBuffer(uri);
    } else {
      throw new Error("No audio source provided.");
    }
  } catch {
    throw new Error("Could not read recorded audio file.");
  }

  const { data, error } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .upload(filePath, bytes, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data?.path ?? filePath;
}
