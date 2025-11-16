// YourFileComponent.js
import { useState } from 'react'

function YourFileComponent() {
  const [fileContent, setFileContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [feedback, setFeedback] = useState('')

  const handleSaveFile = async () => {
    await window.fs.saveFile('my-file.txt', fileContent)
    setFeedback('File saved successfully.')
  }

  const handleReadFile = async () => {
    const result = await window.fs.readFile('my-file.txt')
    setSavedContent(result.content || '')
    setFeedback('File read successfully.')
  }

  return (
    <div>
      <textarea
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        placeholder="Enter content to save to a file"
      />
      <button onClick={handleSaveFile}>Save to File</button>
      <button onClick={handleReadFile}>Read from File</button>
      <p>Content from file: {savedContent}</p>
      {feedback && <p>{feedback}</p>}
    </div>
  )
}

export default YourFileComponent
