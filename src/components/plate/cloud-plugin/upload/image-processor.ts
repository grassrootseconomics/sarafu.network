interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  type?: string;
  maxSizeInMB?: number;
}

export async function processImage(
  file: File,
  {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    type = "image/jpeg",
    maxSizeInMB = 1,
  }: ProcessImageOptions = {}
): Promise<File> {
  console.debug(
    `Processing image: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
  );

  // Return original file if not an image
  if (!file.type.startsWith("image/")) {
    console.debug(`Skipping non-image file: ${file.type}`);
    return file;
  }

  // Create image element
  const img = new Image();
  const imageUrl = URL.createObjectURL(file);

  try {
    // Load image
    console.debug("Loading image...");
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = (error) => {
        console.error("Failed to load image:", error);
        reject(error);
      };
      img.src = imageUrl;
    });

    // Calculate new dimensions
    let width = img.width;
    let height = img.height;
    let currentQuality = quality;

    console.debug(`Original dimensions: ${width}x${height}`);

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
      console.debug(
        `Resizing to: ${width}x${height} (ratio: ${ratio.toFixed(2)})`
      );
    } else {
      console.debug("No resize needed - image within size limits");
    }

    // Create canvas and resize image
    console.debug("Creating canvas...");
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    console.debug("Drawing image to canvas...");
    ctx.drawImage(img, 0, 0, width, height);

    // Try to get file size under maxSizeInMB with up to 3 attempts
    let attempts = 0;
    let blob: Blob;

    console.debug(`Starting compression (target: ${maxSizeInMB}MB)...`);
    do {
      blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), type, currentQuality);
      });

      console.debug(
        `Attempt ${attempts + 1}: ` +
          `Size: ${(blob.size / 1024 / 1024).toFixed(2)}MB, ` +
          `Quality: ${currentQuality.toFixed(2)}`
      );

      if (blob.size > maxSizeInMB * 1024 * 1024 && attempts < 3) {
        currentQuality *= 0.8;
        console.debug(
          `Size too large, reducing quality to ${currentQuality.toFixed(2)}`
        );
      }

      attempts++;
    } while (blob.size > maxSizeInMB * 1024 * 1024 && attempts < 3);

    // Create new file with metadata
    const newFile = new File(
      [blob],
      file.name.replace(/\.[^/.]+$/, "") + ".webp",
      {
        type,
        lastModified: file.lastModified,
      }
    );

    // Log final results
    const compressionRatio = ((1 - newFile.size / file.size) * 100).toFixed(1);
    console.debug(
      "📸 Image processing complete:\n" +
        `• Dimensions: ${width}x${height}\n` +
        `• Quality: ${currentQuality.toFixed(2)}\n` +
        `• Format: ${type}\n` +
        `• Original: ${(file.size / 1024).toFixed(1)}KB\n` +
        `• Processed: ${(newFile.size / 1024).toFixed(1)}KB\n` +
        `• Reduction: ${compressionRatio}%\n` +
        `• Attempts: ${attempts}`
    );

    return newFile;
  } catch (error) {
    console.error("❌ Image processing failed:", error);
    throw error;
  } finally {
    console.debug("Cleaning up resources...");
    URL.revokeObjectURL(imageUrl);
  }
}
