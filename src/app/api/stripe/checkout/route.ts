import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Web checkout has been discontinued. Upgrade to Renewio Pro from the app instead.' },
    { status: 410 }
  )
}
