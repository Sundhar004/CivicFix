'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function MyIssues() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchMyIssues()
    }
  }, [status])

  async function fetchMyIssues() {
    try {
      const res = await fetch(`/api/my-issues?userId=${(session?.user as any).id}`)
      if (!res.ok) throw new Error('Failed to fetch issues')
      const data = await res.json()
      setIssues(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [filter, setFilter] = useState<'all' | 'open' | 'claimed' | 'fixed'>('all')

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true
    return issue.status === filter
  })

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">My Reports</h2>
          <p className="text-lg text-gray-500 font-medium tracking-tight">Track the progress of issues you've reported.</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto max-w-full">
          {(['all', 'open', 'claimed', 'fixed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-8 shadow-sm flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          <span className="font-bold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-50 rounded-[2.5rem] animate-pulse"></div>)}
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">No reports found</p>
          <p className="text-gray-500 mb-8 font-medium">You haven't reported anything in this category yet.</p>
          <a href="/report" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition">Report an Issue</a>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
              <div className="relative h-56 overflow-hidden">
                {issue.image_url ? (
                  <img src={issue.image_url} alt={issue.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                )}
                <div className="absolute top-5 right-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg ${issue.status === 'open' ? 'bg-red-500 text-white' :
                      issue.status === 'claimed' ? 'bg-orange-500 text-white' :
                        'bg-green-500 text-white'
                    }`}>
                    {issue.status}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="font-black text-2xl mb-3 text-gray-900 tracking-tight leading-tight">{issue.title}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">{issue.description}</p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported on</span>
                    <span className="text-sm font-black text-gray-700">{new Date(issue.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <a href={`/issue/${issue.id}`} className="bg-gray-100 hover:bg-indigo-600 text-gray-700 hover:text-white px-6 py-3 rounded-xl text-xs font-black transition-all shadow-sm">
                    VIEW DETAILS
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
