import ExecutableForm from '@renderer/components/ExecutableForm'
import { Executable } from 'src/shared/types'

type EditViewProps = {
  executable: Executable
  onDone: (id: string) => void
  onDelete: () => void
}

export function EditView({ executable, onDone, onDelete }: EditViewProps) {
  const handleSubmit = async (data: Executable | Omit<Executable, 'id'>) => {
    await window.fs.save(data as Executable)
    onDone(executable.id)
  }

  const handleDelete = async () => {
    await window.fs.delete(executable)
    onDelete()
  }

  return (
    <ExecutableForm
      title="Edit Executable"
      submitLabel="Save Changes"
      initialData={executable}
      onCancel={() => onDone(executable.id)}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      autoSelectImages={false}
    />
  )
}
