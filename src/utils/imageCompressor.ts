/**
 * Compresses an image file client-side using an offscreen HTML Canvas.
 * Prevents localStorage quota exceeded errors by keeping image data URLs
 * around 40KB - 90KB instead of 5MB - 15MB.
 */
export function compressImageFile(
  fileOrDataUrl: File | string,
  maxWidth = 700,
  maxHeight = 700,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImageSource = (src: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => reject(new Error('Erro ao processar imagem'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(src);
          return;
        }

        // Fill crisp white background so transparent PNGs and photos look sharp on product cards
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-performance JPEG to guarantee small footprint (30KB - 60KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = src;
    };

    if (typeof fileOrDataUrl === 'string') {
      processImageSource(fileOrDataUrl);
    } else {
      if (!fileOrDataUrl.type.startsWith('image/')) {
        reject(new Error('Ficheiro não é uma imagem válida'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Erro ao ler ficheiro'));
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          reject(new Error('Resultado de imagem inválido'));
          return;
        }
        processImageSource(result);
      };
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
