'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AddChoicePage() {
  const router = useRouter()
  const [docCount, setDocCount] = useState(0)
  const [subCount, setSubCount] = useState(0)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { fetchStatus() }, [])

  const fetchStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setUpgrading(false)
  }

  const docLimitHit = !isPro && docCount >= 5
  const subLimitHit = !isPro && subCount >= 3
  const anyLimitHit = docLimitHit || subLimitHit

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    )
  }

  if (anyLimitHit) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-white transition mb-10 block">
            ← Back
          </button>

          <div className="bg-gray-900 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-white text-lg font-semibold mb-2">You've hit the free limit</h1>
            <p className="text-gray-500 text-sm mb-6">
              Free accounts can track up to 5 documents and 3 subscriptions.
              Upgrade to Expiro Pro for unlimited everything.
            </p>

            <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-white text-sm font-medium mb-3">Expiro Pro — AED 35/month</p>
              <ul className="flex flex-col gap-2">
                {['Unlimited documents', 'Unlimited subscriptions', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full bg-red-500 hover:bg-red-400 transition rounded-xl py-3 text-white text-sm font-medium disabled:opacity-50"
            >
              {upgrading ? 'Redirecting to checkout…' : 'Upgrade to Pro'}
            </button>

            <p className="text-gray-600 text-xs mt-4">Secure payment via Stripe. Cancel anytime.</p>
          </div>

          <div className="mt-4 flex justify-between text-xs text-gray-600 px-1">
            <span>{docCount}/5 documents used</span>
            <span>{subCount}/3 subscriptions used</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-white transition mb-10 block">
          ← Back
        </button>

        <h1 className="text-xl font-semibold text-white mb-2">What are you adding?</h1>
        <p className="text-gray-500 text-sm mb-8">Choose the type and we'll take it from there.</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push('/dashboard/upload')}
            className="bg-gray-900 hover:bg-gray-800 active:scale-95 transition rounded-2xl p-6 text-left"
          >
            <div className="text-3xl mb-3">📄</div>
            <div className="text-white font-medium text-base mb-1">Document</div>
            <div className="flex items-center justify-between">
              <div className="text-gray-500 text-sm">Passport, Emirates ID, insurance, visa, tenancy contract — anything with an expiry date.</div>
              {!isPro && <span className="text-gray-600 text-xs ml-4 shrink-0">{docCount}/5</span>}
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/subscriptions/add')}
            className="bg-gray-900 hover:bg-gray-800 active:scale-95 transition rounded-2xl p-6 text-left"
          >
            <div className="text-3xl mb-3">💳</div>
            <div className="text-white font-medium text-base mb-1">Subscription</div>
            <div className="flex items-center justify-between">
              <div className="text-gray-500 text-sm">Netflix, Spotify, gym membership — anything you pay for regularly.</div>
              {!isPro && <span className="text-gray-600 text-xs ml-4 shrink-0">{subCount}/3</span>}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
