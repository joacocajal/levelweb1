'use client'

import Image from 'next/image'
import { useRef, useState, useEffect, useCallback } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  type Variants,
} from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

// ─── Supabase ─────────────────────────────────────────────────────────────────
let _sb: ReturnType<typeof createClient> | null = null
function sb() {
  if (!_sb) _sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL     ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder',
  )
  return _sb
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const RED = '#c0392b'
const B = { fontFamily: "'Bebas Neue', sans-serif" } satisfies React.CSSProperties
const I = { fontFamily: 'Inter, sans-serif'        } satisfies React.CSSProperties

// Lunes 18/05/2026 19:00 ART = 22:00 UTC
const DROP_TARGET = new Date('2026-05-18T22:00:00Z')

// ─── Motion variants ──────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } },
}
const stag: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13 } },
}
const vp = { once: true, amount: 0.15 } as const

// ─── Keyframes injected once ──────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes grain {
    0%,100%{transform:translate(0,0)}
    10%{transform:translate(-5%,-10%)}
    20%{transform:translate(-15%,5%)}
    30%{transform:translate(7%,-25%)}
    40%{transform:translate(-5%,25%)}
    50%{transform:translate(-15%,10%)}
    60%{transform:translate(15%,0)}
    70%{transform:translate(0,15%)}
    80%{transform:translate(3%,35%)}
    90%{transform:translate(-10%,10%)}
  }
  @keyframes glitch {
    0%,80%,100%{text-shadow:none}
    82%{text-shadow:-3px 0 #0ff,3px 0 #f06}
    84%{text-shadow:2px 0 #0ff,-2px 0 #f06}
    86%{text-shadow:none}
    88%{text-shadow:3px 0 #f06,-3px 0 #0ff}
    90%{text-shadow:none}
  }
  @keyframes arrowPulse {
    0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.6)}
    50%{box-shadow:0 0 0 14px rgba(192,57,43,0)}
  }
`

// ─── Film Grain ───────────────────────────────────────────────────────────────
// Fixed overlay · inset-0 · pointer-events-none · z-[9999]
// SVG fractalNoise con opacidad 0.02 — textura de grano de película
function FilmGrain() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-50%', left: '-50%',
          width: '200%', height: '200%',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '220px 220px',
          animation: 'grain 0.35s steps(1) infinite',
        }}
      />
    </>
  )
}

// ─── Products ─────────────────────────────────────────────────────────────────
const SIZES = ['S', 'M', 'L', 'XL'] as const
type Size   = typeof SIZES[number]

const PRODUCTS = [
  {
    id: 'identity', name: 'IDENTITY', color: 'Negro', available: 5,
    front: '/img/negra-frente.png',  back: '/img/negra-espalda.png',
    wa: 'https://wa.me/5493816512413?text=Hola!%20Quiero%20reservar%20Identity%20-%20Negro%20Talle%20',
  },
  {
    id: 'yourrules', name: 'YOUR RULES', color: 'Blanco', available: 8,
    front: '/img/blanca-frente.png', back: '/img/blanca-espalda.png',
    wa: 'https://wa.me/5493816512413?text=Hola!%20Quiero%20reservar%20Your%20Rules%20-%20Blanco%20Talle%20',
  },
] as const

// ─── Flip Card ────────────────────────────────────────────────────────────────
function FlipCard({ p }: { p: typeof PRODUCTS[number] }) {
  const [flipped, setFlipped] = useState(false)
  const [size,    setSize]    = useState<Size | null>(null)

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => setFlipped(f => !f)}
      onKeyDown={e => e.key === 'Enter' && setFlipped(f => !f)}
      style={{ width: 288, height: 400, perspective: '1400px', cursor: 'pointer', userSelect: 'none' }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>

        {/* ── FRONT ── */}
        <div style={{
          position: 'absolute', inset: 0, background: '#060606',
          border: `1px solid ${RED}`,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden' as React.CSSProperties['WebkitBackfaceVisibility'],
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 18px 20px',
          boxShadow: `0 0 0 1px #0a0a0a, 0 32px 80px rgba(0,0,0,0.98), 0 0 60px rgba(${parseInt(RED.slice(1,3),16)},${parseInt(RED.slice(3,5),16)},${parseInt(RED.slice(5,7),16)},0.08)`,
        }}>
          <div style={{ width: '100%', height: 2, background: RED }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
            <Image src={p.front} alt={p.name} width={220} height={260}
              style={{ objectFit: 'contain', maxHeight: 230 }} />
          </div>
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <p style={{ ...B, fontSize: 26, letterSpacing: '0.1em', color: RED }}>{p.name}</p>
            <p style={{ ...I, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#444', marginTop: 4 }}>{p.color}</p>
            <p style={{ ...I, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: RED, marginTop: 3 }}>{p.available} restantes</p>
            <p style={{ ...I, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1e1e1e', marginTop: 12 }}>
              Tap para ver dorso →
            </p>
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{
          position: 'absolute', inset: 0, background: '#060606',
          border: `1px solid ${RED}`,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden' as React.CSSProperties['WebkitBackfaceVisibility'],
          transform: 'rotateY(180deg)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14, padding: 18,
          boxShadow: `0 32px 80px rgba(0,0,0,0.98)`,
        }}>
          <div style={{ width: '100%', height: 2, background: RED }} />
          <Image src={p.back} alt={`${p.name} dorso`} width={220} height={220}
            style={{ objectFit: 'contain', maxHeight: 190 }} />
          <p style={{ ...B, fontSize: 22, letterSpacing: '0.1em', color: RED }}>{p.name}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {SIZES.map(s => (
              <button key={s}
                onClick={e => { e.stopPropagation(); setSize(s) }}
                aria-pressed={size === s}
                style={{
                  width: 44, height: 44, ...I, fontSize: 12, fontWeight: 700, color: '#fff',
                  background: size === s ? RED : 'transparent',
                  border: `2px solid ${size === s ? RED : '#1f1f1f'}`,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >{s}</button>
            ))}
          </div>
          <a
            href={size ? `${p.wa}${encodeURIComponent(size)}` : '#'}
            target="_blank" rel="noopener noreferrer"
            onClick={e => { e.stopPropagation(); if (!size) e.preventDefault() }}
            style={{
              width: '100%', textAlign: 'center', display: 'block',
              ...B, fontSize: 13, letterSpacing: '0.22em',
              padding: '13px 0', minHeight: 46,
              background: size ? RED : 'transparent',
              border: `1px solid ${size ? RED : '#1a1a1a'}`,
              color: '#fff', opacity: size ? 1 : 0.25,
              textDecoration: 'none', transition: 'all 0.18s',
            }}
          >RESERVAR · WHATSAPP</a>
          <p style={{ ...I, fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#1a1a1a' }}>
            Tap para volver
          </p>
        </div>

      </div>
    </div>
  )
}

// ─── Easter Egg Modal ─────────────────────────────────────────────────────────
type EggPhase = 'story' | 'form' | 'done'

function EasterEggModal({ onClose, onClaim }: { onClose(): void; onClaim(): void }) {
  const [phase,   setPhase]   = useState<EggPhase>('story')
  const [nome,    setNome]    = useState('')
  const [email,   setEmail]   = useState('')
  const [wapp,    setWapp]    = useState('')
  const [prod,    setProd]    = useState('')
  const [talle,   setTalle]   = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !prod || !talle) return
    const payload = {
      nombre: nome.trim(), email: email.trim(), whatsapp: wapp.trim(),
      producto: prod, talle,
      es_fundador: true, detalle_descuento: '5% OFF - FUNDADOR',
    }
    console.log('[LEVEL] Founder payload:', payload)
    setSending(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sb().from('reservas_level') as any).insert([payload])
      console.log('LEVEL: Reserva enviada', payload)
    } catch (err) {
      console.error('[LEVEL] Supabase error:', err)
    }
    onClaim()
    setPhase('done')
    setSending(false)
  }

  const inp: React.CSSProperties = {
    ...I, background: 'transparent', border: 'none',
    borderBottom: '1px solid #222', color: '#fff', fontSize: 14,
    padding: '12px 0', outline: 'none', width: '100%',
  }
  const sel: React.CSSProperties = {
    ...I, background: '#0a0a0a', border: '1px solid #1e1e1e',
    color: '#fff', fontSize: 13, padding: '12px 14px',
    outline: 'none', width: '100%', cursor: 'pointer',
  }
  const lbl: React.CSSProperties = {
    ...I, fontSize: 9, letterSpacing: '0.38em',
    textTransform: 'uppercase', color: '#333',
  }

  return (
    // ─ fixed inset-0 · flex items-center justify-center · bg-black · z-[100] ─
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ delay: 0.06, duration: 0.42, ease: [0.22,1,0.36,1] }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 480,
          margin: 'auto',
          background: '#040404', border: `1px solid ${RED}`,
          padding: 'clamp(36px,6vw,56px) clamp(28px,5vw,48px)',
          textAlign: 'center',
        }}
      >
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: RED }} />
        {/* Bottom accent */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `${RED}30` }} />

        <AnimatePresence mode="wait">

          {/* ── STORY ── */}
          {phase === 'story' && (
            <motion.div key="story"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <p style={{
                ...B, fontSize: 'clamp(1.2rem,5vw,1.9rem)', letterSpacing: '0.14em',
                color: RED, marginBottom: 28,
                animation: 'glitch 4s infinite',
              }}>
                ACCESO NIVEL FUNDADOR
              </p>
              <div style={{ width: 28, height: 1, background: RED, margin: '0 auto 28px' }} />
              <p style={{ ...I, fontSize: '0.9rem', lineHeight: 2, color: '#5a5a5a', marginBottom: 40 }}>
                LEVEL no nació en una oficina.<br />
                Nació de las ganas de superarnos.<br />
                Horas de diseño, pruebas de tela y la obsesión de Joaco y Maxi<br />
                por crear algo real. Este es el Drop 00.<br />
                Gracias por ser parte.
              </p>
              <button
                onClick={() => setPhase('form')}
                style={{
                  ...B, fontSize: 'clamp(0.78rem,2.4vw,0.95rem)', letterSpacing: '0.18em',
                  padding: '18px 24px', width: '100%', minHeight: 54,
                  background: RED, border: 'none', color: '#fff',
                  cursor: 'pointer', marginBottom: 18,
                  transition: 'opacity 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                RECLAMAR BENEFICIO FUNDADOR (5% OFF)
              </button>
              <button onClick={onClose} style={{
                ...I, fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase',
                background: 'transparent', border: 'none', color: '#252525',
                cursor: 'pointer', padding: 8,
              }}>cerrar</button>
            </motion.div>
          )}

          {/* ── FORM ── */}
          {phase === 'form' && (
            <motion.div key="form"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <p style={{ ...B, fontSize: 'clamp(1rem,4vw,1.55rem)', letterSpacing: '0.1em', color: RED, marginBottom: 6 }}>
                RESERVA EXCLUSIVA FUNDADOR
              </p>
              <p style={{ ...I, fontSize: 9, letterSpacing: '0.42em', textTransform: 'uppercase', color: '#333', marginBottom: 4 }}>
                DROP 00 · 5% OFF APLICADO
              </p>
              <div style={{ width: 28, height: 1, background: RED, margin: '0 auto 28px' }} />

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left' }} noValidate>
                {[
                  { lbl: 'Nombre *', type: 'text',  val: nome,  set: setNome,  ph: 'Tu nombre' },
                  { lbl: 'Email *',  type: 'email', val: email, set: setEmail, ph: 'tu@email.com' },
                  { lbl: 'WhatsApp', type: 'tel',   val: wapp,  set: setWapp,  ph: '+54 9 381…' },
                ].map(({ lbl: l, type, val, set, ph }) => (
                  <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={lbl}>{l}</label>
                    <input style={inp} type={type} value={val}
                      onChange={e => (set as (v: string) => void)(e.target.value)} placeholder={ph} />
                  </div>
                ))}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={lbl}>Producto *</label>
                  <select style={sel} value={prod} onChange={e => setProd(e.target.value)} required>
                    <option value="">Elegí un producto</option>
                    <option value="IDENTITY - Negro">IDENTITY — Negro</option>
                    <option value="YOUR RULES - Blanco">YOUR RULES — Blanco</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={lbl}>Talle *</label>
                  <select style={sel} value={talle} onChange={e => setTalle(e.target.value)} required>
                    <option value="">Elegí tu talle</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={sending} style={{
                  ...B, fontSize: 'clamp(0.78rem,2.4vw,0.95rem)', letterSpacing: '0.18em',
                  padding: '18px 24px', width: '100%', minHeight: 54,
                  background: sending ? '#111' : RED, border: 'none', color: '#fff',
                  cursor: sending ? 'default' : 'pointer', marginTop: 6,
                  transition: 'background 0.18s',
                }}>
                  {sending ? 'ENVIANDO…' : 'CONFIRMAR RESERVA FUNDADOR'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── DONE ── */}
          {phase === 'done' && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.42, ease: [0.22,1,0.36,1] }}
            >
              <p style={{ ...B, fontSize: 'clamp(2rem,7vw,3rem)', color: RED, letterSpacing: '0.06em', lineHeight: 0.9, marginBottom: 24 }}>
                BIENVENIDO<br />A LA GÉNESIS
              </p>
              <div style={{ width: 28, height: 1, background: RED, margin: '0 auto 28px' }} />
              <p style={{ ...I, fontSize: '0.9rem', lineHeight: 2.1, color: '#4a4a4a', marginBottom: 40 }}>
                Tu identidad no se negocia.<br />
                Sos parte oficial del Drop 00 de LEVEL.<br />
                Tu beneficio del 5% OFF ya está vinculado a este contacto.<br />
                Nos vemos en la cima.
              </p>
              <button onClick={onClose} style={{
                ...B, fontSize: '0.9rem', letterSpacing: '0.24em',
                padding: '15px 40px', background: 'transparent',
                border: `1px solid ${RED}`, color: RED, cursor: 'pointer',
                transition: 'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = RED }}
              >CERRAR</button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// ─── Static Hero ──────────────────────────────────────────────────────────────
// Primera pantalla: logo rojo centrado, fondo negro puro. Sin video, sin scroll.
// Carga instantánea, impacto máximo.
function StaticHero() {
  return (
    <section style={{
      height: '100vh', background: '#000000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid sutil */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)',
        backgroundSize: '72px 72px',
      }} />

      {/* Badge */}
      <motion.span
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ ...I, display: 'inline-block', padding: '5px 20px', border: '1px solid #161616', color: '#2a2a2a', fontSize: 10, letterSpacing: '0.48em', textTransform: 'uppercase', marginBottom: 48, position: 'relative', zIndex: 1 }}
      >
        Drop 00 · Edición Limitada
      </motion.span>

      {/* Logo — centrado, glow rojo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Image src="/img/logorojosf.png" alt="LEVEL" width={700} height={700} priority
          style={{
            width: 'clamp(280px, 58vw, 680px)',
            height: 'auto', objectFit: 'contain',
            filter: `drop-shadow(0 0 90px rgba(192,57,43,0.45)) drop-shadow(0 0 30px rgba(192,57,43,0.25))`,
          }}
        />
      </motion.div>

      {/* Flecha de scroll animada */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }}
        style={{ position: 'absolute', bottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 1 }}
      >
        <span style={{ ...I, fontSize: 9, letterSpacing: '0.52em', textTransform: 'uppercase', color: '#181818' }}>Scroll</span>
        <div style={{ width: 1, height: 52, background: `linear-gradient(to bottom, ${RED}, transparent)` }} />
      </motion.div>
    </section>
  )
}

// ─── Nav Arrow ────────────────────────────────────────────────────────────────
function NavArrow({ dir, onClick }: { dir: 'left' | 'right'; onClick(): void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={dir === 'left' ? 'Anterior' : 'Siguiente'}
      style={{
        position: 'absolute',
        [dir === 'left' ? 'left' : 'right']: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        animation: 'arrowPulse 2s ease-in-out infinite',
        zIndex: 60,
        background: hov ? `${RED}22` : 'transparent',
        border: `2px solid ${RED}`,
        color: hov ? '#fff' : RED,
        width: 72, height: 72,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, transition: 'background 0.2s, color 0.2s',
        fontFamily: 'sans-serif',
      }}
    >
      {dir === 'left' ? '←' : '→'}
    </button>
  )
}

// ─── Waitlist Form ────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email,   setEmail]   = useState('')
  const [done,    setDone]    = useState(false)
  const [sending, setSending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sb().from('waitlist_level') as any).insert([{ email: email.trim() }])
    } catch (err) { console.error('[LEVEL] Waitlist:', err) }
    setDone(true)
    setSending(false)
  }

  return (
    <motion.section
      variants={stag} initial="hidden" whileInView="show" viewport={vp}
      style={{
        minHeight: '80vh', background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(60px,10vw,120px) clamp(24px,8vw,80px)',
        textAlign: 'center',
      }}
    >
      <motion.p variants={fadeUp} style={{ ...I, fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase', color: '#3a3a3a', marginBottom: 16 }}>
        Comunidad · Drop 00
      </motion.p>
      <motion.h2 variants={fadeUp} style={{ ...B, fontSize: 'clamp(2rem,6vw,3.5rem)', letterSpacing: '0.03em', color: '#fff', lineHeight: 0.9, marginBottom: 16 }}>
        ENTRAR A LA LISTA
      </motion.h2>
      <motion.div variants={fadeUp} style={{ width: 32, height: 1, background: RED, marginBottom: 48 }} />

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <p style={{ ...B, fontSize: 'clamp(1.4rem,4vw,2.2rem)', color: RED, letterSpacing: '0.06em' }}>ESTÁS DENTRO.</p>
            <p style={{ ...I, fontSize: '0.85rem', color: '#3a3a3a', marginTop: 16, lineHeight: 1.9 }}>
              Te avisamos en cada drop exclusivo.
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" variants={fadeUp} onSubmit={submit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 400 }}
          >
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" required
              style={{
                ...I, background: 'transparent', border: 'none',
                borderBottom: '1px solid #1a1a1a', color: '#fff', fontSize: 15,
                padding: '14px 0', outline: 'none', letterSpacing: '0.05em', textAlign: 'center',
              }}
            />
            <button type="submit" disabled={sending} style={{
              ...B, fontSize: 'clamp(0.75rem,2.2vw,0.92rem)', letterSpacing: '0.22em',
              padding: '16px 24px', minHeight: 50,
              background: sending ? '#111' : RED, border: 'none', color: '#fff',
              cursor: sending ? 'default' : 'pointer', transition: 'background 0.18s',
            }}>
              {sending ? 'ENVIANDO…' : 'UNIRME A LA LISTA'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

// ─── HorizontalNav — grid bidireccional (3 col × scroll vertical interno) ─────
// Wrapper: 100vw × 100vh, overflow:hidden — el window scroll NO entra aquí
// Track: 300vw flex, animado en X con GSAP power3.inOut
// Columns: 100vw × 100vh, overflow-y: auto — scroll interno independiente
// Swipe táctil: detecta sólo gestos predominantemente horizontales
function HorizontalNav({ onEasterEgg }: { onEasterEgg(): void }) {
  const [col, setCol] = useState(0)
  const [navLocked, setNavLocked] = useState(false)
  const navLockedRef = useRef(false)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const col1Ref  = useRef<HTMLDivElement>(null)
  const col2Ref  = useRef<HTMLDivElement>(null)
  const col3Ref  = useRef<HTMLDivElement>(null)

  const goTo = useCallback((idx: number) => {
    if (navLockedRef.current) return
    if (!trackRef.current) return
    gsap.to(trackRef.current, {
      x: -(idx * window.innerWidth),
      duration: 0.85,
      ease: 'power3.inOut',
    })
    setCol(idx)
  }, [])

  // Wheel handler — redirige el scroll de rueda al div de la columna activa.
  // Lenis intercepta los eventos de window; este handler con passive:false
  // los captura primero y los envía al contenedor interno correcto.
  useEffect(() => {
    const colRefs = [col1Ref, col2Ref, col3Ref]
    const cleanups: (() => void)[] = []

    colRefs.forEach(ref => {
      const el = ref.current
      if (!el) return
      const fn = (e: WheelEvent) => {
        const atTop    = el.scrollTop <= 0
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
        // Scroll up desde el tope → deja que el window suba (vuelve al video)
        if (e.deltaY < 0 && atTop) return
        // Ya en el fondo → no hace nada
        if (e.deltaY > 0 && atBottom) return
        el.scrollTop += e.deltaY
        e.preventDefault()
        e.stopPropagation()
      }
      el.addEventListener('wheel', fn, { passive: false })
      cleanups.push(() => el.removeEventListener('wheel', fn))
    })
    return () => cleanups.forEach(fn => fn())
  }, [])

  // Swipe táctil — sólo dispara si el gesto es más horizontal que vertical
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let sx = 0, sy = 0
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY }
    const onEnd   = (e: TouchEvent) => {
      if (navLockedRef.current) return
      const dx = e.changedTouches[0].clientX - sx
      const dy = e.changedTouches[0].clientY - sy
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.8) return
      setCol(c => {
        const n = dx < 0 ? Math.min(c + 1, 2) : Math.max(c - 1, 0)
        if (n !== c && trackRef.current)
          gsap.to(trackRef.current, { x: -(n * window.innerWidth), duration: 0.85, ease: 'power3.inOut' })
        return n
      })
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchend', onEnd)
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd) }
  }, [])

  // Bloquea nav horizontal cuando la columna activa tiene scroll interno
  useEffect(() => {
    const colEls = [col1Ref.current, col2Ref.current, col3Ref.current]
    const el = colEls[col]
    if (!el) return
    const sync = () => {
      const lk = el.scrollTop > 80
      navLockedRef.current = lk
      setNavLocked(lk)
    }
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    return () => el.removeEventListener('scroll', sync)
  }, [col])

  const colStyle: React.CSSProperties = {
    width: '100vw', height: '100vh',
    overflowY: 'auto', overflowX: 'hidden',
    flexShrink: 0, position: 'relative',
  }

  const GRID = 'linear-gradient(rgba(255,255,255,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.016) 1px,transparent 1px)'

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>

      {/* Flechas de navegación lateral */}
      {!navLocked && col > 0 && <NavArrow dir="left"  onClick={() => goTo(col - 1)} />}
      {!navLocked && col < 2 && <NavArrow dir="right" onClick={() => goTo(col + 1)} />}

      {/* Indicadores de columna activa */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 60 }}>
        {[0, 1, 2].map(i => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Columna ${i + 1}`} style={{
            width: 6, height: 6, borderRadius: '50%', border: 'none', padding: 0,
            background: col === i ? RED : '#1c1c1c',
            cursor: 'pointer', transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Track — 300vw */}
      <div ref={trackRef} style={{ display: 'flex', width: '300vw', height: '100%', willChange: 'transform' }}>

        {/* ── COLUMNA 1: Eslogan + Historia + Footer ── */}
        <div ref={col1Ref} style={colStyle}>
          {/* Eslogan */}
          <section style={{
            minHeight: '100vh', background: '#0c0c0c', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(80px,10vw,120px) 24px', textAlign: 'center',
          }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: GRID, backgroundSize: '72px 72px' }} />
            <motion.div variants={stag} initial="hidden" animate="show"
              style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
            >
              <motion.span variants={fadeUp} style={{ ...I, display: 'inline-block', padding: '5px 18px', border: '1px solid #1a1a1a', color: '#4a4a4a', fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase' }}>
                Drop 00 · Edición Limitada
              </motion.span>
              <motion.div variants={fadeUp}>
                <Image src="/img/logorojosf.png" alt="LEVEL" width={700} height={700} priority
                  style={{ width: 'clamp(240px,52vw,600px)', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 48px rgba(192,57,43,0.18))' }} />
              </motion.div>
              <motion.h1 variants={fadeUp} onDoubleClick={onEasterEgg}
                style={{ ...B, fontSize: '18vw', lineHeight: 0.82, letterSpacing: '0.02em', color: '#fff', cursor: 'default', userSelect: 'none' }}>
                WE ARE THE<br />NEXT LEVEL
              </motion.h1>
              <motion.p variants={fadeUp} style={{ ...I, fontSize: '0.68rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#3a3a3a' }}>
                13 Piezas · Sin reposición · AW 2026
              </motion.p>
              {/* Hint de navegación horizontal → */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1.2 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}
              >
                <span style={{ ...I, fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#1c1c1c' }}>
                  → El Drop
                </span>
                <div style={{ width: 32, height: 1, background: '#181818' }} />
                <span style={{ ...I, fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#1c1c1c' }}>
                  ↓ Nuestra historia
                </span>
              </motion.div>
            </motion.div>
          </section>
          <Historia />
          <footer style={{ background: '#000', borderTop: '1px solid #080808', padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ ...I, fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase', color: '#0e0e0e' }}>
              © 2026 Level · Drop 00 · Todos los derechos reservados
            </p>
          </footer>
        </div>

        {/* ── COLUMNA 2: El Drop + Cartas (scroll interno, containerRef) ── */}
        <div ref={col2Ref} style={colStyle}>
          {/* Drop header */}
          <section style={{
            minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(80px,10vw,120px) 24px', textAlign: 'center',
          }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: GRID, backgroundSize: '72px 72px' }} />
            <motion.div variants={stag} initial="hidden" animate={col === 1 ? 'show' : 'hidden'}
              style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
            >
              <motion.p variants={fadeUp} style={{ ...I, fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase', color: '#3a3a3a' }}>
                El Producto
              </motion.p>
              <motion.h2 variants={fadeUp} style={{ ...B, fontSize: 'clamp(5rem,20vw,16rem)', letterSpacing: '0.03em', color: '#fff', lineHeight: 0.85 }}>
                EL DROP
              </motion.h2>
              <motion.div variants={fadeUp} style={{ width: 32, height: 1, background: RED }} />
              <motion.p variants={fadeUp} style={{ ...I, fontSize: '0.9rem', lineHeight: 2, color: '#484848', maxWidth: 440 }}>
                Drop 00. 13 piezas. Sin reposición.<br />
                Dos diseños que definen quién sos.
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
                style={{ ...I, fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#1c1c1c', marginTop: 8 }}>
                ↓ Scroll para ver la colección
              </motion.div>
            </motion.div>
          </section>
          {/* Cartas — containerRef conectado para que useScroll trackee scroll interno */}
          <PhraseCard line1="TU IDENTIDAD" line2="NO SE NEGOCIA" product={PRODUCTS[0]} containerRef={col2Ref} />
          <PhraseCard line1="VOS PONÉS"    line2="LAS REGLAS"    product={PRODUCTS[1]} containerRef={col2Ref} />
        </div>

        {/* ── COLUMNA 3: Comunidad + Waitlist ── */}
        <div ref={col3Ref} style={colStyle}>
          <section style={{
            minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(80px,10vw,120px) clamp(24px,8vw,80px)', textAlign: 'center',
          }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: GRID, backgroundSize: '72px 72px' }} />
            <motion.div variants={stag} initial="hidden" animate={col === 2 ? 'show' : 'hidden'}
              style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
            >
              <motion.p variants={fadeUp} style={{ ...I, fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase', color: '#3a3a3a' }}>
                Para los que llegaron primero
              </motion.p>
              <motion.h2 variants={fadeUp} style={{ ...B, fontSize: 'clamp(3rem,12vw,10rem)', letterSpacing: '0.02em', color: '#fff', lineHeight: 0.85 }}>
                EXCLUSIVO DE<br />LA COMUNIDAD
              </motion.h2>
              <motion.div variants={fadeUp} style={{ width: 32, height: 1, background: RED }} />
              <motion.p variants={fadeUp} style={{ ...I, fontSize: '0.9rem', lineHeight: 2, color: '#484848', maxWidth: 440 }}>
                Los primeros en enterarse.<br />
                Los primeros en elegir.
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}
                style={{ ...I, fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#1c1c1c', marginTop: 8 }}>
                ↓ Scroll para anotarte
              </motion.div>
            </motion.div>
          </section>
          <WaitlistForm />
        </div>

      </div>
    </div>
  )
}

// ─── PhraseCard — sticky section con scroll-driven lateral ────────────────────
// Contenedor h-[300vh] · sticky h-screen dentro
// Frases: z-[1] opacity 1 → 0.05
// Carta:  z-[10] entra desde el costado (x 100%→0%) con leve rotación (5deg→0deg)
function PhraseCard({
  line1, line2, product, containerRef,
}: {
  line1: string; line2: string; product: typeof PRODUCTS[number]
  containerRef?: React.RefObject<HTMLDivElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    ...(containerRef ? { container: containerRef } : {}),
    offset: ['start start', 'end end'],
  })
  const s = useSpring(scrollYProgress, { stiffness: 75, damping: 20, restDelta: 0.001 })

  // ── Phrases: aparecen full → se dividen → bajan a 0.05
  const ph1x  = useTransform(s, [0.04, 0.54], ['0vw', '-48vw'])
  const ph1y  = useTransform(s, [0.04, 0.54], [0, -28])
  const ph1op = useTransform(s, [0, 0.15, 0.52], [1, 1, 0.05])

  const ph2x  = useTransform(s, [0.09, 0.60], ['0vw', '48vw'])
  const ph2y  = useTransform(s, [0.09, 0.60], [0, 28])
  const ph2op = useTransform(s, [0.04, 0.20, 0.58], [0, 1, 0.05])

  // ── Card: entra desde el costado derecho + tilt suave
  // cardX usa scrollYProgress directo (sin spring) = movimiento 1:1 con el scroll
  const cardOp  = useTransform(s,             [0.30, 0.62], [0, 1])
  const cardX   = useTransform(scrollYProgress, [0.30, 0.60], ['100%', '0%'])
  const cardY   = useTransform(s,             [0.30, 0.62], [48, 0])
  const cardRot = useTransform(scrollYProgress, [0.30, 0.60], [5, 0])

  const phraseBase: React.CSSProperties = {
    ...B,
    fontSize: 'clamp(1.8rem, 6.5vw, 5.8rem)',
    letterSpacing: '0.04em',
    color: '#fff',
    whiteSpace: 'nowrap',
    lineHeight: 1.05,
    display: 'block',
    pointerEvents: 'none',
  }

  return (
    <div ref={ref} style={{ height: '300vh' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        background: '#000', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>

        {/* ── Phrases — z:1 (fondo) ── */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, zIndex: 1, overflow: 'hidden', pointerEvents: 'none',
        }}>
          <motion.span style={{ ...phraseBase, x: ph1x, y: ph1y, opacity: ph1op }}>
            {line1}
          </motion.span>
          <motion.span style={{ ...phraseBase, x: ph2x, y: ph2y, opacity: ph2op }}>
            {line2}
          </motion.span>
        </div>

        {/* ── Card — z:10 (frente), entra desde el costado ── */}
        <motion.div style={{
          position: 'relative', zIndex: 10,
          opacity: cardOp,
          x: cardX,
          y: cardY,
          rotate: cardRot,
        }}>
          <FlipCard p={product} />
        </motion.div>

        {/* Nombre de sección — top center */}
        <div style={{
          position: 'absolute', top: 24, width: '100%',
          textAlign: 'center', zIndex: 20, pointerEvents: 'none',
        }}>
          <p style={{ ...I, fontSize: 9, letterSpacing: '0.42em', textTransform: 'uppercase', color: '#1e1e1e' }}>
            Colección · Drop 00
          </p>
        </div>

      </div>
    </div>
  )
}

// ─── Historia ─────────────────────────────────────────────────────────────────
function Historia() {
  return (
    <section style={{
      background: '#000',
      borderTop: '1px solid #0d0d0d',
      padding: 'clamp(120px,20vw,220px) clamp(24px,8vw,80px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    }}>
      <motion.div
        variants={stag} initial="hidden" whileInView="show" viewport={vp}
        style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
      >
        <motion.p variants={fadeUp} style={{ ...I, fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase', color: '#3a3a3a', marginBottom: 16 }}>
          Nosotros
        </motion.p>
        <motion.h2 variants={fadeUp} style={{ ...B, fontSize: 'clamp(2.2rem,6vw,4rem)', letterSpacing: '0.03em', color: '#fff', lineHeight: 0.88, marginBottom: 16 }}>
          ¿Por qué Level?
        </motion.h2>
        <motion.div variants={fadeUp} style={{ width: 32, height: 1, background: RED, marginBottom: 56 }} />
        <motion.p variants={fadeUp} style={{ ...I, fontSize: '1rem', lineHeight: 2, color: '#484848', maxWidth: 480 }}>
          Dos amigos. Una visión. Creamos esta marca porque creemos en el poder del
          progreso y de la comunidad. LEVEL es para los que no se quedan quietos,
          para los que siempre buscan dar un paso más. Gracias por bancar este sueño
          y ser parte de nuestro equipo.
        </motion.p>
        <motion.span variants={fadeUp} style={{ ...I, fontSize: 10, letterSpacing: '0.48em', textTransform: 'uppercase', color: '#1e1e1e', display: 'block', marginTop: 56 }}>
          — Level · 2026
        </motion.span>
      </motion.div>
    </section>
  )
}

// ─── Drop Countdown Overlay ───────────────────────────────────────────────────
function DropCountdownOverlay({ onGone }: { onGone(): void }) {
  const onGoneRef  = useRef(onGone)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef  = useRef<HTMLDivElement>(null)

  const [timeLeft,  setTimeLeft]  = useState<{ d: number; h: number; m: number; s: number } | null>(null)
  const [fading,    setFading]    = useState(false)
  const [alive,     setAlive]     = useState(true)
  const [contentOp, setContentOp] = useState(1)
  const [sloganOp,  setSloganOp]  = useState(0)

  onGoneRef.current = onGone

  useEffect(() => {
    const tick = () => {
      const diff = DROP_TARGET.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
        if (timerRef.current) clearInterval(timerRef.current)
        setFading(true)
        setTimeout(() => { setAlive(false); onGoneRef.current() }, 700)
        return
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handle = () => {
      const p = Math.max(0, Math.min(1, (el.scrollTop - 80) / 520))
      setContentOp(1 - p)
      setSloganOp(p)
    }
    el.addEventListener('scroll', handle, { passive: true })
    return () => el.removeEventListener('scroll', handle)
  }, [])

  if (!alive) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  const units = [
    { label: 'DÍAS', v: timeLeft?.d ?? 0 },
    { label: 'HRS',  v: timeLeft?.h ?? 0 },
    { label: 'MIN',  v: timeLeft?.m ?? 0 },
    { label: 'SEG',  v: timeLeft?.s ?? 0 },
  ]

  return (
    <>
      <style>{`.lvl-ov::-webkit-scrollbar{display:none}`}</style>
      <div
        ref={scrollRef}
        className="lvl-ov"
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: '#000',
          overflowY: 'scroll', overflowX: 'hidden',
          scrollbarWidth: 'none',
          opacity: fading ? 0 : 1,
          transition: fading ? 'opacity 0.7s ease' : 'none',
        }}
      >
        {/* Grain — unique filter id to avoid conflict with FilmGrain */}
        <div aria-hidden style={{
          position: 'fixed', top: '-50%', left: '-50%',
          width: '200%', height: '200%',
          pointerEvents: 'none', opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cfilter id='noise-ov'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise-ov)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '220px 220px',
          animation: 'grain 0.35s steps(1) infinite',
        }} />

        {/* Tall spacer enables scroll inside the fixed layer */}
        <div style={{ height: '250vh' }}>
          <div style={{
            position: 'sticky', top: 0, height: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>

            {/* Logo + countdown (fades out on scroll) */}
            <div style={{
              position: 'absolute', inset: 0,
              padding: '0 clamp(24px, 6vw, 80px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(28px, 5vh, 60px)',
              opacity: contentOp,
            }}>
              <Image
                src="/img/logorojosf.png" alt="LEVEL" width={700} height={700} priority
                style={{
                  width: 'clamp(260px, 52vw, 560px)',
                  height: 'auto', objectFit: 'contain',
                  filter: 'drop-shadow(0 0 80px rgba(192,57,43,0.35)) drop-shadow(0 0 30px rgba(192,57,43,0.2))',
                }}
              />

              {/* Countdown — only rendered after client hydration to avoid flash */}
              {timeLeft !== null ? (
                <div style={{
                  display: 'flex', alignItems: 'flex-start',
                  gap: 'clamp(12px, 3vw, 56px)',
                }}>
                  {units.map(({ label, v }) => (
                    <div key={label} style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 'clamp(6px, 1vh, 14px)',
                    }}>
                      <span style={{
                        ...B,
                        fontSize: 'clamp(3rem, 10vw, 9rem)',
                        color: '#fff', lineHeight: 1,
                        letterSpacing: '-0.01em',
                        display: 'block',
                      }}>{pad(v)}</span>
                      <span style={{
                        ...I,
                        fontSize: 'clamp(9px, 1.3vw, 12px)',
                        letterSpacing: '0.42em', textTransform: 'uppercase',
                        color: '#666',
                      }}>{label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Placeholder reserves height while countdown loads */
                <div style={{ height: 'clamp(52px, 12vw, 140px)' }} />
              )}

              <p style={{
                ...I,
                fontSize: 'clamp(10px, 1.4vw, 13px)',
                letterSpacing: '0.38em', textTransform: 'uppercase',
                color: '#555',
              }}>
                Lunes 18 · Mayo 2026 · 19:00 hs
              </p>

              <div style={{
                position: 'absolute', bottom: 32,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <span style={{ ...I, fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#0e0e0e' }}>Scroll</span>
                <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom, ${RED}, transparent)` }} />
              </div>
            </div>

            {/* Slogan (fades in on scroll) */}
            <div style={{
              position: 'absolute', inset: 0,
              padding: '0 clamp(24px, 6vw, 80px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: sloganOp, pointerEvents: 'none',
            }}>
              <p style={{
                ...B,
                fontSize: 'clamp(2.8rem, 9vw, 8.5rem)',
                color: '#fff', letterSpacing: '0.04em',
                textAlign: 'center', lineHeight: 0.9,
              }}>
                WE ARE THE<br />NEXT LEVEL
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [eggOpen,     setEggOpen]     = useState(false)
  const [isFunder,    setIsFunder]    = useState(false)
  // Lazy init: false immediately if the drop already happened (no flash, no effect needed)
  const [showOverlay, setShowOverlay] = useState(() => Date.now() < DROP_TARGET.getTime())

  // Lenis smooth scroll — se inicializa solo cuando el overlay ya no está,
  // para que no intercepte los wheel events del overlay con preventDefault
  useEffect(() => {
    if (showOverlay) return
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ duration: 1.2 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(tick); lenis.destroy() }
  }, [showOverlay])

  // Suppress unused warning — isFunder disponible para futuras secciones
  void isFunder

  return (
    <main style={{ background: '#000' }}>

      {/* Film Grain — fixed, inset-0, pointer-events-none, z-9999 */}
      <FilmGrain />

      {/* Drop Countdown Overlay — z-10000, blocks site until launch */}
      {showOverlay && (
        <DropCountdownOverlay onGone={() => setShowOverlay(false)} />
      )}

      {/* Easter Egg Modal — fixed inset-0 bg-black z-100, perfectamente centrado */}
      <AnimatePresence>
        {eggOpen && (
          <EasterEggModal
            key="egg"
            onClose={() => setEggOpen(false)}
            onClaim={() => { setIsFunder(true); setEggOpen(false) }}
          />
        )}
      </AnimatePresence>

      {/* ── Static Hero ── */}
      <StaticHero />

      {/* ── Grid bidireccional: 3 columnas × scroll vertical interno ── */}
      <HorizontalNav onEasterEgg={() => setEggOpen(true)} />

    </main>
  )
}
