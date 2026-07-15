'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const DOC_TYPES = ['Passport', 'Emirates ID', 'Residence Visa', 'Driving Licence', 'Car Insurance', 'Vehicle Registration', 'Health Insurance', 'Tenancy Contract', 'Work Permit', 'Bank Card', 'Other']

export default function UploadPage() {
  const [mode, setMode] = useState<'choose' | 'manual' | 'ai'>('choose')
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [docType, setDocType] = useState('Passport')
  const [expiryDate, setExpiryDate] = useState('')
  const [issuingCountry, setIssuingCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleManualSave = async () => {
    if (!name || !expiryDate) {
      setError('Please fill in the name and expiry date.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    const { error: dbError } = await supabase.from('documents').insert({
      user_id: user.id,
      name,
      document_type: docType,
      expiry_date: expiryDate,
      days_until_expiry: daysUntilExpiry,
      issuing_country: issuingCountry || null,
      ai_summary: null,
      file_url: null,
      file_path: null,
      status: 'active',
    })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleAiUpload = async () => {
    if (!file || !name) {
      setError('Please add a name and select a file.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      setStatus('Uploading file...')
      const filePath = user.id + '/' + Date.now() + '_' + file.name
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)

      setStatus('Reading document with AI...')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name)
      formData.append('filePath', filePath)
      formData.append('fileUrl', publicUrl)

      const response = await fetch('/api/extract', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('AI extraction failed')

      setStatus('Done!')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
      setStatus('')
    }
  }

  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-white transition mb-10 block">← Back</button>
          <h1 className="text-xl font-semibold text-white mb-2">Add document</h1>
          <p className="text-gray-500 text-sm mb-8">How do you want to add it?</p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode('ai')}
              className="bg-gray-900 hover:bg-gray-800 active:scale-95 transition rounded-2xl p-6 text-left"
            >
              <div className="text-3xl mb-3">🤖</div>
              <div className="text-white font-medium text-base mb-1">Scan with AI</div>
              <div className="text-gray-500 text-sm">Upload a photo or PDF — AI reads the document and fills in the details automatically.</div>
            </button>
            <button
              onClick={() => setMode('manual')}
              className="bg-gray-900 hover:bg-gray-800 active:scale-95 transition rounded-2xl p-6 text-left"
            >
              <div className="text-3xl mb-3">✏️</div>
              <div className="text-white font-medium text-base mb-1">Enter manually</div>
              <div className="text-gray-500 text-sm">Type in the details yourself. Quick and simple.</div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'manual') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
          <button onClick={() => setMode('choose')} className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">← Back</button>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add document</h1>
          <p className="text-gray-500 text-sm mb-6">Fill in the details manually.</p>

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Document name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="e.g. My Passport, Dad's Emirates ID"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Document type</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing country <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={issuingCountry}
              onChange={e => setIssuingCountry(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="e.g. United Arab Emirates"
            />
          </div>

          <button
            onClick={handleManualSave}
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save document'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <button onClick={() => setMode('choose')} className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">← Back</button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Scan document</h1>
        <p className="text-gray-500 text-sm mb-6">Upload a photo or PDF and AI will extract the details.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Document name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="e.g. UAE Passport, Car Insurance"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload file</label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            {file ? (
              <div>
                <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                <button onClick={() => setFile(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Remove</button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm text-gray-500">Click to select a file</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, or PDF</p>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
        </div>

        <button
          onClick={handleAiUpload}
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? status || 'Processing...' : 'Upload and extract'}
        </button>
      </div>
    </div>
  )
}
