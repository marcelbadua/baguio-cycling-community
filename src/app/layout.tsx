
// ============================================================
// src/app/layout.tsx — Final version with PWA components
// ============================================================
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers }      from '@/components/providers'
import { Toaster }        from '@/components/ui/toaster'
import { InstallPrompt }  from '@/components/pwa/install-prompt'
import { OfflineBanner }  from '@/components/pwa/offline-banner'
import Script from "next/script";
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ['latin'], display: 'swap' })
export const metadata: Metadata = {
  metadataBase: new URL("https://baguio-cycling-community.vercel.app"),

  title: {
    default: "Baguio Cycling Community",
    template: "%s | BCC",
  },

  description:
    "Join the Baguio Cycling Community. Share rides, discover events, report road hazards, post missing bike alerts, and connect with cyclists across Baguio City.",

  applicationName: "Baguio Cycling Community",

  manifest: "/manifest.json",

  keywords: [
    "cycling",
    "baguio",
    "biking",
    "community",
    "MTB",
    "road bike",
    "Cordillera",
    "cycling events",
    "bike community",
    "missing bike",
    "road hazards",
  ],

  alternates: {
    canonical: "/",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BCC",
    startupImage: "/icons/apple-touch-icon.png",
  },

  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
  },

  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://baguio-cycling-community.vercel.app",
    siteName: "Baguio Cycling Community",
    title: "Baguio Cycling Community",
    description:
      "Join the Baguio Cycling Community. Share rides, discover events, report road hazards, post missing bike alerts, and connect with cyclists across Baguio City.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Baguio Cycling Community",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Baguio Cycling Community",
    description:
      "Join the Baguio Cycling Community. Share rides, discover events, report road hazards, post missing bike alerts, and connect with cyclists across Baguio City.",
    images: ["/og-image.png"],
  },
}

export const viewport: Viewport = {
  themeColor:           [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#09090b' },
  ],
  width:                'device-width',
  initialScale:          1,
  maximumScale:          1,
  userScalable:          false,
  viewportFit:           'cover', // for iPhone notch
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

          <meta
            name="google-adsense-account"
            content="ca-pub-4040201528265266"
          />

          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4040201528265266"
            crossOrigin="anonymous"
          />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          <OfflineBanner />
          {children}

          <Footer />
          
          <InstallPrompt />
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />

      </body>
    </html>
  )
}