import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

import { supabase } from "@/lib/supabase";

const MEMORY_MEDIA_BUCKET = "memory-media";

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

function getMimeTypeFromExtension(extension: string) {
  switch (extension.toLowerCase()) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/heic";
    default:
      return "image/jpeg";
  }
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
  base64,
  extension,
}: {
  userId: string;
  uri?: string;
  base64?: string;
  extension?: string;
}) {
  const useBase64Upload = Boolean(base64);
  const fileExtension = useBase64Upload
    ? "jpg"
    : extension ?? getFileExtension(uri ?? "", "jpg");
  const mimeType = useBase64Upload
    ? "image/jpeg"
    : getMimeTypeFromExtension(fileExtension);
  const filePath = `${userId}/${Date.now()}.${fileExtension}`;

  let bytes: ArrayBuffer;
  try {
    if (base64) {
      bytes = decode(base64);
    } else if (uri) {
      bytes = await uriToArrayBuffer(uri);
    } else {
      throw new Error("No image source provided.");
    }
  } catch {
    throw new Error("Could not read selected image file.");
  }

  const { error } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .upload(filePath, bytes, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Persist storage object path; consumers can resolve signed/public URLs as needed.
  return filePath;
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

  const { error } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .upload(filePath, bytes, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Persist storage object path; consumers can resolve signed/public URLs as needed.
  return filePath;
}
