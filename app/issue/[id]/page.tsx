'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { ssr: false })

export default function IssueDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [issue, setIssue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [role, setRole] = useState<'citizen' | 'officer' | 'anon'>('anon')
  const [fixedFile, setFixedFile] = useState<File | null>(null)
  const [resolving, setResolving] = useState(false)
  const [resolutionComment, setResolutionComment] = useState('')

  useEffect(() => {
    fetchIssueAndRole()
  }, [])

  async function fetchIssueAndRole() {
    try {
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single()

      if (issueError) throw issueError
      setIssue(issueData)

      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userData.user.id)
          .single()

        if (roleData) setRole(roleData.role as any)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function resolveIssue() {
    if (!fixedFile) return alert('Photo required to mark resolved.')
    setResolving(true)

    try {
      const fileExt = fixedFile.name.split('.').pop()
      const fileName = `fixed-${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('issues')
        .upload(fileName, fixedFile)

      if (uploadError) throw new Error('Image upload failed: ' + uploadError.message)

      const { data: urlData } = supabase.storage.from('issues').getPublicUrl(fileName)

      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch(`/api/issues/${id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token || ''
        },
        body: JSON.stringify({
          fixedUrl: urlData.publicUrl,
          comment: resolutionComment
        })
      })

      if (!res.ok) throw new Error('Failed to resolve issue')

      fetchIssueAndRole()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setResolving(false)
    }
  }

  if (error) return <div className="max-w-4xl mx-auto py-8 text-center text-red-600 bg-red-50 p-6 rounded-xl font-bold">{error}</div>
  if (loading) return <div className="max-w-4xl mx-auto py-8 text-center font-bold text-gray-500 animate-pulse bg-white p-6 rounded-xl shadow-sm border border-gray-100">Loading details...</div>
  if (!issue) return <div className="max-w-4xl mx-auto py-8 text-center bg-white p-6 rounded-xl shadow-md font-medium text-gray-500">Issue not found.</div>

  const isOfficer = role === 'officer'

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-6 md:p-10 border-r border-gray-100">
          <div className="mb-6 flex justify-between items-start">
            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${issue.status === 'open' ? 'bg-red-100 text-red-800' :
              issue.status === 'claimed' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
              {issue.status}
            </span>
            <span className="text-sm font-medium text-gray-400">{new Date(issue.created_at).toLocaleDateString()}</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">{issue.title}</h1>
          <p className="text-gray-600 text-base leading-relaxed mb-8">{issue.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {issue.image_url && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Reported Condition</h3>
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-100">
                  <img src={issue.image_url} alt="Reported" className="w-full h-48 object-cover" />
                </div>
              </div>
            )}
            {issue.fixed_image_url && (
              <div>
                <h3 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Resolution Proof</h3>
                <div className="rounded-xl overflow-hidden shadow-md border-2 border-green-500">
                  <img src={issue.fixed_image_url} alt="Fixed" className="w-full h-48 object-cover" />
                </div>
              </div>
            )}
          </div>

          {issue.resolution_comment && (
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-8">
              <h3 className="text-sm font-bold text-green-700 uppercase tracking-widest mb-2">Officer Note</h3>
              <p className="text-green-900 italic font-medium">"{issue.resolution_comment}"</p>
            </div>
          )}

          {/* Timeline */}
          <div className="border-t pt-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Status Timeline</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Reported</p>
                  <p className="text-xs text-gray-500">{new Date(issue.created_at).toLocaleString()}</p>
                </div>
              </div>
              {issue.status !== 'open' && (
                <div className="flex items-center space-x-4 border-l-2 border-gray-100 ml-4 pl-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Claimed by Officer</p>
                    <p className="text-xs text-gray-500">Working on a fix...</p>
                  </div>
                </div>
              )}
              {issue.status === 'fixed' && (
                <div className="flex items-center space-x-4 border-l-2 border-gray-100 ml-4 pl-4 pt-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Resolved</p>
                    <p className="text-xs text-gray-500">{new Date(issue.updated_at || issue.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isOfficer && issue.status === 'claimed' && (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-10">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">Mark as Resolved</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Upload proof photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFixedFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white file:text-blue-600 hover:file:bg-blue-50 transition border border-blue-100 rounded-xl p-1 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Resolution Note (Optional)</label>
                  <textarea
                    placeholder="Describe what was fixed..."
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                    className="w-full rounded-xl border-blue-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-sm"
                    rows={2}
                  />
                </div>

                <button
                  onClick={resolveIssue}
                  disabled={!fixedFile || resolving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:bg-blue-300 transition shadow-lg shadow-blue-100 transform active:scale-[0.98]"
                >
                  {resolving ? 'Uploading & Resolving...' : 'Confirm Resolved'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 p-0 bg-slate-50 relative min-h-[400px]">
          <div className="absolute inset-0">
            <MapWithNoSSR issues={[issue]} />
          </div>
        </div>
      </div>
    </div>
  )
}
