import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import type React from 'react' // Import React
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })
const siteUrl = 'https://fawredd-portfolio.vercel.app'
const siteTitle = 'Marcos Moore | Business Analyst & Full-Stack Developer'
const siteDescription =
  'Explore the portfolio of Marcos Moore, a Business Analyst and full-stack developer based in Buenos Aires, specializing in JavaScript, React, Next.js, Node.js, Salesforce, and AI.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    'Marcos Moore',
    'fawredd',
    'Business Analyst',
    'full-stack developer',
    'JavaScript',
    'React',
    'Next.js',
    'Node.js',
    'Salesforce',
    'AI',
  ],
  authors: [{ name: 'Marcos Moore', url: siteUrl }],
  creator: 'Marcos Moore',
  publisher: 'Marcos Moore',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'Marcos Moore Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/img/fawredd-github.jpeg',
        width: 1200,
        height: 630,
        alt: 'Marcos Moore portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/img/fawredd-github.jpeg'],
    creator: '@fawredd',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Marcos Moore',
      alternateName: 'fawredd',
      jobTitle: 'Business Analyst and Full-Stack Developer',
      url: siteUrl,
      image: `${siteUrl}/img/fawredd-github.jpeg`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Buenos Aires',
        addressCountry: 'AR',
      },
      sameAs: [
        'https://github.com/fawredd',
        'https://www.linkedin.com/in/mooremarcos',
        'https://twitter.com/fawredd',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Marcos Moore Portfolio',
      description: siteDescription,
      publisher: { '@id': `${siteUrl}/#person` },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${siteUrl}/#profilepage`,
      url: siteUrl,
      name: siteTitle,
      isPartOf: { '@id': `${siteUrl}/#website` },
      mainEntity: { '@id': `${siteUrl}/#person` },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
