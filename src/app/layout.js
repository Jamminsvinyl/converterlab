import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://converterlab.io'),
  title: "ConverterLab | Private Tools for Devs, Producers & Game Creators",
  description: "100% browser-side, secure tool station. No data ever leaves your computer.",
  openGraph: {
    title: "ConverterLab - The Analog Heart of Digital Tools",
    url: "https://converterlab.io",
    siteName: "ConverterLab",
    type: "website",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="bg-neutral-950 text-neutral-200 min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}