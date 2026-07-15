'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'

const DOC_TYPES = ['Passport', 'Emirates ID', 'Residence Visa', 'Driving Licence', 'Car Insurance', 'Vehicle Registration', 'Health Insurance', 'Tenancy Contract', 'Work Permit', 'Bank Card', 'Other']

type Document = {
  id: string
  name: string
  document_type: string
  expiry_date: string
  days_until_expiry: number
  issuing_country: string
  ai_summary: string
  file_url: string
  status: string
  created_at: string
}

export default function DocumentPage() {
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editExpiry, setEditExpiry] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const router = useRouter()
  const params = useParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { fetchDocument() }, [])

  const fetchDocument = async () => {
    const { data, error } = await supabase
      .from('documents').select('*').eq('id', params.id).single()
    if (!error && data) {
      setDoc(data)
      setEditName(data.name)
      setEditType(data.document_type || 'Passport')
      setEditExpiry(data.expiry_date || '')
      setEditCountry(data.issuing_country || '')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!doc) return
    if (!confirm('Delete this document?')) return
    setDeleting(true)
    await supabase.from('documents').delete().eq('id', doc.id)
    router.push('/dashboard')
  }

  const handleSave = async () => {
    if (!doc) return
    setSaving(true)
    const today = new Date()
    const expiry = editExpiry ? new Date(editExpiry) : null
    const daysUntilExpiry = expiry
      ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null
    await supabase.from('documents').update({
      name: editName,
      document_type: editType,
      expiry_date: editExpiry || null,
      days_until_expiry: daysUntilExpiry,
      issuing_country: editCountry || null,
    }).eq('id', doc.id)
    setSaving(false)
    setEditing(false)
    fetchDocument()
  }

  const getStatusColor = (days: number) => {
    if (days <= 7) return 'bg-red-900 text-red-300 border-red-800'
    if (days <= 30) return 'bg-amber-900 text-amber-300 border-amber-800'
    return 'bg-green-900 text-green-300 border-green-800'
  }

  const getStatusLabel = (days: number) => {
    if (days <= 0) return 'Expired'
    if (days === 1) return '1 day left'
    return days + ' days left'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  )

  if (!doc) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Document not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-white transition mb-6 block">← Back</button>

        <div className="bg-white rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{doc.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{doc.document_type}</p>
              {doc.days_until_expiry != null && (
                <span className={'inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full border ' + getStatusColor(doc.days_until_expiry)}>
                  {getStatusLabel(doc.days_until_expiry)}
                </span>
              )}
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="text-sm text-gray-400 hover:text-gray-900 transition font-medium"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {doc.expiry_date && (
              <div className="flex justify-between py-3">
                <span className="text-sm text-gray-500">Expiry date</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(doc.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {doc.issuing_country && (
              <div className="flex justify-between py-3">
                <span className="text-sm text-gray-500">Issued by</span>
                <span className="text-sm font-medium text-gray-900">{doc.issuing_country}</span>
              </div>
            )}
            {doc.ai_summary && (
              <div className="py-3">
                <span className="text-sm text-gray-500 block mb-1">AI summary</span>
                <span className="text-sm text-gray-700">{doc.ai_summary}</span>
              </div>
            )}
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-500">Added</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {editing && (
            <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Document type</label>
                <select value={editType} onChange={e => setEditType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Expiry date</label>
                <input type="date" value={editExpiry} onChange={e => setEditExpiry(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Issuing country</label>
                <input type="text" value={editCountry} onChange={e => setEditCountry(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. United Arab Emirates" />
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}
        </div>

        {doc.file_url && (
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="text-sm text-gray-500 mb-3">Document file</p>
            <img src={doc.file_url} alt={doc.name} className="w-full rounded-lg object-contain max-h-96" />
          </div>
        )}

        <button onClick={handleDelete} disabled={deleting} className="w-full border border-red-100 text-red-500 rounded-2xl py-3 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50">
          {deleting ? 'Deleting...' : 'Delete document'}
        </button>
      </div>
    </div>
  )
}
