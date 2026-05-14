'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function OfficerInsights() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
  if (loading) return <div className="max-w-7xl mx-auto py-8 text-center font-bold text-gray-500 animate-pulse">Loading insights...</div>
  if (!isOfficer) return null

  const stats = {
    open: issues.filter(i => i.status === 'open').length,
    claimed: issues.filter(i => i.status === 'claimed' && i.claimedBy === userId).length,
    fixed: issues.filter(i => i.status === 'fixed' && i.claimedBy === userId).length
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Officer Insights</h2>
          <p className="text-gray-500 font-medium">Overview of your activity and system status.</p>
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
    </div>
  )
}
