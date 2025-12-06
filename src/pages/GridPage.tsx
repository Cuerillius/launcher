import { AppContextType } from "@/types/Executable";
import { useOutletContext } from "react-router-dom";
import GridView from "./GridView";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function GridPage() {
  const { executables } = useOutletContext<AppContextType>();
  const { goExecutable } = useAppNavigation();
  const handleExecutableDetailClick = (id: string) => {
    goExecutable(id);
  };

  return (
    <GridView
      executables={executables}
      onExecutableDetailClick={handleExecutableDetailClick}
    />
  );
}
