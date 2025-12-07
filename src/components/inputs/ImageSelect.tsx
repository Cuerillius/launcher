"use client";

import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SGDBImage } from "@/services/steamgriddb";
import { ScrollArea } from "../ui/scroll-area";

// Define the available aspect ratio types
export type ImageRatio = "poster" | "video" | "square" | "logo";

interface ImageSelectProps {
  images: SGDBImage[];
  value?: string;
  onChange?: (url: string) => void;
  className?: string;
  ratio?: ImageRatio;
}

// Configuration for different aspect ratios
const RATIO_CONFIG = {
  poster: {
    trigger: "w-32 h-48",
    item: "aspect-[2/3]",
    grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    objectFit: "object-cover",
  },
  video: {
    trigger: "w-64 h-36",
    item: "aspect-video",
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    objectFit: "object-cover",
  },
  square: {
    trigger: "w-40 h-40",
    item: "aspect-square",
    grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    objectFit: "object-cover",
  },
  logo: {
    trigger: "w-64 h-32",
    item: "aspect-video",
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    objectFit: "object-contain p-8",
  },
};

export default function ImageSelect({
  images,
  value,
  onChange,
  className,
  ratio = "poster",
}: ImageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();
  const config = RATIO_CONFIG[ratio];

  const selectedItem = images.find((item) => item.url === value) || images[0];
  const remainingImages = images.filter((img) => img.url !== selectedItem?.url);

  // Background images for the stack effect
  const backImage1 = remainingImages[0];
  const backImage2 = remainingImages[1];

  const handleSelect = (url: string) => {
    if (onChange) onChange(url);
    setIsOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length !== 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* TRIGGER BUTTON */}
      <motion.div
        layoutId={`container-${uniqueId}`}
        onClick={handleClick}
        className={cn(
          "group relative flex cursor-pointer items-center justify-center outline-none",
          config.trigger
        )}
      >
        {/* Stack Layer 2 */}
        <div className="absolute inset-0 rotate-[-12deg] transform overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 opacity-60 shadow-sm transition-transform duration-300 group-hover:rotate-[-18deg] group-hover:translate-x-[-10px]">
          {backImage2 && (
            <img
              src={backImage2.thumb}
              alt=""
              className={cn(
                "h-full w-full opacity-50 grayscale",
                config.objectFit
              )}
            />
          )}
        </div>

        {/* Stack Layer 1 */}
        <div className="absolute inset-0 rotate-[-6deg] transform overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 opacity-80 shadow-sm transition-transform duration-300 group-hover:rotate-[-9deg] group-hover:translate-x-[-5px]">
          {backImage1 && (
            <img
              src={backImage1.thumb}
              alt=""
              className={cn("h-full w-full", config.objectFit)}
            />
          )}
        </div>

        {/* Main Card */}
        <motion.div
          className="absolute inset-0 z-10 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-xl transition-colors duration-300 group-hover:border-zinc-500"
          layoutId={`card-${uniqueId}`}
        >
          {selectedItem ? (
            <motion.img
              layoutId={`image-${uniqueId}-${selectedItem.id}`}
              src={selectedItem.thumb}
              className={cn("h-full w-full", config.objectFit)}
              alt="Selected"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
              <span className="text-xs">No Images</span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-black/60 px-2 text-xs font-medium text-white backdrop-blur-md">
            {images.length}
          </div>
        </motion.div>
      </motion.div>

      {/* EXPANDED OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            <ScrollArea className="absolute inset-0 z-[99]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              <motion.div
                layoutId={`container-${uniqueId}`}
                className="relative z-[101] flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-zinc-100">
                    Select Artwork
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
                  <div className={cn("grid gap-4", config.grid)}>
                    {images.map((item) => {
                      const isSelected = value === item.url;

                      return (
                        <motion.div
                          key={item.id}
                          onClick={() => handleSelect(item.url)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-900 transition-all duration-200",
                            // Border logic updated to match reference
                            "border-2",
                            isSelected
                              ? "border-white"
                              : "border-transparent hover:border-zinc-700",
                            config.item
                          )}
                        >
                          {/* Radio Button Indicator */}
                          <div className="absolute right-3 top-3 z-20">
                            <div
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                                isSelected
                                  ? "border-white bg-transparent"
                                  : "border-zinc-500 bg-black/40 group-hover:border-zinc-300"
                              )}
                            >
                              {isSelected && (
                                <div className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <motion.div
                              layoutId={`card-${uniqueId}`}
                              className="absolute inset-0 z-0 bg-zinc-800"
                              transition={{ duration: 0.2 }}
                            />
                          )}

                          <motion.img
                            layoutId={
                              isSelected
                                ? `image-${uniqueId}-${item.id}`
                                : undefined
                            }
                            src={item.thumb}
                            className={cn(
                              "relative z-10 h-full w-full transition-transform duration-500",
                              // Slightly darken unselected images to make the selected one pop more
                              !isSelected && "group-hover:opacity-80",
                              config.objectFit
                            )}
                            loading="lazy"
                            alt=""
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </ScrollArea>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
