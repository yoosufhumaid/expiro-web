'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [docCount, setDocCount] = useState(0)
  const [subCount, setSubCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [sendingReset, setSendingReset] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setEmail(user.email || '')
    setName(user.user_metadata?.full_name || '')

    const [{ count: docs }, { count: subs }] = await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    setDocCount(docs || 0)
    setSubCount(subs || 0)
    setLoading(false)
  }

  const handlePasswordReset = async () => {
    setSendingReset(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setSendingReset(false)
    if (error) {
      setPasswordMsg('Something went wrong. Try again.')
    } else {
      setPasswordMsg('Reset link sent to your email.')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition text-sm">
            ← Back
          </button>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-8">Profile</h1>

        {loading ? (
          <div className="text-center text-gray-600 text-sm py-20">Loading...</div>
        ) : (
          <div className="flex flex-col gap-4">

            <div className="bg-gray-900 rounded-2xl p-5">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Account</p>
              <p className="text-white text-sm font-medium">{name || email}</p>
              {name && <p className="text-gray-500 text-xs mt-1">{email}</p>}
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">Your vault</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-3xl font-semibold text-white">{docCount}</p>
                  <p className="text-gray-500 text-xs mt-1">Document{docCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-px bg-gray-800" />
                <div>
                  <p className="text-3xl font-semibold text-white">{subCount}</p>
                  <p className="text-gray-500 text-xs mt-1">Subscription{subCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Security</p>
              <button
                onClick={handlePasswordReset}
                disabled={sendingReset}
                className="text-sm text-white hover:text-gray-300 transition disabled:opacity-50"
              >
                {sendingReset ? 'Sending…' : 'Send password reset email'}
              </button>
              {passwordMsg && <p className="text-gray-500 text-xs mt-2">{passwordMsg}</p>}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full bg-gray-900 hover:bg-gray-800 transition rounded-2xl p-4 text-red-400 text-sm font-medium"
            >
              Sign out
            </button>

          </div>
        )}
      </div>
    </div>
  )
}
