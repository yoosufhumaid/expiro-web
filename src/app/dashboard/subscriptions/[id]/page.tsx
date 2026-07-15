'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'

type Subscription = {
  id: string
  name: string
  amount: number
  currency: string
  billing_cycle: string
  next_billing_date: string
  days_until_billing: number
  category: string
  status: string
  created_at: string
}

export default function SubscriptionPage() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCurrency, setEditCurrency] = useState('')
  const [editCycle, setEditCycle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { fetchSubscription() }, [])

  const fetchSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions').select('*').eq('id', params.id).single()
    if (!error && data) {
      setSub(data)
      setEditName(data.name)
      setEditAmount(String(data.amount))
      setEditCurrency(data.currency)
      setEditCycle(data.billing_cycle)
      setEditDate(data.next_billing_date || '')
      setEditCategory(data.category)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!sub) return
    if (!confirm('Delete this subscription?')) return
    setDeleting(true)
    await supabase.from('subscriptions').delete().eq('id', sub.id)
    router.push('/dashboard')
  }

  const handleSave = async () => {
    if (!sub) return
    setSaving(true)
    const today = new Date()
    const billing = editDate ? new Date(editDate) : null
    const daysUntilBilling = billing
      ? Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null
    await supabase.from('subscriptions').update({
      name: editName,
      amount: parseFloat(editAmount),
      currency: editCurrency,
      billing_cycle: editCycle,
      next_billing_date: editDate || null,
      days_until_billing: daysUntilBilling,
      category: editCategory,
    }).eq('id', sub.id)
    setSaving(false)
    setEditing(false)
    fetchSubscription()
  }

  const getStatusColor = (days: number) => {
    if (days <= 7) return 'bg-red-900 text-red-300 border-red-800'
    if (days <= 30) return 'bg-amber-900 text-amber-300 border-amber-800'
    return 'bg-green-900 text-green-300 border-green-800'
  }

  const getStatusLabel = (days: number) => {
    if (days <= 0) return 'Bills today'
    if (days === 1) return 'Bills tomorrow'
    return days + ' days left'
  }

  const getYearlyCost = () => {
    if (!sub) return 0
    if (sub.billing_cycle === 'monthly') return sub.amount * 12
    if (sub.billing_cycle === 'weekly') return sub.amount * 52
    return sub.amount
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>
  if (!sub) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500 text-sm">Subscription not found.</p></div>

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-white transition mb-6 block">← Back</button>

        <div className="bg-white rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{sub.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{sub.category}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(!editing)} className="text-sm text-gray-400 hover:text-gray-900 transition font-medium">
                {editing ? 'Cancel' : 'Edit'}
              </button>
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900">{sub.currency} {Number(sub.amount).toFixed(2)}</p>
                <p className="text-gray-400 text-xs mt-0.5">per {sub.billing_cycle === 'monthly' ? 'month' : sub.billing_cycle === 'yearly' ? 'year' : 'week'}</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-500">Billing cycle</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{sub.billing_cycle}</span>
            </div>
            {sub.next_billing_date && (
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-500">Next billing date</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(sub.next_billing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  {sub.days_until_billing != null && (
                    <span className={'text-xs font-medium px-2 py-0.5 rounded-full border ' + getStatusColor(sub.days_until_billing)}>
                      {getStatusLabel(sub.days_until_billing)}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-500">Yearly cost</span>
              <span className="text-sm font-medium text-gray-900">{sub.currency} {getYearlyCost().toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-medium text-green-600 capitalize">{sub.status}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-500">Added</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {editing && (
            <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                  <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
                  <select value={editCurrency} onChange={e => setEditCurrency(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {['AED','USD','GBP','EUR'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Next billing date</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  {['Entertainment','Music','Software','Health & Fitness','News','Shopping','Food & Drink','Education','Finance','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}
        </div>

        <button onClick={handleDelete} disabled={deleting} className="w-full border border-red-100 text-red-500 rounded-2xl py-3 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50">
          {deleting ? 'Deleting...' : 'Delete subscription'}
        </button>
      </div>
    </div>
  )
}
