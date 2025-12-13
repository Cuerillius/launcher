import { ExecutableForm } from "@/components/inputs/ExecutableForm";
import {
  useDeleteExecutable,
  useExecutable,
  useSaveExecutable,
} from "@/hooks/useExecutables";
import { Executable } from "@/types/Executable";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { mutate: saveExecutable } = useSaveExecutable();

  const handleSubmit = async (executable: Executable) => {
    saveExecutable(executable);
    navigate({ to: `/executables/$id`, params: { id: executable.id } });
  };

  const handleCancel = async () => {
    navigate({ to: `/` });
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
