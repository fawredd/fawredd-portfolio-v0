import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ChatInterfaceManager } from "@/components/chat-interface-manager"
import { Projects } from "@/components/projects"
import { Contact } from "@/components/contact"
import { ProjectsProvider } from "@/contexts/projects-context"
import { Metadata } from "next"
import type { Repository } from "@/lib/github"
import { getRepositories } from "@/lib/github"

// Dynamically generate metadata based on fetched repositories.
// I should fetch data from config file too, but did not implement it yet.
export async function generateMetadata(): Promise<Metadata> {
  const metaRepositories: Repository[] = await getRepositories()
  // Generate keywords from repository names and topics
  const repoNames = metaRepositories.map(repo => repo.name)
  const repoTopics = metaRepositories.flatMap(repo => repo.topics || [])
  const keywords = [
    "Marcos Moore",
    "fawredd",
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
    ...repoNames,
    ...repoTopics,
  ]
    .map(k => k.toLowerCase())
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .join(", ")

  // Generate a longer description with project names
  const projectList = repoNames.length
    ? `Projects featured: ${repoNames.join(", ")}.`
    : ""
  const description =
    "Marcos Moore (@fawredd) developer portfolio, showcasing projects, skills, and expertise in JavaScript, Next.js, React, Node.js, Express.js, Salesforce, Apex, and AI. " +
    projectList

  return {
    title:
      "@fawredd Marcos Moore Developer Portfolio | JavaScript, Next.js, React, Node.js, Express.js, Salesforce, Apex, AI",
    description,
    keywords,
    openGraph: {
      title: "Marcos Moore @fawredd | Developer Portfolio",
      description,
      url: "https://fawredd-portfolio.vercel.app",
      type: "website",
      images: [
        {
          url: "https://fawredd-portfolio.vercel.app/fawredd-github.jpeg",
          width: 1200,
          height: 630,
          alt: "Marcos Moore @fawredd Developer Portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Marcos Moore @fawredd | Developer Portfolio",
      description,
      images: ["https://fawredd-portfolio.vercel.app/fawredd-github.jpeg"],
      creator: "@fawredd",
    },
    metadataBase: new URL("https://fawredd-portfolio.vercel.app"),
  }
}

export default function Home() {
  return (
    <ProjectsProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Hero />
          <div className="container mx-auto px-4 py-8">
            <ChatInterfaceManager />
          </div>
          <Projects />
          <Contact />
        </main>
      </div>
    </ProjectsProvider>
  )
}

