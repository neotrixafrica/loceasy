import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LocEasy Togo - Trouvez votre logement au Togo",
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
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "LocEasy Togo - Logements pour étudiants et fonctionnaires",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
