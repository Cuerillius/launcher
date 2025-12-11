import { useOutletContext } from "react-router-dom";
import { AppContextType, Executable } from "@/types/Executable";
import { saveExecutable } from "@/services/executables";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { ExecutableForm } from "@/components/inputs/ExecutableForm";

export function Add() {
  const { refreshList } = useOutletContext<AppContextType>();
  const { goExecutable, goHome } = useAppNavigation();

  const handleSubmit = async (executable: Executable) => {
    await saveExecutable(executable);
    await refreshList();
    goExecutable(executable.id);
  };

  const handleCancel = async () => {
    await refreshList();
    goHome();
  };
  return (
    <ExecutableForm
      autoSelectImages={true}
      title="Add Game"
      submitLabel="Add"
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  );
}
