import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ChatInterfaceManager } from "@/components/chat-interface-manager"
import { Projects } from "@/components/projects"
import { Contact } from "@/components/contact"
import { ProjectsProvider } from "@/contexts/projects-context"

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

