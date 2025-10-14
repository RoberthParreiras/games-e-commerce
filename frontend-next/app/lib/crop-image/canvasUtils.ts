const MAX_MB = 1 * 1024 * 1024;

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Flip = {
  horizontal: boolean;
  vertical: boolean;
};

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    // needed to avoid cross-origin issues on CodeSandbox
    image.crossOrigin = "anonymous";
    image.src = url;
  });

export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  flip: Flip = { horizontal: false, vertical: false },
  targetSize: number = 400, // default square 400px x 400px
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation,
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = targetSize;
  croppedCanvas.height = targetSize;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize,
    targetSize,
  );

  const createdBlob = await imageCompression(croppedCanvas);

  return URL.createObjectURL(createdBlob as Blob);
}

async function createBlob(
  croppedCanvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise<Blob>((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }
        resolve(blob);
      },
      "image/png",
      quality,
    );
  });
}

async function imageCompression(canvas: HTMLCanvasElement) {
  let low = 0.0;
  let high = 1.0;
  let bestBlob: Blob | null = null;
  const precision = 0.01;
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    // Stop when the search range is small enough
    if (high - low <= precision) {
      break;
    }

    const mid = low + (high - low) / 2;
    const currentBlob = await createBlob(canvas, mid);

    if (currentBlob && currentBlob.size > MAX_MB) {
      high = mid;
    } else {
      bestBlob = currentBlob;
      low = mid;
    }
  }

  // if the image is too big, compress to the lowest value possible
  if (!bestBlob) {
    bestBlob = await createBlob(canvas, 0.1);
  }

  return bestBlob;
}

export async function getRotatedImage(
  imageSrc: string,
  rotation = 0,
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const orientationChanged =
    rotation === 90 ||
    rotation === -90 ||
    rotation === 270 ||
    rotation === -270;
  if (orientationChanged) {
    canvas.width = image.height;
    canvas.height = image.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create blob from canvas"));
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

export function readFile(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.addEventListener("error", (err) => reject(err), false);
    reader.readAsDataURL(file);
  });
}
