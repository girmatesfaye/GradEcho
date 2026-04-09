import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

import { supabase } from "@/lib/supabase";

const MEMORY_MEDIA_BUCKET = "memory-media";

export async function normalizeImage(uri: string) {
  console.log("[storage] normalizeImage:start", { uri });

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      {
        compress: 0.72,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    console.log("[storage] normalizeImage:success", {
      inputUri: uri,
      outputUri: result.uri,
      outputIsFileUri: result.uri.startsWith("file://"),
    });

    return result.uri;
  } catch (error) {
    console.warn("[storage] normalizeImage:failed", { uri, error });
    return uri;
  }
}

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(uri);
    if (response.ok) {
      console.log("[storage] uriToArrayBuffer:fetch-success", {
        uri,
        status: response.status,
      });
      return response.arrayBuffer();
    }
    console.warn("[storage] uriToArrayBuffer:fetch-non-ok", {
      uri,
      status: response.status,
    });
  } catch {
    // Fall back to reading from the local filesystem.
    console.warn("[storage] uriToArrayBuffer:fetch-failed", { uri });
  }

  const fileInfo = await FileSystem.getInfoAsync(uri);
  console.log("[storage] uriToArrayBuffer:filesystem-fallback", {
    uri,
    exists: fileInfo.exists,
    size: fileInfo.exists ? fileInfo.size : null,
  });

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
  console.log("[storage] uploadMemoryImage:normalize-start", { userId, uri });
  const normalizedUri = uri ? await normalizeImage(uri) : undefined;
  const filePath = `${userId}/${Date.now()}.jpg`;
  const mimeType = "image/jpeg";

  console.log("[storage] uploadMemoryImage:start", {
    userId,
    inputUri: uri,
    normalizedUri,
    filePath,
  });

  let bytes: ArrayBuffer;
  try {
    const source = normalizedUri ?? uri;
    if (!source) {
      throw new Error("No image source provided.");
    }

    bytes = await uriToArrayBuffer(source);
    console.log("[storage] uploadMemoryImage:bytes-ready", {
      filePath,
      byteLength: bytes.byteLength,
      strategy: "uri-to-array-buffer",
    });
  } catch (error) {
    console.error("[storage] uploadMemoryImage:read-failed", {
      inputUri: uri,
      normalizedUri,
      error,
    });
    throw new Error("Could not read selected image file.");
  }

  const { data, error } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .upload(filePath, bytes, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("[storage] uploadMemoryImage:error", { filePath, error });
    throw error;
  }

  const persistedPath = data?.path ?? filePath;
  const { data: verifyData, error: verifyError } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .createSignedUrl(persistedPath, 60);

  console.log("[storage] uploadMemoryImage:verify-result", {
    persistedPath,
    hasSignedUrl: Boolean(verifyData?.signedUrl),
    verifyError: verifyError?.message,
  });

  if (verifyError || !verifyData?.signedUrl) {
    console.error("[storage] uploadMemoryImage:verify-failed", {
      requestedPath: filePath,
      persistedPath,
      verifyError,
    });
    throw new Error("Image uploaded but verification failed.");
  }

  console.log("[storage] uploadMemoryImage:success", {
    requestedPath: filePath,
    persistedPath,
  });

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
