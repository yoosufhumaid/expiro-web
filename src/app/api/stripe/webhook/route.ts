import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Stripe webhooks have been discontinued. Renewio Pro is now managed via RevenueCat.' },
    { status: 410 }
  )
}
