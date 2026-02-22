import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Navigation } from "@/components/layout";
import "./globals.css";

// Font configurations
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QuizChain - Blockchain Learning Platform",
  description: "Learn and earn through blockchain-powered quizzes. Create quizzes as a teacher or take quizzes as a student.",
  keywords: "quiz, blockchain, learning, education, bitcoin, rewards, litecoin",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8fafc] dark:bg-[#0c0a1d] text-gray-900 dark:text-gray-100`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
