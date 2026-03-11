'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Header() {
    const [role, setRole] = useState<'citizen' | 'officer' | 'anon'>('anon')
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const fetchUserAndRole = async (sessionUser: any) => {
            if (sessionUser) {
                setUser(sessionUser)
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', sessionUser.id)
                    .single()

                if (roleData) {
                    setRole(roleData.role as any)
                } else {
                    setRole('anon')
                }
            } else {
                setUser(null)
                setRole('anon')
            }
            setLoading(false)
        }

        // Initial check
        supabase.auth.getUser().then(({ data }) => {
            fetchUserAndRole(data.user)
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            fetchUserAndRole(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl">🏙️</span>
                    <Link href="/" className="text-xl font-black text-blue-600 tracking-tighter">CivicFix</Link>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
                    <Link href="/" className={`transition ${pathname === '/' ? 'text-blue-600' : 'hover:text-blue-600'}`}>Map</Link>
                    <Link href="/issues" className={`transition ${pathname === '/issues' ? 'text-blue-600' : 'hover:text-blue-600'}`}>Browse</Link>
                    {role === 'citizen' && (
                        <Link href="/my-issues" className={`transition ${pathname === '/my-issues' ? 'text-blue-600' : 'hover:text-blue-600'}`}>My Reports</Link>
                    )}
                    {role === 'officer' && (
                        <Link href="/officer" className={`transition ${pathname === '/officer' ? 'text-orange-500' : 'text-orange-500 hover:text-orange-600'}`}>Officer Portal</Link>
                    )}
                </nav>

                <div className="flex items-center space-x-4">
                    {role !== 'officer' && !loading && (
                        <Link href="/report" className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-blue-100">
                            Report Issue
                        </Link>
                    )}

                    {user ? (
                        <button
                            onClick={handleSignOut}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link href="/login" className="text-gray-400 hover:text-gray-600 transition font-bold text-sm">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
