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
  metadataBase: new URL('https://converterlab.io'), // Absolute URL'ler için şart
  title: "ConverterLab | 22+ Private Tools for Devs, Producers & Game Creators",
  description: "100% browser-side, secure tool station. JSON to CSV, JWT Decoder, BPM Calc, Room Treatment, and Game Dev utilities. No data ever leaves your computer.",
  keywords: "JSON to CSV, JWT Decoder, BPM Calculator, Room Treatment Calc, Game Dev Tools, SQL Formatter, Statistics Calculator, Music Theory Tools",
  alternates: {
    canonical: '/', // Google'ın ana sayfayı tek otorite görmesi için
  },
  openGraph: {
    title: "ConverterLab - The Analog Heart of Digital Tools",
    description: "Fast, private, and secure developer and music production utilities.",
    url: "https://converterlab.io",
    siteName: "ConverterLab",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png', // Public klasörüne koyacağın 1200x630 boyutunda bir görsel
        width: 1200,
        height: 630,
        alt: 'ConverterLab Tool Station',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConverterLab | Private Dev & Music Station",
    description: "Zero-server processing. Your data stays private.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-200">
        {children}
      </body>
    </html>
  );
}