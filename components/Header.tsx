'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Header() {
    const [role, setRole] = useState<'citizen' | 'officer' | 'anon'>('anon')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkRole() {
            const { data: userData } = await supabase.auth.getUser()
            if (userData?.user) {
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', userData.user.id)
                    .single()

                if (roleData) setRole(roleData.role as any)
            }
            setLoading(false)
        }
        checkRole()
    }, [])

    return (
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl">🏙️</span>
                    <Link href="/" className="text-xl font-black text-blue-600 tracking-tighter">CivicFix</Link>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
                    <Link href="/" className="hover:text-blue-600 transition">Map</Link>
                    <Link href="/issues" className="hover:text-blue-600 transition">Browse</Link>
                    {role === 'citizen' && (
                        <Link href="/my-issues" className="hover:text-blue-600 transition">My Reports</Link>
                    )}
                    {role === 'officer' && (
                        <Link href="/officer" className="hover:orange-600 transition text-orange-500">Officer Portal</Link>
                    )}
                </nav>

                <div className="flex items-center space-x-4">
                    {role !== 'officer' && !loading && (
                        <Link href="/report" className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-blue-100">
                            Report Issue
                        </Link>
                    )}
                    <Link href="/login" className="text-gray-400 hover:text-gray-600 transition font-bold text-sm">
                        Account
                    </Link>
                </div>
            </div>
        </header>
    )
}
