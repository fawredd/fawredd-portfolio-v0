'use client'

import { Github, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProjects } from '@/contexts/projects-context'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import styled from 'styled-components'
import Script from 'next/script'

export function Projects() {
  const { repositories, filter, clearFilter, loading } = useProjects()

  const filteredRepositories = filter
    ? repositories.filter(
        repo =>
          repo.language?.toLowerCase() === filter.toLowerCase() ||
          repo.topics?.some(topic => topic.toLowerCase() === filter.toLowerCase())
      )
    : repositories

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Marcos Moore selected projects',
    itemListElement: repositories.map((repo, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'SoftwareSourceCode',
        name: repo.name,
        description: repo.description,
        ...(repo.html_url ? { url: repo.html_url, codeRepository: repo.html_url } : {}),
        ...(repo.language ? { programmingLanguage: repo.language } : {}),
        ...(repo.topics?.length ? { keywords: repo.topics.join(', ') } : {}),
        ...(repo.screenshot_url ? { image: repo.screenshot_url } : {}),
        author: {
          '@type': 'Person',
          name: 'Marcos Moore',
        },
      },
    })),
  }

  if (loading) {
    return <ProjectsSkeleton />
  }

  return (
    <section id="projects" className="min-h-screen py-8" aria-labelledby="projects-heading">
      <Script
        id="projects-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4">
        <h2 id="projects-heading" className="mb-8 flex items-center gap-2 text-2xl font-bold">
          Selected projects
          <span className="text-muted-foreground text-sm font-normal">and open-source work</span>
          {filter && (
            <Badge variant="secondary" className="ml-2 px-2 py-1">
              Filtered by: {filter}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 text-base"
                onClick={clearFilter}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear filter</span>
              </Button>
            </Badge>
          )}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepositories.map(repo => (
            <StyledCard
              key={repo.id}
              className="group flex flex-col overflow-hidden border-2 dark:border-green-500"
            >
              <CardHeader className="overflow-hidden p-0">
                <div className="relative w-full overflow-hidden pt-[56.25%]">
                  {repo.screenshot_url ? (
                    <Image
                      src={repo.screenshot_url || '/placeholder.svg'}
                      alt={`Screenshot of ${repo.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-t-lg object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="bg-muted absolute inset-0 flex items-center justify-center rounded-t-lg bg-slate-100 dark:bg-slate-800">
                      No screenshot available
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <h3 className="mb-2 text-lg font-semibold">{repo.name}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{repo.description}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {repo.topics?.map(topic => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                  {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 mt-auto p-4">
                <div className="flex w-full">
                  {repo.homepage && (
                    <Button variant="outline" className="mx-2" size="sm" asChild>
                      <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Website
                      </a>
                    </Button>
                  )}
                  {repo.html_url && (
                    <Button variant="outline" className="mx-2" size="sm" asChild>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
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
    <section className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Skeleton className="mb-8 h-8 w-64" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="bg-transparent-75 flex flex-col border-2 dark:border-green-500"
            >
              <CardHeader className="p-0">
                <Skeleton className="w-full pt-[56.25%]" />
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <Skeleton className="mb-2 h-6 w-full" />
                <Skeleton className="mb-4 h-4 w-full" />
                <div className="mb-4 flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 mt-auto p-4">
                <div className="flex w-full justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8" />
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
