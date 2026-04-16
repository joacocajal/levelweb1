'use client'

import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import Lenis from 'lenis'
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

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onEasterEgg }: { onEasterEgg(): void }) {
  return (
    <section style={{
      minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(80px,10vw,120px) 24px', textAlign: 'center',
    }}>
      {/* Subtle grid */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.016) 1px,transparent 1px)',
        backgroundSize: '72px 72px',
      }} />

      <motion.div
        variants={stag} initial="hidden" animate="show"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
      >
        {/* Badge */}
        <motion.span variants={fadeUp} style={{
          ...I, display: 'inline-block', padding: '5px 18px',
          border: '1px solid #1a1a1a', color: '#4a4a4a',
          fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase',
        }}>
          Drop 00 · Edición Limitada
        </motion.span>

        {/* Logo — Mobile: 240px min / Desktop: 600px max */}
        <motion.div variants={fadeUp}>
          <Image
            src="/img/logorojosf.png" alt="LEVEL"
            width={700} height={700} priority
            style={{
              width: 'clamp(240px, 52vw, 600px)',
              height: 'auto', objectFit: 'contain',
              filter: 'drop-shadow(0 0 48px rgba(192,57,43,0.18))',
            }}
          />
        </motion.div>

        {/* Slogan — doble clic → Easter Egg */}
        <motion.h1
          variants={fadeUp}
          onDoubleClick={onEasterEgg}
          style={{
            ...B, fontSize: 'clamp(3.4rem,12vw,9.5rem)',
            lineHeight: 0.86, letterSpacing: '0.02em',
            color: '#fff', cursor: 'default', userSelect: 'none',
          }}
        >
          WE ARE THE<br />NEXT LEVEL
        </motion.h1>

        <motion.p variants={fadeUp} style={{
          ...I, fontSize: '0.68rem', letterSpacing: '0.38em',
          textTransform: 'uppercase', color: '#3a3a3a',
        }}>
          13 Piezas · Sin reposición · AW 2026
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}
        >
          <span style={{ ...I, fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#1c1c1c' }}>
            Scroll para ver la colección
          </span>
          <div style={{ width: 32, height: 1, background: '#181818' }} />
          <span style={{ color: '#1c1c1c', fontSize: 12 }}>↓</span>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── PhraseCard — sticky section con scroll-driven lateral ────────────────────
// Contenedor h-[300vh] · sticky h-screen dentro
// Frases: z-[1] opacity 1 → 0.05
// Carta:  z-[10] entra desde el costado (x 100%→0%) con leve rotación (5deg→0deg)
function PhraseCard({
  line1, line2, product,
}: {
  line1: string; line2: string; product: typeof PRODUCTS[number]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [eggOpen,  setEggOpen]  = useState(false)
  const [isFunder, setIsFunder] = useState(false)

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2 })
    let rafId: number
    const raf = (t: number) => { lenis.raf(t); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(rafId); lenis.destroy() }
  }, [])

  // Suppress unused warning — isFunder disponible para futuras secciones
  void isFunder

  return (
    <main style={{ background: '#000' }}>

      {/* Film Grain — fixed, inset-0, pointer-events-none, z-9999 */}
      <FilmGrain />

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

      {/* ── Hero ── */}
      <Hero onEasterEgg={() => setEggOpen(true)} />

      {/* ── Sección 1: TU IDENTIDAD / NO SE NEGOCIA + IDENTITY (Negro) ── */}
      <PhraseCard
        line1="TU IDENTIDAD"
        line2="NO SE NEGOCIA"
        product={PRODUCTS[0]}
      />

      {/* ── Sección 2: VOS PONÉS / LAS REGLAS + YOUR RULES (Blanco) ── */}
      <PhraseCard
        line1="VOS PONÉS"
        line2="LAS REGLAS"
        product={PRODUCTS[1]}
      />

      {/* ── Historia ── espaciado masivo py-60 md:py-80 */}
      <div style={{ paddingTop: 'clamp(160px,22vw,320px)' }}>
        <Historia />
      </div>

      {/* ── Footer ── */}
      <footer style={{
        background: '#000', borderTop: '1px solid #080808',
        padding: '40px 24px', textAlign: 'center',
        marginTop: 'clamp(80px,12vw,160px)',
      }}>
        <p style={{ ...I, fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase', color: '#0e0e0e' }}>
          © 2026 Level · Drop 00 · Todos los derechos reservados
        </p>
      </footer>

    </main>
  )
}
