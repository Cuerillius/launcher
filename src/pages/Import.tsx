import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderOpen, Import } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ControlsFooter } from "@/components/layout/ControlsFooter";
import { ScanResult, ScanResultSelection } from "@/types/Import";
import { SourcePlatform } from "@/types/Executable";
import { SelectEnum } from "@/components/inputs/SelectEnum";
import {
  convertScanResultToExecutable,
  useScanFolderForExes,
} from "@/hooks/useImport";
import { toast } from "sonner";
import { useSaveExecutable } from "@/hooks/useExecutables";
import { LoaderCore } from "@/components/ui/multi-step-loader";
import { AnimatePresence, motion } from "motion/react";

function ImportView() {
  const [rootPath, setRootPath] = useState("");

  const [scanPath, setScanPath] = useState<string | undefined>(undefined);

  const [platform, setPlatform] = useState<SourcePlatform>(
    SourcePlatform.Unknown
  );

  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState(0);
  const [loadingStates, setLoadingStates] = useState<string[]>([]);

  const {
    data: results,
    isLoading: loading,
    error,
  } = useScanFolderForExes(scanPath);

  const [selectedExecutables, setSelectedExecutables] = useState<
    ScanResultSelection[]
  >([]);

  const saveExecutableMutation = useSaveExecutable();

  useEffect(() => {
    if (error) {
      toast.error("Scan Failed", { description: String(error) });
      setScanPath(undefined);
    }
  }, [error]);

  useEffect(() => {
    if (results && results.length > 0) {
      const initialSelections: ScanResultSelection[] = results.map((group) => ({
        name: group.name,
        executable: group.executables[0] || "",
      }));
      setSelectedExecutables(initialSelections);
    } else {
      setSelectedExecutables([]);
    }
  }, [results]);

  async function onFileClick() {
    try {
      const file = await open({ multiple: false, directory: true });
      if (file) setRootPath(file);
    } catch (err) {
      console.error(err);
    }
  }

  function handleScan() {
    if (!rootPath) return;
    setScanPath(rootPath);
  }

  const getSelection = (groupName: string) =>
    selectedExecutables.find((s) => s.name === groupName);

  const handleGroupToggle = (group: ScanResult, isChecked: boolean) => {
    if (isChecked) {
      setSelectedExecutables([
        ...selectedExecutables,
        { name: group.name, executable: group.executables[0] },
      ]);
    } else {
      setSelectedExecutables(
        selectedExecutables.filter((item) => item.name !== group.name)
      );
    }
  };

  const handleExeChange = (groupName: string, newExePath: string) => {
    setSelectedExecutables((prev) =>
      prev.map((item) =>
        item.name === groupName ? { ...item, executable: newExePath } : item
      )
    );
  };

  const handleCancel = () => {
    setScanPath(undefined);
    setSelectedExecutables([]);
    setRootPath("");
    setPlatform(SourcePlatform.Unknown);
  };

  const handleSubmit = async () => {
    if (selectedExecutables.length === 0) {
      toast.warning("No Selection", {
        description: "Please select at least one game to import.",
      });
      return;
    }

    const names = selectedExecutables.map((s) => `Importing ${s.name}...`);
    setLoadingStates(names);
    setImportStep(0);
    setIsImporting(true);

    try {
      for (const selection of selectedExecutables) {
        const executableData = await convertScanResultToExecutable(selection);

        if (executableData) {
          executableData.platform = platform;
          await saveExecutableMutation.mutateAsync(executableData);
        }

        setImportStep((prev) => prev + 1);
      }

      toast.success("Import Complete", {
        description: `Imported ${selectedExecutables.length} games as ${platform}.`,
      });

      handleCancel();
    } catch (err) {
      console.error(err);
      toast.error("Import Failed", {
        description: "An error occurred during import.",
      });
    } finally {
      setTimeout(() => {
        setIsImporting(false);
        setImportStep(0);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {isImporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full fixed inset-0 z-100 flex items-center justify-center backdrop-blur-2xl bg-background/80"
          >
            <div className="h-96 relative w-full max-w-xl">
              <LoaderCore value={importStep} loadingStates={loadingStates} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-none space-y-4">
        <h1 className="text-xl font-bold">Import Executables</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="exePath">Root Folder Path</Label>
            <div className="flex items-center gap-2">
              <Input
                value={rootPath}
                onChange={(e) => setRootPath(e.target.value)}
                className="font-mono text-sm"
                placeholder="Select folder..."
              />
              <Button variant="outline" size="icon" onClick={onFileClick}>
                <FolderOpen className="h-4 w-4" />
              </Button>
              <Button onClick={handleScan} disabled={loading || !rootPath}>
                {loading ? "Scanning..." : "Scan"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="[&>button]:w-full">
              <SelectEnum
                value={platform}
                label="Platform"
                placeholder="Select Platform"
                enum={SourcePlatform}
                onValueChange={(value) => setPlatform(value as SourcePlatform)}
              />
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 border rounded-md p-4 w-full min-h-0 bg-card/50">
        <div className="space-y-6 max-w-full">
          {results?.map((group, index) => {
            const currentSelection = getSelection(group.name);
            const isGroupSelected = !!currentSelection;
            return (
              <div key={index} className="space-y-2 overflow-hidden">
                <div className="flex items-center gap-2 font-medium">
                  <Checkbox
                    id={`group-${index}`}
                    checked={isGroupSelected}
                    onCheckedChange={(checked) =>
                      handleGroupToggle(group, checked === true)
                    }
                  />
                  <Label htmlFor={`group-${index}`}>{group.name}</Label>
                </div>
                <div className="pl-6 border-l-2 ml-2">
                  <RadioGroup
                    disabled={!isGroupSelected}
                    value={currentSelection?.executable || ""}
                    onValueChange={(val) => handleExeChange(group.name, val)}
                  >
                    {group.executables.map((exe, i) => (
                      <div key={i} className="flex items-center space-x-2 py-1">
                        <RadioGroupItem value={exe} id={`r-${index}-${i}`} />
                        <Label
                          htmlFor={`r-${index}-${i}`}
                          className="text-sm font-mono truncate"
                        >
                          {exe}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex-none pt-2">
        <ControlsFooter
          submitLabel="Import Selected"
          submitIcon={Import}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isImporting || loading}
        />
      </div>
    </div>
  );
}

export default ImportView;
