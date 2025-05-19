import { GithubIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen p-4 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-7xl mx-auto p-2 sm:p-4">
        <div className="my-8 p-8 border border-gray-300 rounded-lg shadow bg-white text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
            Voting Period Has Ended
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Thank you for following the election results! We&apos;ll be back in 4 years 😊
          </p>
        </div>
      </main>
      <footer className="flex gap-[24px] flex-wrap items-center justify-center pt-10">
        <a
          className="flex items-center gap-1.5 hover:underline hover:underline-offset-4"
          href="https://github.com/Filsommer/vote-sheet/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon aria-hidden width={16} height={16} />
          GitHub
        </a>
      </footer>
    </div>
  );
}
