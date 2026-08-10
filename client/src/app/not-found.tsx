import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-muted/30">
      <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 shadow-lg">
        <span className="font-display text-4xl font-extrabold">4</span>
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
        404
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold text-foreground transition hover:bg-accent"
        >
          <Search className="h-4 w-4" />
          Rechercher un logement
        </Link>
      </div>
    </div>
  );
}
