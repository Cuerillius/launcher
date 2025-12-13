import ErrorPage from "@/components/display/Error";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ErrorPage
      errorMessage={["Page not found", "Are you lost?"]}
      errorCode={404}
    />
  );
}
