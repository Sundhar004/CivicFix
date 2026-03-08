'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { ssr: false })

export default function Home() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues()
  }, [])

  async function fetchIssues() {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setIssues(data)
    } catch (err: any) {
      console.error('Error fetching issues:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block xl:inline">Report Issues.</span>{' '}
          <span className="block text-blue-600 xl:inline">Improve Your City.</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          CivicFix empowers citizens to easily report potholes, broken streetlights, and other city issues directly to the authorities.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <a href="/report" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
              Report an Issue
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Live Issue Map</h2>
          <div className="flex space-x-4 text-sm font-medium">
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Open</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>Claimed</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Fixed</div>
          </div>
        </div>
        
        {loading ? (
          <div className="h-[500px] bg-slate-100 rounded-lg animate-pulse flex justify-center items-center">Loading map...</div>
        ) : (
          <MapWithNoSSR issues={issues} />
        )}
      </div>
    </div>
  )
}
