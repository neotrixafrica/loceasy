import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/layout/Footer";
import { ServiceWorkerRegistrar } from "@/components/shared/ServiceWorkerRegistrar";

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
        className="antialiased bg-background text-foreground font-sans min-h-screen flex flex-col"
      >
        {children}
        <Footer />
        <ServiceWorkerRegistrar />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
