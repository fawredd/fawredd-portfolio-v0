import { Github, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="w-full flex justify-between items-center py-4 px-6">
      <Link href="/" className="font-medium">
        fawredd
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href={`https://github.com/${process.env.GITHUB_USER}`} className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50">
          <Github className="w-5 h-5" />
        </Link>
        <Link href={`https://linkedin.com/in/${process.env.LINKEDIN_USER}`} className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50">
          <Linkedin className="w-5 h-5" />
        </Link>
        <Link href={`https://twitter.com/${process.env.TWITTER_USER}`} className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50">
          <Twitter className="w-5 h-5" />
        </Link>
      </div>
    </header>
  )
}

