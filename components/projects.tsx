"use client"

import { Github, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProjects } from "@/contexts/projects-context"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import styled from "styled-components"
import Script from "next/script"

export function Projects() {
  const { repositories, filter, clearFilter, loading } = useProjects()

  const filteredRepositories = filter
    ? repositories.filter(
        (repo) =>
          repo.language?.toLowerCase() === filter.toLowerCase() ||
          repo.topics?.some((topic) => topic.toLowerCase() === filter.toLowerCase()),
      )
    : repositories
  
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": repositories.map((repo, idx) => ({
      "@type": "SoftwareSourceCode",
      "position": idx + 1,
      "name": repo.name,
      "description": repo.description,
      "url": repo.html_url,
      "programmingLanguage": repo.language,
      "keywords": repo.topics?.join(", "),
      "codeRepository": repo.html_url,
      "image": repo.screenshot_url || undefined,
      "author": {
        "@type": "Person",
        "name": "Marcos Moore @fawredd",
      }
    }))
  }  

  if (loading) {
    return <ProjectsSkeleton />
  }

  return (
    <section className="py-8 min-h-screen">
      <Script
        id="projects-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          Work experience fetched
          <span className="text-muted-foreground text-sm font-normal">from Github</span>
          {filter && (
            <Badge variant="secondary" className="ml-2 px-2 py-1">
              Filtered by: {filter}
              <Button variant="ghost" size="sm" className="ml-2 h-auto p-0 text-base" onClick={clearFilter}>
                <X className="h-4 w-4" />
                <span className="sr-only">Clear filter</span>
              </Button>
            </Badge>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <StyledCard key={repo.id} className="flex flex-col group overflow-hidden border-2 dark:border-green-500">
              <CardHeader className="p-0 overflow-hidden">
                <div className="relative w-full pt-[56.25%] overflow-hidden">
                  {repo.screenshot_url ? (
                    <Image
                      src={repo.screenshot_url || "/placeholder.svg"}
                      alt={`Screenshot of ${repo.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover rounded-t-lg transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center rounded-t-lg bg-slate-100 dark:bg-slate-800">
                      No screenshot available
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <h3 className="font-semibold text-lg mb-2">{repo.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{repo.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.topics?.map((topic) => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                  {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4 mt-auto">
                <div className="flex w-full">
                  {repo.homepage && 
                  ( <Button variant="outline" className="mx-2" size="sm" asChild>
                      <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    </Button>
                  )}
                  {repo.html_url && 
                    <Button variant="outline" className="mx-2" size="sm" asChild>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                  }
                </div>
              </CardFooter>
            </StyledCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectsSkeleton() {
  return (
    <section className="py-8 min-h-screen">
      <div className="container mx-auto px-4">
        <Skeleton className="w-64 h-8 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col bg-transparent-75 dark:border-green-500 border-2">
              <CardHeader className="p-0">
                <Skeleton className="w-full pt-[56.25%]" />
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <Skeleton className="w-full h-6 mb-2" />
                <Skeleton className="w-full h-4 mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4 mt-auto">
                <div className="flex justify-between w-full">
                  <Skeleton className="w-20 h-8" />
                  <Skeleton className="w-8 h-8" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

//Created this for future effects to be applied
const StyledCard = styled(Card)`
  position: relative;
`

