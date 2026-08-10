import { Logo } from '@/components/shared/Logo';
import { MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo showText={false} />
              <span className="font-display font-extrabold text-xl tracking-tight text-primary-foreground">
                Loc<span className="text-accent">Easy</span>
              </span>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              La plateforme de location de logements au Togo, simple, sûre et rapide.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Explorer</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="/search" className="hover:text-primary-foreground transition-colors">Rechercher</a></li>
              <li><a href="/add-listing" className="hover:text-primary-foreground transition-colors">Publier une annonce</a></li>
              <li><a href="/favorites" className="hover:text-primary-foreground transition-colors">Favoris</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Conditions d&apos;utilisation</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Aide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lomé, Togo
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contact@loceasy.tg
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +228 90 00 00 00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/70">
          © {currentYear} LocEasy. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
