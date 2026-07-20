import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadRise",
  description:
    "Culturally alive, decodable-cold texts a striving reader can read on their own.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
