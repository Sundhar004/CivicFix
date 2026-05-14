'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function OfficerDashboard() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'mine' | 'open'>('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [isOfficer, setIsOfficer] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      checkRoleAndFetch()
    }
  }, [status])

  async function checkRoleAndFetch() {
    try {
      if (!session?.user) return;
      const user = session.user as any;
      setUserId(user.id);

      if (user.role !== 'officer') {
        setError(`Access denied. Your current role is '${user.role}', but 'officer' is required. Logged in as: ${user.email}`)
        setLoading(false)
        return
      }

      setIsOfficer(true)

      const res = await fetch('/api/issues')
      if (!res.ok) throw new Error('Failed to fetch issues')
      const data = await res.json()
      setIssues(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) return <div className="max-w-7xl mx-auto py-8 text-center text-red-600 bg-red-50 p-6 rounded-xl font-bold">{error}</div>
  if (loading) return <div className="max-w-7xl mx-auto py-8 text-center font-bold text-gray-500 animate-pulse">Loading dashboard...</div>
  if (!isOfficer) return null

  const filteredIssues = issues.filter(issue => {
    if (filter === 'mine') return issue.claimedBy === userId
    if (filter === 'open') return issue.status === 'open'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Officer Portal</h2>
          <p className="text-gray-500 font-medium">Browse issues and manage your claims.</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            All Issues
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${filter === 'open' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${filter === 'mine' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            My Claims
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col group transition hover:shadow-2xl">
            <div className="relative h-48 overflow-hidden">
              <img
                src={issue.image_url || issue.imageUrl || 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=2070&auto=format&fit=crop'}
                alt={issue.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg ${issue.status === 'open' ? 'bg-red-500 text-white' :
                  issue.status === 'claimed' ? 'bg-orange-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                  {issue.status}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-black text-xl mb-2 text-gray-900 tracking-tight leading-tight">{issue.title}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">{issue.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Reported on</span>
                  <span className="text-xs font-bold text-gray-700">{new Date(issue.created_at || issue.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <a href={`/issue/${issue.id}`} className="bg-gray-100 hover:bg-indigo-600 text-gray-700 hover:text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center w-full">
                    VIEW DETAILS
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold">No issues found matching this filter.</p>
        </div>
      )}
    </div>
  )
}
