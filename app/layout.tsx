import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Companion.ai',
  description: 'Create custom AI companions to talk to.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider> 
      {/* suppressHydrationWarning is for ThemeProvider errors */}
    <html lang="en" suppressHydrationWarning>
      
      <body className={cn("bg-secondary",inter.className)}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        {children}
        </ThemeProvider>
        </body>
      
    </html>
    </ClerkProvider>
  )
}
