/**
 * Image compression utility using native HTML Canvas
 * Dramatically reduces file size before storing in Firestore or sending to backend.
 * Typically shrinks a 2-5 MB mobile camera photo down to 30-80 KB while keeping sharp readability.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.75)
  format?: 'image/jpeg' | 'image/webp';
}

/**
 * Compresses an image File or Blob and returns a compressed data URL (base64 string).
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; originalSize: number; compressedSize: number; ratio: number }> {
  const {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.75,
    format = 'image/jpeg',
  } = options;

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Impossible de décoder l'image."));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio downscaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Contexte canvas indisponible"));
          return;
        }

        // Fill white background for transparent PNGs converted to JPEG
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        // Draw downscaled image with smooth interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export compressed Data URL
        const dataUrl = canvas.toDataURL(format, quality);
        
        // Approximate byte size of base64
        const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
        const compressedSize = Math.round((stringLength * 3) / 4);
        const ratio = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

        resolve({
          dataUrl,
          originalSize,
          compressedSize,
          ratio: Math.max(0, ratio),
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to human readable format (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
