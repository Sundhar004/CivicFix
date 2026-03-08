'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { ssr: false })

export default function ReportIssue() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation([position.coords.latitude, position.coords.longitude]),
        (err) => setError('Could not get actual location: ' + err.message)
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !location) {
      setError('Title, description, and location are required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) throw new Error('You must be logged in to report an issue')

      let imageUrl = null
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('issues')
          .upload(fileName, file)

        if (uploadError) throw new Error('Image upload failed: ' + uploadError.message)

        const { data: urlData } = supabase.storage.from('issues').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      const { data, error: insertError } = await supabase.from('issues').insert({
        title,
        description,
        lat: location[0],
        lng: location[1],
        image_url: imageUrl,
        created_by: userData.user.id
      }).select()

      if (insertError) throw insertError

      router.push('/my-issues')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Report a New Issue</h2>
        <p className="text-lg text-gray-500 font-medium tracking-tight">Help us make your neighborhood better by reporting civic problems.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-8 shadow-sm flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          <span className="font-bold">{error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-50 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title of the issue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken streetlight on Park Ave"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 p-4 border transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Describe the problem</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide as much detail as possible..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 p-4 border transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Upload Photo Evidence</label>
                <div className={`relative group border-2 border-dashed rounded-[2rem] p-4 transition-all duration-300 ${preview ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                  {!preview ? (
                    <div className="flex flex-col items-center py-6">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 mb-4 transform group-hover:scale-110 transition">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <p className="text-sm font-bold text-gray-700">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden shadow-lg h-56">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setFile(null); setPreview(null); }}
                        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition transform hover:scale-110"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black py-5 px-8 rounded-2xl text-lg transition-all shadow-xl shadow-blue-100 transform active:scale-[0.98] disabled:from-blue-300 disabled:to-indigo-300 disabled:cursor-not-allowed tracking-tight"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  SUBMITTING REPORT...
                </span>
              ) : 'SUBMIT REPORT'}
            </button>
          </form>
        </div>

        <div className="w-full lg:w-[400px] flex flex-col space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Pinpoint Location</label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="flex items-center text-blue-600 hover:text-indigo-700 text-xs font-black uppercase transition tracking-wider"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Current Loc
              </button>
            </div>

            <div className="flex-1 min-h-[400px] rounded-3xl overflow-hidden border border-gray-100 shadow-inner relative group">
              <MapWithNoSSR
                selectable={true}
                onLocationSelect={(lat, lng) => setLocation([lat, lng])}
                selectedPos={location}
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white flex items-center pointer-events-none">
                <div className={`w-3 h-3 rounded-full mr-3 ${location ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-bold text-gray-700">{location ? 'Location Captured' : 'Select location on map'}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white">
            <h4 className="font-black text-xl mb-3 tracking-tight">Reporting Guidelines</h4>
            <ul className="space-y-4 text-sm font-medium text-blue-100">
              <li className="flex items-start">
                <span className="mr-3 text-blue-300 font-black">01</span>
                Ensure photos are clear and show context
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-300 font-black">02</span>
                Pin the location as accurately as possible
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-300 font-black">03</span>
                Include landmarks in your description
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
