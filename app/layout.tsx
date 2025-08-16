import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chrome Extension Icon Resizer - Generate Icons for Extensions',
  description: 'Easily resize and generate icons for Chrome extensions in multiple sizes. Upload your SVG or PNG and get all required icon sizes in one click.',
  generator: 'Next.js',
  applicationName: 'Chrome Extension Icon Resizer',
  keywords: ['chrome extension', 'icon resizer', 'icon generator', 'extension icons', 'chrome web store'],
  authors: [{ name: 'Surjeet Singh' }],
  creator: 'Surjeet Singh',
  publisher: 'Surjeet Singh',
  robots: 'index, follow',
  openGraph: {
    title: 'Chrome Extension Icon Resizer - Generate Icons for Extensions',
    description: 'Easily resize and generate icons for Chrome extensions in multiple sizes. Upload your SVG or PNG and get all required icon sizes in one click.',
    url: 'https://chrome-extension-icon-resizer-a23amgj6o.vercel.app',
    siteName: 'Chrome Extension Icon Resizer',
    images: [
      {
        url: '/placeholder-logo.png',
        width: 1200,
        height: 630,
        alt: 'Chrome Extension Icon Resizer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chrome Extension Icon Resizer - Generate Icons for Extensions',
    description: 'Easily resize and generate icons for Chrome extensions in multiple sizes.',
    creator: '@surjeet_web',
    images: ['/placeholder-logo.png'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
