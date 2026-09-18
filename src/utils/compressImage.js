// Resizes + re-encodes an image file in the browser before upload, using the
// Canvas API — no extra npm dependency needed. This makes avatar uploads
// (and therefore the whole register request) noticeably faster, since a
// phone photo can easily be 3-8MB while a 400px JPEG at 80% quality is
// typically under 150KB.
//
// Usage: const smallFile = await compressImage(originalFile);

const DEFAULT_MAX_DIMENSION = 500; // px, longest side
const DEFAULT_QUALITY = 0.8; // 0-1, JPEG quality

export function compressImage(
  file,
  { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = {}
) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }
          // Keep a sensible filename/extension since the backend just
          // forwards this to Cloudinary as-is.
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, "") + ".jpg",
            { type: "image/jpeg" }
          );
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image for compression"));
    };

    img.src = objectUrl;
  });
}
