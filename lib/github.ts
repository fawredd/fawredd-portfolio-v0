export interface Repository {
  id: number
  name: string
  description: string
  html_url: string
  homepage: string
  topics: string[]
  language: string
  screenshot_url?: string
}
interface FileItem {
  mode: string
  path: string
  sha: string
  size: number
  type: string
  url: string
}

const mockRepositories: Repository[] = [
  {
    id: 99,
    name: 'etercell.com',
    description:
      'WordPress website about Advanced Therapies in Regenerative Medicine using a template from Plethora Themes.',
    html_url: '',
    homepage: 'https://www.etercell.com',
    topics: [
      'PHP',
      'Wordpress',
      'UI/UX',
      'Regenerative Medicine',
      'Autologous products',
      'Biomedicine',
    ],
    language: 'PHP',
    screenshot_url: '/img/etercell-screenshot.jpg',
  },
  // Add more mock repositories as needed
]

//Function to fetch files from users repository and return the first one thar has "screenshot" as name.
async function getRepoScreenshot(repo: string, branch = 'main'): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_USER}/${repo}/git/trees/${branch}?recursive=0`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        next: { revalidate: 86400 },
      }
    )
    if (res.ok) {
      const repoJson = await res.json()
      if (repoJson.message?.length > 0) {
        return undefined
      }

      const link = repoJson.tree
        .filter((item: FileItem) => item.path.includes('screenshot'))
        .map((item: FileItem) => item.path)
      if (link.length > 0) {
        return (
          `https://raw.githubusercontent.com/${process.env.GITHUB_USER}/${repo}/${branch}/` +
          link[0]
        )
      }
    }
    return undefined
  } catch (error) {
    console.error(`Error fetching screenshot for ${repo}:`, error)
  }
}

export async function getRepositories(): Promise<Repository[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${process.env.GITHUB_USER}/repos?per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        next: { revalidate: 86400 },
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`)
    }

    const repos: Repository[] = await response.json()
    // Sort by first 2 characters of description, with null descriptions at the end
    const sortedRepos = repos.sort((a, b) => {
      const getSortKey = (desc: string | undefined) => {
        if (!desc) return { type: 'null', value: '' }
        const firstTwo = desc.substring(0, 2)
        if (/^\d{2}/.test(firstTwo)) return { type: 'number', value: parseInt(firstTwo) }
        return { type: 'letter', value: firstTwo.toLowerCase() }
      }

      const keyA = getSortKey(a.description)
      const keyB = getSortKey(b.description)

      if (keyA.type !== keyB.type) {
        const typeOrder: Record<string, number> = { number: 0, letter: 1, null: 2 }
        return typeOrder[keyA.type] - typeOrder[keyB.type]
      }

      if (keyA.type === 'number') return (keyA.value as number) - (keyB.value as number)
      if (keyA.type === 'letter') return (keyA.value as string).localeCompare(keyB.value as string)
      return 0
    })
    // Filter out repositories with "!portfolio" in the description
    const filteredRepos = sortedRepos.filter(repo => !repo.description?.includes('!portfolio'))

    // Fetch screenshot URLs for remaining repositories
    const reposWithScreenshots = await Promise.all(
      filteredRepos.map(async repo => {
        const tempRepo = { ...repo }
        const screenshot_url = await getRepoScreenshot(repo.name)
        if (screenshot_url) {
          tempRepo.screenshot_url = screenshot_url
        }
        return tempRepo
      })
    )
    //Add mock repositories to reposWithScreenshots
    reposWithScreenshots.push(...mockRepositories)

    return reposWithScreenshots
  } catch (error) {
    console.error('Error fetching repositories:', error)
    console.log('Falling back to mock data')
    return mockRepositories
  }
}
