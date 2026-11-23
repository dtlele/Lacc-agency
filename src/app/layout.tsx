import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, Quicksand } from "next/font/google";
import "./globals.css";

const bagel = Bagel_Fat_One({ weight: "400", subsets: ["latin"], variable: "--font-bagel", display: "swap" });
const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-quicksand", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Filo & Fantasia", template: "%s | Filo & Fantasia" },
  description: "Trasforma una foto in uno schema all'uncinetto, segui i passi, chiedi consiglio all'assistente e trova i materiali.",
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fff7ee" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${bagel.variable} ${quicksand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
