const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

export function fitWithin(width: number, height: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Shrinks a photo to a ~1600 px JPEG on the device before upload (phone photos are often 5+ MB).
 * Falls back to the original file when the browser can't decode it (e.g. HEIC outside Safari).
 */
export async function compressPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_EDGE);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
