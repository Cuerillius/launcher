import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  WarpDialog,
  WarpDialogContent,
  WarpDialogTrigger,
} from "@/components/ui/warp-dialog";
import WaveLoader from "@/components/display/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Executable } from "@/types/Executable";

// Sub-components
import { useExecutableForm } from "@/hooks/useExecutableForm";
import { ApiKeyConfigDialog } from "./ApiKeyDialog";
import { GameDetailsSection } from "./GameDetailsSection";
import { ArtworkSection } from "./ArtworkSection";
import { FormFooter } from "./FormFooter";

type ExecutableFormProps = {
  initialData?: Executable;
  title: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (data: Executable) => Promise<void>;
  onDelete?: () => Promise<void>;
  autoSelectImages?: boolean;
};

export function ExecutableForm({
  initialData,
  title,
  submitLabel,
  onCancel,
  onSubmit,
  onDelete,
  autoSelectImages,
}: ExecutableFormProps) {
  const {
    formData,
    setFormData,
    games,
    selectedGame,
    setSelectedGame,
    setQuery,
    loading,
    saving,
    artwork,
    hasApiKey,
    setHasApiKey,
    handleChange,
    handleFileClick,
    handleSubmit,
  } = useExecutableForm({ initialData, onSubmit, autoSelectImages });

  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  return (
    <>
      <WaveLoader isVisible={saving} text="Saving..." />

      <ApiKeyConfigDialog
        open={isApiKeyOpen}
        onOpenChange={setIsApiKeyOpen}
        hasApiKey={hasApiKey}
        onKeySaved={() => setHasApiKey(true)}
      />

      <ScrollArea className="h-full w-full">
        <WarpDialog>
          {/* Delete Confirmation Overlay */}
          <WarpDialogContent>
            <h2 className="mb-6 text-2xl font-bold">
              Do you want to delete {formData.name}?
            </h2>
            <div className="flex justify-center gap-4">
              <WarpDialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </WarpDialogTrigger>
              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            </div>
          </WarpDialogContent>

          {/* Main Form Content */}
          <div className="relative flex flex-col min-h-full w-full max-w-5xl mx-auto p-8 pb-0 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="space-y-10 flex-1">
                <GameDetailsSection
                  formData={formData}
                  setFormData={setFormData}
                  games={games}
                  selectedGame={selectedGame}
                  loading={loading}
                  hasApiKey={hasApiKey}
                  onSearchQuery={setQuery}
                  onSelectGame={setSelectedGame}
                  onFileClick={handleFileClick}
                  onHandleChange={handleChange}
                />

                <ArtworkSection
                  formData={formData}
                  setFormData={setFormData}
                  artwork={artwork}
                  hasApiKey={hasApiKey}
                  onOpenApiKeyDialog={() => setIsApiKeyOpen(true)}
                />
              </div>

              <FormFooter
                submitLabel={submitLabel}
                onCancel={onCancel}
                onDelete={onDelete}
              />
            </form>
          </div>
        </WarpDialog>
      </ScrollArea>
    </>
  );
}
