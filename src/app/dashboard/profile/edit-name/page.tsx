'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function EditNamePage() {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setName(user.user_metadata?.full_name || '')
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.auth.updateUser({ data: { full_name: name } })
    setSaving(false)
    setDone(true)
    setTimeout(() => router.push('/dashboard/profile'), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-white text-lg font-semibold mb-4">Your name</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600 mb-4"
          placeholder="Enter your name"
        />
        <button
          onClick={handleSave}
          disabled={saving || done}
          className="w-full bg-white text-gray-900 rounded-xl py-3 text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
        >
          {done ? 'Saved ✓' : saving ? 'Saving…' : 'Save name'}
        </button>
      </div>
    </div>
  )
}
