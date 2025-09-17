import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.gasyard.fi"),
  title: "Gasyard",
  description: "Fast Cross VM Bridge",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Gasyard",
    description: "Fast Cross VM Bridge",
    url: "https://gasyard.com",
    siteName: "Gasyard",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Gasyard - Fast Cross VM Bridge",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gasyard",
    description: "Fast Cross VM Bridge",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetBrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
