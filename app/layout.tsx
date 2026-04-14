import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type React from "react" // Import React
import Head  from "next/head"
import { Metadata } from "next"
import type { Repository } from "@/lib/github"
import { getRepositories } from "@/lib/github"


const inter = Inter({ subsets: ["latin"] })
// Dynamically generate metadata based on fetched repositories.
// I should fetch data from config file too, but did not implement it yet.
export async function generateMetadata(): Promise<Metadata> {
  const metaRepositories: Repository[] = await getRepositories()
  // Generate keywords from repository names and topics
  // const repoNames = metaRepositories.map(repo => repo.name)
  const repoTopics = metaRepositories.flatMap(repo => repo.topics || [])
  const keywords = [
    "Marcos Moore",
    "fawredd",
    "Business Analyst",
    "Developer Portfolio",
    "JavaScript",
    "Next.js",
    "React",
    "Node.js",
    "Express.js",
    "Salesforce",
    "Apex",
    "AI",
    "bmpn",
    "workflow",
    "chatbot",
    "portfolio",
    "bussiness",
    "team work",
    "web development",
    "full stack",
    "front end",
    "back end",
    "web apps",
    "mobile apps",
    "open source",
    "github",
    ...repoTopics,
  ]
    .map(k => k.toLowerCase())
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .join(", ")

  // Generate a longer description with project names
  /* const projectList = repoNames.length
    ? `Projects featured: ${repoNames.join(", ")}.`
    : "" */
  const description =
    "Marcos Moore (@fawredd) portfolio, showcasing projects, skills, and expertise in JavaScript, Next.js, React, Node.js, Express.js, Salesforce, Apex, and AI. " 
    //projectList

  return {
		verification: {
			google:process.env.GOOGLE_SITE_VERIFICATION,
		},
    title:
      "@fawredd Marcos Moore Portfolio | Business Analyst | JavaScript, Next.js, React, Node.js, Express.js, Salesforce, Apex, AI",
    description,
    keywords,
    openGraph: {
      title: "Marcos Moore @fawredd | Portfolio",
      description,
      url: "https://fawredd-portfolio.vercel.app",
      type: "website",
      images: [
        {
          url: "https://fawredd-portfolio.vercel.app/fawredd-github.jpeg",
          width: 1200,
          height: 630,
          alt: "Marcos Moore @fawredd Portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Marcos Moore @fawredd | Portfolio",
      description,
      images: ["https://fawredd-portfolio.vercel.app/fawredd-github.jpeg"],
      creator: "@fawredd",
    },
    metadataBase: new URL("https://fawredd-portfolio.vercel.app"),
  }
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="canonical" href="https://fawredd-portfolio.vercel.app" />
      </Head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

