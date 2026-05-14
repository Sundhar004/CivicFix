'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [role, setRole] = useState<'citizen' | 'officer'>('citizen')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        role: isRegistering ? role : undefined,
        isRegistering: isRegistering ? 'true' : 'false',
      });

      if (res?.error) {
        throw new Error(res.error);
      } else {
        if (isRegistering) {
          setMessage('Registration successful! Signing you in...');
        }
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-2">
            {isRegistering ? 'Join CivicFix' : 'Welcome Back'}
          </h2>
          <p className="text-blue-100 text-sm">
            {isRegistering ? 'Create an account to report and track issues' : 'Sign in to access your dashboard'}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm animate-shake">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 text-sm">
              <p className="font-bold">Success</p>
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-700 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-700 transition"
              />
            </div>

            {isRegistering && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Join as</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('citizen')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition ${role === 'citizen'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                      }`}
                  >
                    <span className="text-2xl mb-1">🏘️</span>
                    <span className="font-bold">Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('officer')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition ${role === 'officer'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                      }`}
                  >
                    <span className="text-2xl mb-1">👮</span>
                    <span className="font-bold">Officer</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5 active:translate-y-0 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-gray-500 hover:text-blue-600 text-sm font-semibold transition"
            >
              {isRegistering ? 'Already have an account? Sign in' : "New to CivicFix? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
