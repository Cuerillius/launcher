import { AppContextType } from '@renderer/Layout'
import { EditView } from '@renderer/views/EditView'
import { useMemo } from 'react'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'

export default function EditPage() {
  const { refreshList, executables } = useOutletContext<AppContextType>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const selectedExecutable = useMemo(() => executables.find((e) => e.id === id), [executables, id])

  if (!selectedExecutable) return <div>Loading or Not Found...</div>

  const handleDone = async (id: string) => {
    await refreshList()
    navigate(`/executable/${id}`)
  }

  const handleDelete = async () => {
    await refreshList()
    navigate('/')
  }

  return <EditView executable={selectedExecutable} onDone={handleDone} onDelete={handleDelete} />
}
