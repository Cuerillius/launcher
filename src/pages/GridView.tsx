import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LaunchButton from "../components/display/LaunchButton";
import { Executable } from "@/types/Executable";
import TiltedCard from "@/components/display/TiltedCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GridViewProps {
  executables: Executable[];
  onExecutableDetailClick?: (id: string) => void;
}

export default function GridView({
  executables,
  onExecutableDetailClick,
}: GridViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [originRect, setOriginRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const selectedExecutable = executables.find((e) => e.id === selectedId);

  const handleCardClick = (
    e: React.MouseEvent<HTMLElement>,
    executable: Executable
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOriginRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setSelectedId(executable.id);
  };

  const handleClose = () => {
    setSelectedId(null);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <ScrollArea className="h-full w-full ">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
        {executables.map((executable) => (
          <div
            key={executable.id}
            onClick={(e) => handleCardClick(e, executable)}
            className={`group relative aspect-[2/3] w-full cursor-pointer transition-opacity duration-300 ${
              selectedId === executable.id ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="relative h-full w-full">
              <TiltedCard
                imageSrc={executable.grid}
                altText={executable.name}
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                captionText={executable.name}
                scaleOnHover={1.1}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={false}
                rotateAmplitude={15}
              />
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && selectedExecutable && originRect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
            />

            <motion.div
              initial={{
                top: originRect.top,
                left: originRect.left,
                width: originRect.width,
                height: originRect.height,
                borderRadius: "0px",
              }}
              animate={{
                top: "50%",
                left: "50%",
                width: "auto",
                height: "70vh",
                x: "-50%",
                y: "-50%",
                borderRadius: "20px",
                transition: { duration: 0.4, ease: [0.2, 0, 0, 1] },
              }}
              exit={{
                top: originRect.top,
                left: originRect.left,
                width: originRect.width,
                height: originRect.height,
                x: 0,
                y: 0,
                borderRadius: "0px",
                transition: { duration: 0.3, ease: "easeInOut" },
              }}
              style={{
                position: "fixed",
                aspectRatio: "2/3",
                zIndex: 60,
                maxWidth: "90vw",
              }}
              className="pointer-events-auto"
            >
              <div className="w-full h-full rounded-[20px] shadow-2xl">
                <TiltedCard
                  imageSrc={selectedExecutable.grid}
                  altText={selectedExecutable.name}
                  containerHeight="100%"
                  containerWidth="100%"
                  imageHeight="100%"
                  imageWidth="100%"
                  captionText={selectedExecutable.name}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={false}
                  rotateAmplitude={10}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, x: "-50%" }}
              animate={{
                opacity: 1,
                y: 0,
                x: "-50%",
                transition: { delay: 0.3, duration: 0.3 },
              }}
              exit={{ opacity: 0, x: "-50%", transition: { duration: 0.2 } }}
              className="fixed pointer-events-auto z-[60] flex items-center gap-3"
              style={{
                top: "calc(50% + 35vh)",
                left: "50%",
              }}
            >
              <div className="mt-6 lg:mt-12 scale-125 lg:scale-150 origin-top">
                <LaunchButton
                  executable={selectedExecutable}
                  onDetailClick={() =>
                    onExecutableDetailClick &&
                    onExecutableDetailClick(selectedExecutable.id)
                  }
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}
