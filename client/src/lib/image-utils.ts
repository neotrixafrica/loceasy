/**
 * Convert an image to WebP format with optional resizing
 * @param file - The image file to convert
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1080)
 * @param quality - WebP quality (0-1, default: 0.8)
 * @returns Promise<File> - The converted WebP file
 */
export async function convertToWebP(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }

          // Create new File with WebP extension
          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image by converting to WebP
 * @param file - The image file to compress
 * @returns Promise<File> - The compressed WebP file
 */
export async function compressImage(file: File): Promise<File> {
  // Use smaller dimensions for identity documents
  return convertToWebP(file, 1200, 1200, 0.75);
}
