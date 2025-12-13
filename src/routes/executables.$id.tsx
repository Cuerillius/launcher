import ErrorPage from "@/components/display/Error";
import { useExecutable } from "@/hooks/useExecutables";
import DetailView, { DetailViewSkeleton } from "@/pages/Detail";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/executables/$id")({
  component: ExecutableDetail,
});

function ExecutableDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: executable, error, isLoading } = useExecutable(id);

  if (error)
    return (
      <ErrorPage
        errorMessage={["Error loading details...", "Maybe try again?"]}
        errorCode={500}
      />
    );

  if (isLoading || !executable) {
    return <DetailViewSkeleton />;
  }

  return (
    <DetailView
      executable={executable}
      onEdit={(id) => navigate({ to: "/edit/$id", params: { id } })}
    />
  );
}
