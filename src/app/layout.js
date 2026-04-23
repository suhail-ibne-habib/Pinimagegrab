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
  title: 'PinImageGrab - Pinterest Video & Image Downloader (4K/HD)',
  description: 'Download high-quality Pinterest images, videos, and GIFs for free. No login required. Fast, anonymous, and supports 4K download.',
  keywords: ['Pinterest Downloader', 'Pinterest Video Downloader', 'PinSaver', 'Pinterest to MP4', 'Save Pinterest Images', 'Pinterest GIF Downloader', 'High Quality Pinterest Downloader'],
  openGraph: {
    title: 'PinImageGrab - Pinterest Video & Image Downloader',
    description: 'Download high-quality Pinterest images, videos, and GIFs for free. No login required.',
    url: 'https://pinimagegrab.com',
    siteName: 'PinImageGrab',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PinImageGrab - Best Pinterest Downloader',
    description: 'Download Pinterest videos and images in 4K/HD quality. Free and fast.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
