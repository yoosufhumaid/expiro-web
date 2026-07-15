import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const userId = session.metadata?.user_id
    console.log('checkout.session.completed — user_id:', userId)
    if (userId) {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        is_pro: true,
        stripe_customer_id: session.customer,
      })
      if (error) console.error('Supabase upsert error:', error)
      else console.log('Profile updated to Pro for user:', userId)
    } else {
      console.error('No user_id in session metadata')
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    await supabase.from('profiles').update({ is_pro: false }).eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
