"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { Repository } from "@/lib/github"
import { getRepositories } from "@/lib/github"
import { siteConfig } from "@/config/site";

interface ProjectsContextType {
  filter: string | null
  setFilter: (filter: string | null) => void
  clearFilter: () => void
  repositories: Repository[]
  loading: boolean
  siteConfig: {}
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRepositories() {
      try {
        const repos = await getRepositories()
        setRepositories(repos)
      } catch (error) {
        console.error("Error fetching repositories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepositories()
  }, [])

  const clearFilter = () => setFilter(null)

  return (
    <ProjectsContext.Provider
      value={{
        filter,
        setFilter,
        clearFilter,
        repositories,
        loading,
        siteConfig,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}

