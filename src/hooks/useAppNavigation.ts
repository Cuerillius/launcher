import { ROUTES } from "@/App";
import { useNavigate } from "react-router-dom";

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    goHome: () => navigate(ROUTES.HOME),
    goGrid: () => navigate(ROUTES.GRID),
    goAdd: () => navigate(ROUTES.ADD),
    goEdit: (id: string) => navigate(ROUTES.EDIT.replace(":id", id)),
    goExecutable: (id: string) =>
      navigate(ROUTES.EXECUTABLE.replace(":id", id)),
    //goBack: () => navigate(-1),
  };
};
