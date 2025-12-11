import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, useRef, ChangeEvent } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { X, Upload } from "lucide-react";
import {
  ArtworkProvider,
  ArtworkRatio,
  ArtworkResource,
} from "@/types/Artwork";
import { Button } from "../ui/button";

interface ImageSelectProps {
  selectableImages: ArtworkResource[];
  value?: ArtworkResource;
  onChange?: (artworkResource: ArtworkResource) => void;
  className?: string;
  ratio?: ArtworkRatio;
}

// Updated configuration to rely on Aspect Ratio classes rather than fixed widths
const RATIO_CONFIG = {
  poster: {
    aspect: "aspect-[2/3]",
    grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    objectFit: "object-cover",
  },
  video: {
    aspect: "aspect-video",
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    objectFit: "object-cover",
  },
  square: {
    aspect: "aspect-square",
    grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    objectFit: "object-cover",
  },
  logo: {
    aspect: "aspect-[2/1]", // Slightly wider for logos
    grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    objectFit: "object-contain p-8",
  },
};

function ArtworkSelect({
  selectableImages,
  value,
  onChange,
  className,
  ratio = ArtworkRatio.Poster,
}: ImageSelectProps) {
  const config = RATIO_CONFIG[ratio];
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayedImages = useMemo(() => {
    const images: string[] = [];
    if (value?.path) {
      images.push(value.path);
    }
    if (selectableImages) {
      const firstThree = selectableImages
        .slice(0, 3)
        .filter((img) => img?.path);
      images.push(...firstThree.map((img) => img.thumb || img.path));
    }
    return images;
  }, [selectableImages, value]);

  const handleSelect = (artworkResource: ArtworkResource) => {
    if (onChange) onChange(artworkResource);
    setIsOpen(false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChange) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange({
          remoteId: -1,
          provider: ArtworkProvider.LOCAL,
          path: base64,
          thumb: URL.createObjectURL(file),
        });
      };
      reader.readAsDataURL(file);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("relative block w-full", className)}>
      <motion.div
        className={cn(
          "group relative w-full cursor-pointer outline-none",
          config.aspect // Applies the aspect ratio to the main container
        )}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Background Card 2 (Bottom) */}
        <div
          className={cn(
            "absolute inset-0 z-0",
            "transform rounded-xl border border-zinc-800 bg-zinc-900 opacity-60 shadow-sm",
            "transition-all duration-300 ease-out",
            "rotate-[-6deg] scale-95 origin-bottom-right", // Default state
            "group-hover:rotate-[-8deg] group-hover:translate-x-[-8px]" // Hover state
          )}
        >
          {displayedImages.length > 2 && (
            <img
              src={displayedImages[2]}
              alt=""
              className={cn(
                "h-full w-full rounded-xl opacity-50 grayscale",
                config.objectFit
              )}
            />
          )}
        </div>

        {/* Background Card 1 (Middle) */}
        <div
          className={cn(
            "absolute inset-0 z-10",
            "transform rounded-xl border border-zinc-800 bg-zinc-900 opacity-80 shadow-sm",
            "transition-all duration-300 ease-out",
            "rotate-[-3deg] scale-98 origin-bottom-right", // Default state
            "group-hover:rotate-[-4deg] group-hover:translate-x-[-4px]" // Hover state
          )}
        >
          {displayedImages.length > 1 && (
            <img
              src={displayedImages[1]}
              alt=""
              className={cn("h-full w-full rounded-xl", config.objectFit)}
            />
          )}
        </div>

        {/* Foreground Card (Selected) */}
        <motion.div
          className={cn(
            "absolute inset-0 z-20 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-xl",
            "transition-colors duration-300 group-hover:border-zinc-500"
          )}
        >
          {displayedImages.length > 0 ? (
            <motion.img
              src={displayedImages[0]}
              className={cn("h-full w-full", config.objectFit)}
              alt="Selected"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500 flex-col gap-2">
              <span className="text-sm font-medium">Select Image</span>
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-black/60 px-2.5 text-xs font-medium text-white backdrop-blur-md">
            {selectableImages.length}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-[99]"
            />

            {/* Modal Content */}
            <motion.div
              className="relative z-[101] flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-zinc-100">
                  Select Artwork
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <div className={cn("grid gap-4", config.grid)}>
                      {selectableImages.map((item) => {
                        const isSelected = item.remoteId === value?.remoteId;

                        return (
                          <motion.div
                            key={item.remoteId}
                            onClick={() => handleSelect(item)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-900 transition-all duration-200",
                              "border-2",
                              isSelected
                                ? "border-white ring-2 ring-white/20"
                                : "border-transparent hover:border-zinc-700",
                              config.aspect // Use same aspect ratio in grid
                            )}
                          >
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
                                className="absolute inset-0 z-0 bg-zinc-800"
                                transition={{ duration: 0.2 }}
                              />
                            )}

                            <motion.img
                              src={item.thumb || item.path}
                              className={cn(
                                "relative z-10 h-full w-full transition-transform duration-500",
                                !isSelected && "group-hover:opacity-80",
                                config.objectFit
                              )}
                              loading="lazy"
                              alt=""
                            />
                          </motion.div>
                        );
                      })}

                      {/* Upload Button */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl bg-zinc-900/50 transition-all duration-200",
                          "border-2 border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900",
                          config.aspect
                        )}
                      >
                        <div className="flex flex-col items-center gap-2 text-zinc-600 transition-colors group-hover:text-zinc-300">
                          <Upload className="h-8 w-8" />
                          <span className="text-xs font-medium uppercase tracking-wider">
                            Upload
                          </span>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </motion.div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ArtworkSelect;
