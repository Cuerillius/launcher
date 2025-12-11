import { useState } from "react";
import { useExecutableForm } from "@/hooks/useExecutableForm";
import { ApiKeyConfigDialog } from "./ApiKeyDialog";
import { ExecutableDetailsSection } from "../inputs/ExecutableDetailsSection";
import { ArtworkSection } from "./ArtworkSection";
import { ControlsFooter } from "../layout/ControlsFooter";
import { Executable } from "@/types/Executable";
import WaveLoader from "../display/WaveLoader";
import { ScrollArea } from "../ui/scroll-area";
import {
  WarpDialog,
  WarpDialogContent,
  WarpDialogTrigger,
} from "../ui/warp-dialog";
import { Button } from "../ui/button";

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

      <ScrollArea className="h-full w-full flex">
        <WarpDialog>
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

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="relative flex flex-col min-h-full w-full max-w-5xl mx-auto p-8 pb-0 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8 flex-1 items-start">
                <ExecutableDetailsSection
                  formData={formData}
                  setFormData={setFormData}
                  searchResults={games}
                  selectedResult={selectedGame}
                  loading={loading}
                  hasApiKey={hasApiKey}
                  onSearchQuery={setQuery}
                  onSelectResult={setSelectedGame}
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

              <ControlsFooter
                submitLabel={submitLabel}
                onCancel={onCancel}
                onDelete={onDelete}
              />
            </div>
          </form>
        </WarpDialog>
      </ScrollArea>
    </>
  );
}
