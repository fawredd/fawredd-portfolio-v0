import { Github, Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'

export function Contact() {
  return (
    <section id="contact" className="py-8 text-center" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="mb-8 text-2xl font-bold text-white">
        Contact Marcos Moore
      </h2>
      <p className="mx-auto mb-8 max-w-2xl text-gray-400">
        I would be delighted to learn more about your company, job opportunities, personal projects,
        and explore how I can contribute to your success.
      </p>
      <div className="flex justify-center gap-6">
        <Link
          href={`https://github.com/${process.env.GITHUB_USER}`}
          className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50"
        >
          <Github className="h-5 w-5" />
        </Link>
        <Link
          href={`https://linkedin.com/in/${process.env.LINKEDIN_USER}`}
          className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50"
        >
          <Linkedin className="h-5 w-5" />
        </Link>
        <Link
          href={`https://twitter.com/${process.env.TWITTER_USER}`}
          className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50"
        >
          <Twitter className="h-5 w-5" />
        </Link>
      </div>
      <div className="mt-8 text-sm text-gray-500">
        Designed by{''}
        <Link href="#" className="text-blue-400">
          @fawredd
        </Link>
      </div>
    </section>
  )
}
