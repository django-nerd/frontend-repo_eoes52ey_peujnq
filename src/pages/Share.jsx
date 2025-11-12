import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Share() {
  const { token } = useParams()
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState('')
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${backend}/api/songs/${token}`)
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setMeta(data)
      } catch (e) {
        setError(e.message)
      }
    }
    load()
  }, [token])

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text) } catch {}
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Link invalid</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-gray-600">Loading…</div>
      </div>
    )
  }

  const downloadUrl = `${backend}/api/songs/${token}/download`
  const shareUrl = `${window.location.origin}/s/${token}`

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-emerald-50">
      <div className="bg-white rounded-xl shadow p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
        <p className="text-gray-700">by {meta.artist}</p>
        {meta.description && <p className="text-gray-600 mt-2">{meta.description}</p>}
        <div className="mt-4 text-sm text-gray-600">Downloads: {meta.download_count || 0}</div>

        <div className="mt-6 flex items-center gap-2">
          <a href={downloadUrl} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white">Download</a>
          <button onClick={()=>copy(shareUrl)} className="px-3 py-2 rounded bg-gray-800 text-white text-sm">Copy link</button>
        </div>
      </div>
    </div>
  )
}
