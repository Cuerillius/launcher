import ErrorPage from "@/components/display/Error";
import { ExecutableForm } from "@/components/inputs/ExecutableForm";
import {
  useDeleteExecutable,
  useExecutable,
  useSaveExecutable,
} from "@/hooks/useExecutables";
import { Executable } from "@/types/Executable";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: executable, error } = useExecutable(id);
  const { mutate: saveExecutable } = useSaveExecutable();
  const { mutate: deleteExecutable } = useDeleteExecutable();

  if (!executable || error)
    return (
      <ErrorPage
        errorMessage={["Error loading executable...", "Maybe try again?"]}
        errorCode={500}
      />
    );

  const handleSubmit = async (executable: Executable) => {
    saveExecutable(executable);
    navigate({ to: `/executables/$id`, params: { id } });
  };

  const handleCancel = async () => {
    navigate({ to: `/executables/$id`, params: { id } });
  };

  const handleDelete = async () => {
    deleteExecutable(id);
    navigate({ to: `/` });
  };
  return (
    <ExecutableForm
      initialData={executable}
      title="Edit Game"
      submitLabel="Save"
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
