import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import Header from "../components/Header";
import { Web3Provider } from "../components/Web3Provider";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hermes | Portaldot AI Agent",
  description: "Conversational AI Agent for Portaldot",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmMono.variable} h-full antialiased bg-background text-foreground`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-mono text-sm" suppressHydrationWarning>
        <Web3Provider>
          <Header />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative w-full">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}
