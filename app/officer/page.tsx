'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OfficerDashboard() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'mine' | 'open'>('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [isOfficer, setIsOfficer] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkRoleAndFetch()
  }, [])

  async function checkRoleAndFetch() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        router.push('/login')
        return
      }
      setUserId(userData.user.id)

      // Check role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .single()

      if (roleError) {
        if (roleError.code === 'PGRST116') {
          setError(`No role found for user ${userData.user.email}. Please sign up again or add a role manually.`)
        } else {
          setError(`Error checking role: ${roleError.message}`)
        }
        setLoading(false)
        return
      }

      if (roleData?.role !== 'officer') {
        setError(`Access denied. Your current role is '${roleData?.role}', but 'officer' is required. Logged in as: ${userData.user.email}`)
        setLoading(false)
        return
      }

      setIsOfficer(true)

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setIssues(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function claimIssue(id: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await fetch(`/api/issues/${id}/claim`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session.access_token
        },
        body: JSON.stringify({ userId: session.user.id })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to claim issue')
        return res.json()
      })

      checkRoleAndFetch()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (error) return <div className="max-w-7xl mx-auto py-8 text-center text-red-600 bg-red-50 p-6 rounded-xl font-bold">{error}</div>
  if (loading) return <div className="max-w-7xl mx-auto py-8 text-center font-bold text-gray-500 animate-pulse">Loading dashboard...</div>
  if (!isOfficer) return null

  const stats = {
    open: issues.filter(i => i.status === 'open').length,
    claimed: issues.filter(i => i.status === 'claimed' && i.claimed_by === userId).length,
    fixed: issues.filter(i => i.status === 'fixed' && i.claimed_by === userId).length
  }

  const filteredIssues = issues.filter(issue => {
    if (filter === 'mine') return issue.claimed_by === userId
    if (filter === 'open') return issue.status === 'open'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Officer Dashboard</h2>
          <p className="text-gray-500 font-medium">Manage and resolve reported civic issues.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 text-xl">🚨</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Alerts</p>
            <p className="text-2xl font-black text-gray-900">{stats.open}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 text-xl">🛠️</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Active Claims</p>
            <p className="text-2xl font-black text-gray-900">{stats.claimed}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 text-xl">✅</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Successfully Fixed</p>
            <p className="text-2xl font-black text-gray-900">{stats.fixed}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col group transition hover:shadow-2xl">
            <div className="relative h-48 overflow-hidden">
              <img
                src={issue.image_url || 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=2070&auto=format&fit=crop'}
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
                  <span className="text-xs font-bold text-gray-700">{new Date(issue.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <a href={`/issue/${issue.id}`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl transition shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </a>
                  {issue.status === 'open' && (
                    <button
                      onClick={() => claimIssue(issue.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-100 transition"
                    >
                      CLAIM
                    </button>
                  )}
                  {issue.status === 'claimed' && issue.claimed_by === userId && (
                    <a
                      href={`/issue/${issue.id}`}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-orange-100 transition"
                    >
                      RESOLVE
                    </a>
                  )}
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
