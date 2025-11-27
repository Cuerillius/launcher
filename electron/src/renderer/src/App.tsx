import { HashRouter, Routes, Route } from 'react-router-dom'
import GridPage from './pages/GridPage'
import AddPage from './pages/AddPage'
import DetailPage from './pages/DetailPage'
import EditPage from './pages/EditPage'
import MainLayout from './Layout'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<GridPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/executable/:id" element={<DetailPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
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
  )
}

export default App
