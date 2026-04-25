import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tamago — Your AI Virtual Pet",
  description: "A local-ready, LLM-driven virtual pet with thoughts, feelings, and evolving DNA. Feed, play, chat, and watch it grow!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="scanlines" />
        {children}
      </body>
    </html>
  );
}
