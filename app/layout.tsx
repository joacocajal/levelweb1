import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LEVEL - Drop 00',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-black">
        {children}
      </body>
    </html>
  )
}
