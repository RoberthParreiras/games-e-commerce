"use client";

import React, { useState, useCallback } from "react";
import { Box, Button as ButtonMui } from "@mui/material";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { Modal } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useFormContext } from "react-hook-form";

import { getCroppedImg, readFile } from "@/app/lib/crop-image/canvasUtils";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

type Crop = { x: number; y: number };

type PixelArea = any; // keep flexible for react-easy-crop typings; refine if needed

function CropImageModal() {
  const { setValue } = useFormContext();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasImageSrc, setHasImageSrc] = useState(false);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelArea | null>(
    null
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

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixelsArg: PixelArea) => {
      setCroppedAreaPixels(croppedAreaPixelsArg);
    },
    []
  );

  const showCroppedImage = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const cropped = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        undefined,
        undefined,
        400
      );

      if (!cropped) {
        console.error("Failed to crop image.");
        return;
      }

      setCroppedImage(cropped);

      // Convert Data URL to Blob
      const response = await fetch(cropped);
      const blob = await response.blob();

      // Set the Blob in the form
      setValue("image", blob, { shouldValidate: true });

      handleClose();
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  // const onClose = useCallback(() => {
  //   setCroppedImage(null);
  // }, []);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        let imageDataUrl = (await readFile(file)) as string;

        setImageSrc(imageDataUrl);
        handleHasImage();
        handleOpen();
      }
    },
    []
  );

  return (
    <div>
      {hasImageSrc ? (
        <div className="flex flex-start">
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
                <div className="flex flex-col justify-center w-full max-w-md mx-auto">
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
                <div className="mx-auto w-full max-w-md gap-4 flex flex-row justify-between mt-4">
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
            <div className="flex flex-col md:flex-row items-center md:justify-between mb-4">
              <div className="flex justify-around md:justify-center md:gap-8 mb-4">
                <label
                  htmlFor="file-upload"
                  className="bg-[#DFD0B8] text-[#222831] text-center rounded h-12 w-52 flex items-center justify-center hover:bg-[#cbb89d] hover:cursor-pointer"
                >
                  <span>Change the image</span>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={onFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <Button
                  onClick={() => setImageSrc("")}
                  className="bg-[#DFD0B8] text-[#222831] h-12 w-52 hover:bg-[#cbb89d] hover:cursor-pointer"
                >
                  Remove image
                </Button>
              </div>
              <div className="border">
                <img src={croppedImage!} alt="preview image" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:justify-between mb-4">
              <label
                htmlFor="file-upload"
                className="bg-[#DFD0B8] text-[#222831] mb-4 text-center rounded h-12 w-52 flex items-center justify-center hover:bg-[#cbb89d] hover:cursor-pointer"
              >
                <span>Select an image</span>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={onFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <div className="border border-[#DFD0B8]">
                <SportsEsportsIcon
                  sx={{ width: "400px", height: "400px", color: "#DFD0B8" }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CropImageModal;
