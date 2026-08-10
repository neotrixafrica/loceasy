import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from "@/components/shared/ServiceWorkerRegistrar";

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LocEasy — Logements au Togo, simples et sûrs",
  description:
    "La plateforme de location de logements au Togo pour les étudiants et fonctionnaires. Trouvez chambres, studios et appartements dans toutes les villes togolaises.",
  keywords: [
    "LocEasy",
    "Togo",
    "logement",
    "location",
    "étudiants",
    "fonctionnaires",
    "chambre",
    "studio",
    "appartement",
    "Lomé",
  ],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "LocEasy — Logements au Togo, simples et sûrs",
    description:
      "Trouvez votre prochain logement au Togo en quelques clics. Plateforme sécurisée et intuitive.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <ServiceWorkerRegistrar />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
