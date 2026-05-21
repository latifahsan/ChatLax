'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';

const FEATURES = [
  { icon: '⚡', title: 'Sub-20ms Delivery', desc: 'WebSocket-powered realtime messaging. Every keystroke, reaction, and status update lands instantly.' },
  { icon: '🔒', title: 'Secure by Design', desc: 'JWT sessions, Google OAuth 2.0, bcrypt password hashing, rate limiting, and strict CORS policies.' },
  { icon: '💬', title: 'Rich Interactions', desc: 'Reply in-thread, react with emoji, edit, pin, and search — every feature built with precision.' },
  { icon: '👥', title: 'Group Workspaces', desc: 'Create rooms, manage participants, pin announcements, and keep any team aligned effortlessly.' },
  { icon: '📎', title: 'File & Image Sharing', desc: 'Drag-and-drop images and documents into any conversation with instant cloud upload and preview.' },
  { icon: '🌐', title: 'Works Everywhere', desc: 'Responsive across every screen. Mobile-first design that feels native on any device.' },
];

const STATS = [
  { value: '<20ms', label: 'Message latency' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '∞', label: 'Message history' },
  { value: 'Free', label: 'Forever for individuals' },
];

const MOCKUP_MESSAGES = [
  { id: 1, from: 'them', name: 'Alex Chen', text: 'Just shipped the new auth flow 🚀', time: '9:41' },
  { id: 2, from: 'me', text: 'Looks clean. Nice work.', time: '9:42', read: true },
  { id: 3, from: 'them', name: 'Alex Chen', text: 'Socket latency is under 18ms 🔥', time: '9:42' },
  { id: 4, from: 'me', text: "That's what ChatLax is built for 😎", time: '9:43', read: true },
];

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedMsg({ msg, delay }: { msg: typeof MOCKUP_MESSAGES[0]; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'} transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <div className={`max-w-[78%] flex flex-col gap-1 ${msg.from === 'me' ? 'items-end' : 'items-start'}`}>
        {msg.from === 'them' && <span className="text-[10px] text-[#555] ml-1">{msg.name}</span>}
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.from === 'me' ? 'bg-[#e0e0e0] text-[#0a0a0a] rounded-br-sm' : 'bg-[#1e1e1e] text-[#e0e0e0] rounded-bl-sm border border-[#2a2a2a]'}`}>
          {msg.text}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#444]">{msg.time}</span>
          {msg.from === 'me' && msg.read && <span className="text-[10px] text-[#93c5fd]">✓✓</span>}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]' : 'py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Logo size={30} showText />
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Security', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[13px] text-[#888] hover:text-[#e0e0e0] transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-[#888] hover:text-[#e0e0e0] transition-colors px-3 py-1.5">Sign in</Link>
            <Link href="/register" className="text-[13px] bg-[#e0e0e0] text-[#0a0a0a] px-4 py-1.5 rounded-lg font-semibold hover:bg-white transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white opacity-[0.018] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500 opacity-[0.015] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-purple-500 opacity-[0.015] rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#111] border border-[#222] rounded-full px-4 py-1.5 text-[12px] text-[#777] mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Now in public beta — free forever for individuals
          </motion.div>

          <h1 className="text-[clamp(2.8rem,7.5vw,6rem)] font-bold leading-[1.04] tracking-[-0.02em] mb-7" style={{ fontFamily: 'Syne, sans-serif' }}>
            Messaging that feels
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e0e0e0] via-[#bbb] to-[#666]">
              like the future
            </span>
          </h1>

          <p className="text-[clamp(1rem,2vw,1.2rem)] text-[#5a5a5a] max-w-xl mx-auto mb-10 leading-relaxed">
            ChatLax is a premium realtime messaging platform built for clarity, speed, and elegance — private chats, group rooms, and rich interactions, all in one refined experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register"
              className="w-full sm:w-auto bg-[#e0e0e0] text-[#0a0a0a] px-8 py-3.5 rounded-xl font-semibold text-[15px] hover:bg-white transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Start messaging free
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto text-[#888] px-8 py-3.5 rounded-xl font-medium text-[15px] border border-[#222] hover:border-[#3a3a3a] hover:text-[#ccc] transition-all">
              Sign in →
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-2xl overflow-hidden max-w-2xl w-full">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[#0e0e0e] px-6 py-4 text-center">
              <div className="text-[20px] font-bold text-[#e0e0e0]" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
              <div className="text-[11px] text-[#555] mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Chat mockup */}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
          className="relative z-10 mt-20 w-full max-w-2xl mx-auto">
          <div className="relative rounded-2xl border border-[#1f1f1f] bg-[#111] shadow-[0_50px_100px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-[#0e0e0e]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <div className="flex-1 mx-4 bg-[#1a1a1a] rounded-md h-5 text-[10px] text-[#444] flex items-center justify-center">
                app.chatlax.io/chat
              </div>
            </div>
            <div className="flex h-[320px]">
              {/* Mini sidebar */}
              <div className="w-[170px] border-r border-[#1a1a1a] bg-[#0d0d0d] flex flex-col">
                <div className="p-3 border-b border-[#1a1a1a] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#e0e0e0] to-[#888] flex items-center justify-center">
                    <span className="text-[#0a0a0a] text-[8px] font-bold">C</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#888]">ChatLax</span>
                </div>
                {[{ name: 'Alex Chen', active: true, msg: 'Just shipped...', online: true }, { name: 'Design Team', active: false, msg: 'New mockups r...', online: false }, { name: 'Jordan Lee', active: false, msg: 'Can we sync?', online: true }].map(c => (
                  <div key={c.name} className={`flex items-center gap-2 p-3 ${c.active ? 'bg-[#1a1a1a]' : ''}`}>
                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#333] to-[#222] flex-shrink-0 flex items-center justify-center">
                      <span className="text-[9px] text-[#888]">{c.name[0]}</span>
                      {c.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-[#1a1a1a]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium text-[#ccc] truncate">{c.name}</div>
                      <div className="text-[9px] text-[#555] truncate">{c.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Chat area */}
              <div className="flex-1 flex flex-col bg-[#0a0a0a]">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1a1a1a]">
                  <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#333] to-[#222] flex items-center justify-center">
                    <span className="text-[9px] text-[#888]">A</span>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-[#0a0a0a]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold">Alex Chen</div>
                    <div className="text-[9px] text-green-400">Online</div>
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
                  {MOCKUP_MESSAGES.map((msg, i) => <AnimatedMsg key={msg.id} msg={msg} delay={300 + i * 400} />)}
                  <div className="flex items-center gap-2 opacity-50">
                    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                    <span className="text-[9px] text-[#444]">Alex is typing...</span>
                  </div>
                </div>
                <div className="p-3 border-t border-[#1a1a1a]">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-[10px] text-[#444] flex-1">Type a message...</span>
                    <div className="w-6 h-6 rounded-lg bg-[#e0e0e0] flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-white opacity-[0.025] blur-3xl rounded-full" />
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-30">
          <svg className="w-5 h-5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-[#444] mb-4 font-medium">Everything you need</p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-tight text-[#e0e0e0]" style={{ fontFamily: 'Syne, sans-serif' }}>
              Built for real conversations
            </h2>
            <p className="text-[15px] text-[#555] mt-4 max-w-xl mx-auto leading-relaxed">
              Every feature is crafted for the moments that matter — no bloat, just substance.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="h-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#2a2a2a] hover:bg-[#111] transition-all group">
                  <div className="text-2xl mb-4">{f.icon}</div>
                  <h3 className="text-[15px] font-semibold text-[#e0e0e0] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
                  <p className="text-[13px] text-[#555] leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why ChatLax */}
      <section className="py-24 px-6 border-y border-[#111]">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-[#444] mb-4 font-medium">Why ChatLax</p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-tight text-[#e0e0e0]" style={{ fontFamily: 'Syne, sans-serif' }}>
              Designed for the way you work
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🚀', title: 'Instant by default', body: 'Messages arrive before you blink. ChatLax is optimized end-to-end — from database write to screen render — for the lowest possible latency.' },
              { icon: '🎨', title: 'Premium aesthetics', body: 'Every pixel is intentional. A dark, minimal interface that gets out of your way and lets conversations breathe.' },
              { icon: '🔧', title: 'Production-grade stack', body: 'Built on Next.js, Express, Socket.IO, and MongoDB Atlas — the same stack powering apps at massive scale.' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0e0e0e] p-8 h-full">
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h3 className="text-[17px] font-bold text-[#e0e0e0] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>{item.title}</h3>
                  <p className="text-[13px] text-[#555] leading-relaxed">{item.body}</p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-[0.012] rounded-full blur-2xl" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-[11px] uppercase tracking-widest text-[#444] mb-4 font-medium">Security</p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-tight text-[#e0e0e0] mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Security you can trust
            </h2>
            <p className="text-[#555] text-[15px] leading-relaxed max-w-2xl mx-auto mb-14">
              Built from the ground up with security as a requirement, not an afterthought. Your data is protected at every layer.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'JWT Auth', desc: '7-day signed tokens with expiry', icon: '🔑' },
              { label: 'Google OAuth', desc: 'Sign in with your Google account', icon: '🔐' },
              { label: 'Rate Limiting', desc: '20 auth requests per 15 min', icon: '🚦' },
              { label: 'CORS Protected', desc: 'Strict origin allowlist', icon: '🛡️' },
              { label: 'bcrypt Hashing', desc: 'Passwords never stored plain', icon: '🔏' },
              { label: 'Helmet.js', desc: 'Secure HTTP headers set', icon: '⛑️' },
              { label: 'Input Validation', desc: 'Server-side sanitization', icon: '✅' },
              { label: 'Atlas Encrypted', desc: 'Data encrypted at rest', icon: '🗄️' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-4 text-center hover:border-[#2a2a2a] transition-colors">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-[12px] font-semibold text-[#ccc] mb-1">{item.label}</div>
                  <div className="text-[10px] text-[#444] leading-snug">{item.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="py-16 px-6 border-y border-[#111]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-widest text-[#3a3a3a] mb-8 font-medium">Powered by a modern stack</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['Next.js 14', 'TypeScript', 'Socket.IO', 'MongoDB Atlas', 'Express.js', 'Tailwind CSS', 'Framer Motion', 'Zustand'].map(tech => (
              <span key={tech} className="text-[13px] text-[#3a3a3a] font-mono hover:text-[#666] transition-colors">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative bg-[#0e0e0e] border border-[#1f1f1f] rounded-3xl p-14 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#3a3a3a] to-transparent" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#111] border border-[#222] rounded-full px-4 py-1.5 text-[11px] text-[#666] mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  No credit card required
                </div>
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-[#e0e0e0] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Ready to chat?
                </h2>
                <p className="text-[#555] text-[15px] mb-8 leading-relaxed">
                  Join ChatLax today. Free forever for individuals. No limits on messages or history.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-[#e0e0e0] text-[#0a0a0a] px-8 py-3.5 rounded-xl font-semibold text-[15px] hover:bg-white transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]">
                    Create free account →
                  </Link>
                  <Link href="/login"
                    className="inline-flex items-center justify-center text-[#666] px-8 py-3.5 rounded-xl text-[15px] border border-[#222] hover:border-[#333] hover:text-[#888] transition-all">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#111] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={24} showText />
            <span className="text-[#333] text-[13px] hidden md:block">© 2025 ChatLax. All rights reserved.</span>
          </div>
          <span className="text-[#333] text-[13px] md:hidden">© 2025 ChatLax. All rights reserved.</span>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'GitHub', 'Status'].map(link => (
              <a key={link} href="#" className="text-[12px] text-[#3a3a3a] hover:text-[#666] transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
