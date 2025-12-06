import { HashRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";
import { Edit } from "./pages/Edit";

export const ROUTES = {
  HOME: "/",
  EXECUTABLE: "/executable/:id",
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<div>Home</div>} />
          <Route path={ROUTES.EXECUTABLE} element={<DetailPage />} />
          <Route
            path="*"
            element={
              <div className="bg-mood text-white p-10 flex items-center justify-center h-full">
                404: Route Not Found
              </div>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
