import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const filePath = formData.get('filePath') as string
    const fileUrl = formData.get('fileUrl') as string

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `Analyze this document and extract the following information. Return ONLY a valid JSON object with no extra text or markdown:
{
  "document_type": "type of document e.g. Passport, Driving Licence, Insurance Certificate, Visa, Emirates ID",
  "expiry_date": "expiry or renewal date in YYYY-MM-DD format, or null if not found",
  "issuing_country": "country that issued this document, or null if not found",
  "ai_summary": "one sentence summary of what this document is"
}`,
            },
          ],
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = responseText.replace(/```json|```/g, '').trim()
    const extracted = JSON.parse(cleaned)

    const today = new Date()
    const expiry = extracted.expiry_date ? new Date(extracted.expiry_date) : null
    const daysUntilExpiry = expiry
      ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null

    const { error: dbError } = await supabase.from('documents').insert({
      user_id: user.id,
      name,
      document_type: extracted.document_type || 'Unknown',
      expiry_date: extracted.expiry_date || null,
      days_until_expiry: daysUntilExpiry,
      issuing_country: extracted.issuing_country || null,
      ai_summary: extracted.ai_summary || null,
      file_url: fileUrl,
      file_path: filePath,
      status: 'active',
    })

    if (dbError) throw dbError

    return NextResponse.json({ success: true, extracted })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}