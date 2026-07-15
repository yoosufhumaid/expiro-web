import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Expiro — Never miss a renewal in the UAE',
  description: 'Track your visa, Emirates ID, passport, car insurance, and subscriptions in one place. Built for UAE expats.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-gray-900">expiro<span className="text-red-500">.</span></span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-500 font-medium hover:text-gray-900">Sign in</Link>
          <Link href="/auth/signup" className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Built for UAE expats
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mb-5">
          Never pay a fine for a<br /><span className="text-red-500">forgotten renewal</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Track your visa, Emirates ID, passport, car insurance, tenancy, and subscriptions — all in one place, sorted by urgency.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/auth/signup" className="bg-red-500 hover:bg-red-600 text-white font-bold px-7 py-3.5 rounded-lg text-base transition-colors">
            Get started free
          </Link>
          <a href="https://apps.apple.com" className="border border-gray-200 hover:border-gray-400 text-gray-900 font-semibold px-7 py-3.5 rounded-lg text-base transition-colors">
            Download on iOS
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-5">Visa overstay in the UAE costs <strong className="text-red-500">AED 50 per day.</strong> One month = AED 1,500 in fines.</p>
      </section>

      {/* App mockup */}
      <div className="max-w-sm mx-auto px-6 mb-16">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-bold text-gray-900">Expiro</span>
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">YH</span>
            </div>
          </div>
          <div className="bg-red-900 border border-red-800 rounded-xl p-3 flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
            <span className="text-red-300 text-xs font-medium">2 things need attention now</span>
          </div>
          {[
            { name: 'Emirates ID', sub: 'Identity document', badge: '3d left', color: 'bg-red-900 text-red-300' },
            { name: 'Tenancy Contract', sub: 'Property', badge: '24d left', color: 'bg-amber-900 text-amber-300' },
            { name: 'Passport', sub: 'Travel document', badge: '312d left', color: 'bg-green-900 text-green-300' },
          ].map(item => (
            <div key={item.name} className="bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.sub}</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.color}`}>{item.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 border-y border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '10.2M', label: 'UAE expats with documents to track' },
            { num: 'AED 50', label: 'per day for visa overstay' },
            { num: 'AED 1,000', label: 'max fine for late Emirates ID' },
            { num: '0', label: 'apps built for UAE expats — until now' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-gray-900">{s.num}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 py-20" id="features">
        <p className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">Features</p>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Everything that can expire,<br />in one place</h2>
        <p className="text-gray-500 mb-12">Expiro tracks all the things UAE expats constantly lose track of.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Urgency dashboard',
              desc: 'Everything sorted by how urgent it is. Red means act now. Yellow means soon.',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            },
            {
              title: 'Push notifications',
              desc: 'Get reminded 90, 30, 7, and 1 day before anything expires.',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            },
            {
              title: 'Subscription tracker',
              desc: 'Track Netflix, Spotify, iCloud, gym — see your total monthly spend.',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            },
            {
              title: 'Household sharing',
              desc: 'Invite your spouse or family. Track everyone\'s documents together. Coming soon.',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            },
            {
              title: 'Share status card',
              desc: 'Generate a shareable card. Useful for PRO services or your HR team.',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            },
            {
              title: 'Conversational adding',
              desc: 'Add a document in under 20 seconds. No forms. Just tap and done.',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            },
          ].map(f => (
            <div key={f.title} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doc types */}
      <div className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">What you can track</p>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Every document UAE expats need</h2>
          <p className="text-gray-500 mb-8">Pre-built for the UAE. These are the actual documents that get expats fined.</p>
          <div className="flex flex-wrap gap-2">
            {['Visa / Residence permit', 'Emirates ID', 'Passport', 'Driving licence', 'Car insurance', 'Health insurance', 'Tenancy contract', 'Labour card', 'Netflix', 'Spotify', 'Gym membership', 'iCloud storage', 'Any subscription'].map(t => (
              <div key={t} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fines */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">The real cost of forgetting</p>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Fines add up fast</h2>
        <p className="text-gray-500 mb-10">These are real UAE government penalties.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { amount: 'AED 50', desc: 'Per day — visa overstay', note: '30 days = AED 1,500', danger: true },
            { amount: 'AED 20', desc: 'Per day — Emirates ID', note: 'Max fine AED 1,000', danger: true },
            { amount: 'Cancelled', desc: 'Car insurance lapse', note: 'Criminal offence in UAE', danger: false },
            { amount: 'AED 19', desc: 'Expiro Pro per month', note: 'Less than half a day of fines', danger: false },
          ].map(f => (
            <div key={f.desc} className={`rounded-xl p-5 border ${f.danger ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className={`text-2xl font-extrabold mb-1 ${f.danger ? 'text-red-500' : 'text-amber-600'}`}>{f.amount}</div>
              <div className="text-xs font-semibold text-gray-700 mb-1">{f.desc}</div>
              <div className="text-xs text-gray-500">{f.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <div className="bg-gray-50 border-y border-gray-100 py-20" id="pricing">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Simple, honest pricing</h2>
          <p className="text-gray-500 mb-12">No App Store markup — you pay on the web, we keep 100% out of Apple's cut.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-7 flex flex-col">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Free</p>
              <div className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">AED 0 <span className="text-base font-medium text-gray-400">/mo</span></div>
              <p className="text-xs text-gray-400 mb-6">Forever free, no card required</p>
              <ul className="space-y-2 mb-8 flex-1">
                {['Up to 3 documents', 'Up to 3 subscriptions', 'Urgency dashboard', 'Push notifications'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block text-center border border-gray-200 hover:border-gray-400 text-gray-900 font-semibold py-3 rounded-lg text-sm transition-colors">
                Start for free
              </Link>
            </div>
            <div className="bg-white border-2 border-red-500 rounded-2xl p-7 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-4 py-1 rounded-full tracking-wider">MOST POPULAR</div>
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Pro</p>
              <div className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">AED 19 <span className="text-base font-medium text-gray-400">/mo</span></div>
              <p className="text-xs text-gray-400 mb-6">or AED 129/year — save AED 99</p>
              <ul className="space-y-2 mb-8 flex-1">
                {['Unlimited documents', 'Unlimited subscriptions', 'Urgency dashboard', 'Push notifications', 'Share status card', 'Household sharing (coming soon)', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?plan=pro" className="block text-center bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg text-sm transition-colors">
                Get Pro — AED 19/mo
              </Link>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">Payments processed securely by Stripe. Cancel any time.</p>
        </div>
      </div>

      {/* Final CTA */}
      <section className="bg-gray-900 py-20 text-center px-6">
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-3">Stop paying fines.<br /><span className="text-red-500">Start using Expiro.</span></h2>
        <p className="text-gray-400 mb-10">Free to start. Takes 2 minutes to set up.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/auth/signup" className="bg-white text-gray-900 font-bold px-7 py-3.5 rounded-lg text-base hover:opacity-90 transition-opacity">
            Get started free
          </Link>
          <a href="https://apps.apple.com" className="border border-white/20 text-white font-semibold px-7 py-3.5 rounded-lg text-base hover:border-white/50 transition-colors">
            Download on iOS
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 px-6 py-6 flex items-center justify-between flex-wrap gap-4">
        <span className="text-white font-bold">expiro<span className="text-red-500">.</span></span>
        <div className="flex gap-5">
          <a href="https://expiro-privacy.vercel.app/privacy.html" className="text-xs text-gray-500 hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Terms</a>
          <a href="mailto:hello@expiro.app" className="text-xs text-gray-500 hover:text-white transition-colors">Contact</a>
        </div>
      </footer>

    </main>
  )
}
