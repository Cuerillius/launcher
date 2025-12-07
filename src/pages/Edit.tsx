import { useOutletContext, useParams } from "react-router-dom";
import { ExecutableForm } from "../components/ExecutableForm";
import { AppContextType, Executable } from "@/types/Executable";
import { useMemo } from "react";
import { deleteExecutable, saveExecutable } from "@/services/executables";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export function Edit() {
  const { refreshList, executables } = useOutletContext<AppContextType>();
  const { id } = useParams<{ id: string }>();
  const { goExecutable, goHome } = useAppNavigation();

  const selectedExecutable = useMemo(
    () => executables.find((e) => e.id === id),
    [executables, id]
  );

  if (!selectedExecutable) return <div>Loading or Not Found...</div>;

  const handleSubmit = async (executable: Executable) => {
    await saveExecutable(executable);
    await refreshList();
    goExecutable(executable.id);
  };

  const handleCancel = async () => {
    await refreshList();
    goExecutable(selectedExecutable.id);
  };

  const handleDelete = async () => {
    await deleteExecutable(selectedExecutable.id);
    await refreshList();
    goHome();
  };
  return (
    <ExecutableForm
      initialData={selectedExecutable}
      title="Edit Game"
      submitLabel="Save"
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
