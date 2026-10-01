export type DetectedImageType = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];
const WEBP_SIGNATURE_OFFSET = 8;

const startsWith = (bytes: Uint8Array, signature: readonly number[], offset = 0): boolean =>
  signature.every((expectedByte, index) => bytes[offset + index] === expectedByte);

export const detectImageType = (bytes: Uint8Array): DetectedImageType | null => {
  if (startsWith(bytes, JPEG_SIGNATURE)) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }
  if (startsWith(bytes, PNG_SIGNATURE)) {
    return { contentType: "image/png", extension: "png" };
  }
  if (
    startsWith(bytes, RIFF_SIGNATURE) &&
    startsWith(bytes, WEBP_SIGNATURE, WEBP_SIGNATURE_OFFSET)
  ) {
    return { contentType: "image/webp", extension: "webp" };
  }
  return null;
};
