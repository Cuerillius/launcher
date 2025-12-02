import { HashRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";

export const ROUTES = {
  HOME: "/",
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<div>Home</div>} />
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
