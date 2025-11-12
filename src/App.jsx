import { useState, useEffect } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState(null)

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await fetch(`${backend}/api/analytics/overview`)
        if (res.ok) {
          const data = await res.json()
          setOverview(data)
        }
      } catch (e) {
        // ignore
      }
    }
    loadOverview()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Please select an audio file')
      return
    }
    if (!title || !artist) {
      setError('Please provide title and artist')
      return
    }

    const form = new FormData()
    form.append('file', file)
    form.append('title', title)
    form.append('artist', artist)
    if (description) form.append('description', description)

    setUploading(true)
    try {
      const res = await fetch(`${backend}/api/songs/upload`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Upload failed')
      }
      const data = await res.json()
      setResult({
        token: data.token,
        download_url: `${backend}${data.download_url.startsWith('/') ? '' : '/'}${data.download_url}`,
        share_url: `${window.location.origin}/s/${data.token}`,
      })
      setTitle('')
      setArtist('')
      setDescription('')
      setFile(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied!')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">SongShare</h1>
          <p className="text-gray-600 mt-2">Upload your track, get a link, share it anywhere. Anyone with the link can download.</p>
        </header>

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audio file</label>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Song title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                <input value={artist} onChange={(e)=>setArtist(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Artist or uploader" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} placeholder="Optional notes" />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button disabled={uploading} className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow disabled:opacity-60">
              {uploading ? 'Uploading…' : 'Upload & Get Link'}
            </button>
          </form>

          {result && (
            <div className="mt-6 border-t pt-6 space-y-3">
              <h3 className="font-semibold text-gray-800">Your links</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                  <div className="text-sm text-gray-700 truncate mr-2">Share page</div>
                  <div className="flex items-center gap-2">
                    <a href={result.share_url} className="text-indigo-600 text-sm hover:underline" target="_blank" rel="noreferrer">Open</a>
                    <button onClick={()=>copy(result.share_url)} className="text-xs px-2 py-1 bg-gray-800 text-white rounded">Copy</button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                  <div className="text-sm text-gray-700 truncate mr-2">Direct download</div>
                  <div className="flex items-center gap-2">
                    <a href={result.download_url} className="text-indigo-600 text-sm hover:underline" target="_blank" rel="noreferrer">Download</a>
                    <button onClick={()=>copy(result.download_url)} className="text-xs px-2 py-1 bg-gray-800 text-white rounded">Copy</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Global analytics</h2>
          {overview ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Total songs</p>
                <p className="text-2xl font-semibold">{overview.total_songs}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-500">Total downloads</p>
                <p className="text-2xl font-semibold">{overview.total_downloads}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 md:col-span-1">
                <p className="text-sm text-gray-500 mb-2">Top songs</p>
                <ul className="space-y-1 max-h-32 overflow-auto">
                  {overview.top_songs?.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex justify-between">
                      <span className="truncate mr-2">{s.title} — {s.artist}</span>
                      <span className="text-gray-500">{s.download_count || 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading analytics…</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
