"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Box, Button as ButtonMui } from "@mui/material";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { Modal } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useFormContext } from "react-hook-form";

import { getCroppedImg, readFile } from "@/app/lib/crop-image/canvasUtils";
import { Input } from "@/app/components/ui/input";
import { CustomButton } from "./base/button";

type Crop = { x: number; y: number };
type CropImageModalProps = {
  image: string;
  index: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PixelArea = any; // keep flexible for react-easy-crop typings; refine if needed

function CropImageModalEdit({ image, index }: CropImageModalProps) {
  const { setValue, getValues } = useFormContext();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasImageSrc, setHasImageSrc] = useState(false);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelArea | null>(
    null,
  );
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleHasImage = () => {
    setHasImageSrc(true);
  };

  const handleHasNotImage = () => {
    setHasImageSrc(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (image) {
      setImageSrc(image);
      setCroppedImage(image);
      handleHasNotImage();
    }
  }, [image]);

  const onCropComplete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (croppedArea: any, croppedAreaPixelsArg: PixelArea) => {
      setCroppedAreaPixels(croppedAreaPixelsArg);
    },
    [],
  );

  const showCroppedImage = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const cropped = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        undefined,
        undefined,
        400,
      );

      if (!cropped) {
        console.error("Failed to crop image.");
        return;
      }

      setCroppedImage(cropped);

      // Convert Data URL to Blob
      const response = await fetch(cropped);
      const blob = await response.blob();
      const file = new File([blob], `image-${index}.jpg`, { type: blob.type });

      const currentImages = getValues("images") || [];
      const newImages = [...currentImages];
      newImages[index] = file;
      setValue("images", newImages, { shouldValidate: true });

      handleClose();
    } catch (e) {
      console.error(e);
    }
  }, [
    imageSrc,
    croppedAreaPixels,
    index,
    setImageSrc,
    setValue,
    getValues,
    handleClose,
  ]);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const imageDataUrl = (await readFile(file)) as string;

        setImageSrc(imageDataUrl);
        handleHasImage();
        handleOpen();
      }
    },
    [handleHasImage, handleOpen],
  );

  const handleRemoveImage = () => {
    setImageSrc(null);
    setCroppedImage(null);

    const currentImages = getValues("images") || [];
    const newImages = [...currentImages];
    newImages[index] = undefined;
    setValue("images", newImages, { shouldValidate: true });
  };

  return (
    <div>
      {hasImageSrc ? (
        <div className="flex-start flex">
          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90vw",
                height: "90vh",
                bgcolor: "#222831",
                boxShadow: 24,
                p: 4,
                outline: "none",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                color: "#DFD0B8",
              }}
            >
              <div style={{ position: "relative", flex: "1" }}>
                <Cropper
                  image={imageSrc!}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="flex flex-col justify-center pt-4">
                <div className="mx-auto flex w-full max-w-md flex-col justify-center">
                  <Typography variant="overline">Zoom</Typography>
                  <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(_, value) => setZoom(value as number)}
                  />
                </div>
                <div className="mx-auto mt-4 flex w-full max-w-md flex-row justify-between gap-4">
                  <ButtonMui
                    onClick={() => {
                      handleClose();
                      handleHasNotImage();
                      setImageSrc("");
                    }}
                    sx={{
                      backgroundColor: "#DFD0B8",
                      color: "#222831",
                      height: "3rem",
                      flex: 1,
                      "&:hover": {
                        backgroundColor: "#cbb89d",
                      },
                    }}
                  >
                    Cancel
                  </ButtonMui>
                  <ButtonMui
                    onClick={() => {
                      handleHasNotImage();
                      showCroppedImage();
                    }}
                    sx={{
                      backgroundColor: "#DFD0B8",
                      color: "#222831",
                      height: "3rem",
                      flex: 1,
                      "&:hover": {
                        backgroundColor: "#cbb89d",
                      },
                    }}
                  >
                    Save
                  </ButtonMui>
                </div>
              </div>
            </Box>
          </Modal>
        </div>
      ) : (
        <>
          {imageSrc ? (
            <div className="mb-4 flex flex-col items-center md:flex-row md:justify-between">
              <div className="mb-4 flex flex-col justify-around gap-4 md:flex-row md:justify-center md:gap-8">
                <label
                  htmlFor={`file-upload-${index}`}
                  className="flex h-12 w-52 items-center justify-center rounded bg-[#DFD0B8] text-center text-[#222831] hover:cursor-pointer hover:bg-[#cbb89d]"
                >
                  <span>Change the image</span>
                  <Input
                    id={`file-upload-${index}`}
                    type="file"
                    onChange={onFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <CustomButton visual="primary" onClick={handleRemoveImage}>
                  Remove Image
                </CustomButton>
              </div>
              <div className="border">
                <img src={croppedImage!} alt="preview image" className="w-52 h-52"/>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex flex-col items-center md:flex-row md:justify-between">
              <label
                htmlFor={`file-upload-${index}`}
                className="mb-4 flex h-12 w-52 w-6 items-center justify-center rounded bg-[#DFD0B8] text-center text-[#222831] hover:cursor-pointer hover:bg-[#cbb89d]"
              >
                <span>Select an image</span>
                <Input
                  id={`file-upload-${index}`}
                  type="file"
                  onChange={onFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <div className="border border-[#DFD0B8]">
                <SportsEsportsIcon
                  sx={{ width: "208px", height: "208px", color: "#DFD0B8" }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CropImageModalEdit;
