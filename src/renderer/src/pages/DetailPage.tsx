import { useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { AppContextType } from '@renderer/Layout'
import DetailView from '@renderer/views/DetailView'

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const { executables } = useOutletContext<AppContextType>()
  const navigate = useNavigate()

  const selectedExecutable = useMemo(() => executables.find((e) => e.id === id), [executables, id])

  if (!selectedExecutable) return <div>Loading or Not Found...</div>

  return <DetailView executable={selectedExecutable} onEdit={() => navigate(`/edit/${id}`)} />
}
