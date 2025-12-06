import { useParams, useOutletContext } from "react-router-dom";
import { useMemo } from "react";
import { AppContextType } from "@/types/Executable";
import DetailView from "./Detail";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { executables } = useOutletContext<AppContextType>();
  const { goEdit } = useAppNavigation();

  const selectedExecutable = useMemo(
    () => executables.find((e) => e.id === id),
    [executables, id]
  );

  if (!selectedExecutable)
    return (
      <div className="flex justify-center items-center h-full">
        Loading or Not Found...
      </div>
    );

  return (
    <DetailView
      executable={selectedExecutable}
      onEdit={() => goEdit(selectedExecutable.id)}
    />
  );
}
