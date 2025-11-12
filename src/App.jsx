import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = file && title && artist && !loading

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('title', title)
      form.append('artist', artist)
      form.append('description', description)

      const res = await fetch(`${API_BASE}/api/songs`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onUploaded(data)
      setFile(null)
      setTitle('')
      setArtist('')
      setDescription('')
    } catch (err) {
      setError('Upload failed. Please try again with a valid audio file.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur p-4 rounded-xl shadow-sm space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Audio file</label>
        <input type="file" accept="audio/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="mt-1 block w-full text-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Song title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Artist</label>
          <input value={artist} onChange={(e)=>setArtist(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Artist name" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional"></textarea>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={!canSubmit} className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md">
        {loading ? 'Uploading…' : 'Upload song'}
      </button>
    </form>
  )
}

function SongCard({ song }) {
  const shareUrl = useMemo(() => `${window.location.origin}?slug=${song.slug}`, [song.slug])
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
          <p className="text-sm text-gray-600">by {song.artist}</p>
        </div>
        <a href={`${API_BASE}${song.download_url}`} className="text-blue-600 hover:underline" download>
          Download
        </a>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
        <span>{(song.size/1024/1024).toFixed(2)} MB</span>
        <span>Views: {song.views} • Downloads: {song.downloads}</span>
      </div>
      <div className="mt-3">
        <label className="block text-xs uppercase tracking-wide text-gray-500">Share link</label>
        <div className="flex gap-2">
          <input readOnly value={`${API_BASE}/api/songs/${song.slug}`} className="flex-1 border rounded-md px-2 py-1 text-sm" />
          <button onClick={()=>{navigator.clipboard.writeText(`${API_BASE}/api/songs/${song.slug}`)}} className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">Copy</button>
        </div>
      </div>
    </div>
  )
}

function Analytics({ data }) {
  return (
    <div className="bg-white/70 backdrop-blur p-4 rounded-xl shadow-sm grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-2xl font-bold">{data.total_songs}</div>
        <div className="text-gray-600 text-sm">Songs</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{data.total_views}</div>
        <div className="text-gray-600 text-sm">Views</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{data.total_downloads}</div>
        <div className="text-gray-600 text-sm">Downloads</div>
      </div>
    </div>
  )
}

function App() {
  const [songs, setSongs] = useState([])
  const [analytics, setAnalytics] = useState({ total_songs: 0, total_views: 0, total_downloads: 0 })
  const [highlight, setHighlight] = useState(null)

  const load = async () => {
    const [sRes, aRes] = await Promise.all([
      fetch(`${API_BASE}/api/songs`),
      fetch(`${API_BASE}/api/analytics`)
    ])
    const [s, a] = await Promise.all([sRes.json(), aRes.json()])
    setSongs(s)
    setAnalytics(a)
  }

  useEffect(() => {
    load()
  }, [])

  const onUploaded = (song) => {
    setSongs(prev => [song, ...prev])
    setAnalytics(a => ({ ...a, total_songs: a.total_songs + 1 }))
    setHighlight(song.slug)
    setTimeout(()=>setHighlight(null), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Song Distribution Platform</h1>
          <p className="text-gray-600">Upload, share, and track downloads globally.</p>
        </div>

        <Analytics data={analytics} />
        <UploadForm onUploaded={onUploaded} />

        <div className="grid gap-4">
          {songs.map(s => (
            <div key={s.slug} className={highlight === s.slug ? 'ring-2 ring-blue-400 rounded-xl' : ''}>
              <SongCard song={s} />
            </div>
          ))}
          {songs.length === 0 && (
            <div className="text-center text-gray-500">No songs yet. Be the first to upload!</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
