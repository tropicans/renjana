import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// Self-host Manrope font via next/font/google
// Fonts are automatically optimized and served from same domain
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Renjana - Elite Legal Training",
  description: "Empowering Professionals. Redefining Legal Excellence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${manrope.variable}`} suppressHydrationWarning>
      <body className={`${manrope.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
