import { supabase } from "@/lib/supabase";

const MEMORY_MEDIA_BUCKET = "memory-media";

function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      resolve(xhr.response as Blob);
    };

    xhr.onerror = () => {
      reject(new Error("Failed to read file for upload."));
    };

    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send();
  });
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
}: {
  userId: string;
  uri: string;
}) {
  const fileExtension = getFileExtension(uri);
  const mimeType = getMimeTypeFromExtension(fileExtension);
  const filePath = `${userId}/${Date.now()}.${fileExtension}`;

  const blob = await uriToBlob(uri);

  const { error } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .upload(filePath, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadMemoryAudio({
  userId,
  uri,
}: {
  userId: string;
  uri: string;
}) {
  const fileExtension = getFileExtension(uri, "m4a");
  const mimeType = getAudioMimeTypeFromExtension(fileExtension);
  const filePath = `${userId}/${Date.now()}-voice.${fileExtension}`;

  const blob = await uriToBlob(uri);

  const { error } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .upload(filePath, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
