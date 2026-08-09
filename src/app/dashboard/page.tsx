'use client'

import { useEffect, useState, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function daysFromToday(dateStr: string | null): number {
  if (!dateStr) return 999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [isPro, setIsPro] = useState(false)
  const [docCount, setDocCount] = useState(0)
  const [subCount, setSubCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgraded = searchParams.get('upgraded')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)

    const [{ count: docs }, { count: subs }, { data: profile }] = await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('profiles').select('is_pro').eq('id', user.id).single(),
    ])

    setDocCount(docs || 0)
    setSubCount(subs || 0)
    setIsPro(profile?.is_pro || false)
    setLoading(false)
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setUpgrading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-gray-900">expiro<span className="text-red-500">.</span></span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Upgraded banner */}
        {upgraded && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
            <p className="text-sm text-green-800 font-medium">You're now on Expiro Pro. Open the app to unlock everything.</p>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-500 text-sm">Manage your Expiro account</p>
        </div>

        {/* Plan card */}
        <div className={`rounded-2xl p-6 mb-6 border-2 ${isPro ? 'bg-white border-red-500' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Current plan</p>
              <p className="text-xl font-extrabold text-gray-900">{isPro ? 'Expiro Pro' : 'Free'}</p>
            </div>
            {isPro && (
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">PRO</div>
            )}
          </div>

          {isPro ? (
            <div className="grid grid-cols-2 gap-3">
              {['Unlimited documents', 'Unlimited subscriptions', 'Share status card', 'Priority support'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-red-500 font-bold text-xs">✓</span> {f}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{docCount}<span className="text-gray-400 text-sm font-normal">/5</span></div>
                  <div className="text-xs text-gray-500 mt-1">Documents</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{subCount}<span className="text-gray-400 text-sm font-normal">/3</span></div>
                  <div className="text-xs text-gray-500 mt-1">Subscriptions</div>
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {upgrading ? 'Redirecting to checkout...' : 'Upgrade to Pro — AED 19/mo'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">Secure payment via Stripe. Cancel any time.</p>
            </>
          )}
        </div>

        {/* Download app */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-1">Get the iOS app</h2>
          <p className="text-sm text-gray-500 mb-4">Track your documents and subscriptions on the go. Your account syncs automatically.</p>
          
            href="https://apps.apple.com"
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Download on the App Store
          </a>
        </div>

        {/* Support */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-1">Need help?</h2>
          <p className="text-sm text-gray-500 mb-4">Get in touch and we'll get back to you as soon as possible.</p>
          <a href="mailto:hello@renewio.app" className="text-sm text-red-500 font-semibold hover:text-red-600 transition-colors">
            hello@renewio.app
          </a>
        </div>

      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
