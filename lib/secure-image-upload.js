const IMAGE_RULES = {
  "image/jpeg": {
    extension: "jpg",
    valid: (b) => b.length >= 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9,
  },
  "image/png": {
    extension: "png",
    valid: (b) => b.length >= 24 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && b.toString("ascii", 12, 16) === "IHDR",
  },
  "image/webp": {
    extension: "webp",
    valid: (b) => b.length >= 16 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" && b.readUInt32LE(4) + 8 <= b.length,
  },
};

export async function inspectImageUpload(file, maxBytes) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return { error: "Please select an image." };
  }
  if (file.size < 1 || file.size > maxBytes) {
    return { error: `Image must be no larger than ${Math.floor(maxBytes / (1024 * 1024))} MB.` };
  }
  const rule = IMAGE_RULES[file.type];
  if (!rule) return { error: "Only JPG, PNG or WebP images are accepted. SVG and other file types are not allowed." };
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length !== file.size || !rule.valid(bytes)) {
    return { error: "The file content does not match a supported image format." };
  }
  return { bytes, extension: rule.extension, contentType: file.type };
}
