import ErrorPage from "@/components/display/Error";
import { useAllExecutables } from "@/hooks/useExecutables";
import GridView, { GridViewSkeleton } from "@/pages/GridView";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: executables, error, isLoading } = useAllExecutables();

  if (error) {
    return (
      <ErrorPage
        errorMessage={["Error loading executables...", "Maybe try again?"]}
        errorCode={500}
      />
    );
  }

  if (isLoading || !executables) {
    return <GridViewSkeleton />;
  }

  return (
    <GridView
      executables={executables}
      onExecutableDetailClick={(id: string) => {
        navigate({ to: `/executables/$id`, params: { id } });
      }}
    />
  );
}
