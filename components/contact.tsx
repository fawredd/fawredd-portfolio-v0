import { Github, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"

export function Contact() {
  return (
    <section className="py-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-8">Contact</h2>
      <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
        I would be delighted to learn more about your company, job opportunities, personal projects, and explore how I
        can contribute to your success.
      </p>
      <div className="flex justify-center gap-6">
        <Link href="https://linkedin.com" className="text-gray-400 hover:text-white">
          <Linkedin className="w-6 h-6" />
        </Link>
        <Link href="https://github.com" className="text-gray-400 hover:text-white">
          <Github className="w-6 h-6" />
        </Link>
        <Link href="https://twitter.com" className="text-gray-400 hover:text-white">
          <Twitter className="w-6 h-6" />
        </Link>
      </div>
      <div className="mt-8 text-sm text-gray-500">
        Designed by{""}
        <Link href="#" className="text-blue-400">
          @fawredd
        </Link>
      </div>
    </section>
  )
}

