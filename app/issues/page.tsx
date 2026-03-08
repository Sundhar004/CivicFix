'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function IssuesList() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'claimed' | 'fixed'>('all')

  useEffect(() => {
    fetchIssues()
  }, [])

  async function fetchIssues() {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setIssues(data)
    setLoading(false)
  }

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true
    return issue.status === filter
  })

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Public Registry</h2>
          <p className="text-gray-500 font-medium">Browse and track reported issues in your community.</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto max-w-full">
          {(['all', 'open', 'claimed', 'fixed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2rem] animate-pulse"></div>)}
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold">No issues found for this category.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col group transition hover:shadow-2xl">
              <div className="relative h-48 overflow-hidden">
                {issue.image_url ? (
                  <img src={issue.image_url} alt={issue.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold">No Photo</div>
                )}
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

                  <a href={`/issue/${issue.id}`} className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-5 py-2.5 rounded-xl text-xs font-black transition">
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
