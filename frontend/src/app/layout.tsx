import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested/implied by "clean sans-serif"
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YTDLer - Premium YouTube Downloader",
  description: "Download YouTube videos instantly in high quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
          }
        }} />
      </body>
    </html>
  );
}
