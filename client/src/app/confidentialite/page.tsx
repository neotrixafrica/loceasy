import { Header } from '@/components/layout/Header';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-24 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
          Politique de confidentialité
        </h1>
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().getFullYear()}
        </p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">1. Données collectées</h2>
            <p className="text-muted-foreground leading-relaxed">
              LocEasy collecte les informations nécessaires à l&apos;utilisation du service : nom, adresse email, numéro de téléphone, ville, photos et informations de logement pour les propriétaires.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">2. Finalité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les données sont utilisées pour permettre la mise en relation, la gestion des annonces, des réservations, des messages et l&apos;amélioration du service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">3. Conservation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les données sont conservées pendant la durée de l&apos;utilisation du compte. Vous pouvez demander leur suppression à tout moment en contactant le support.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">4. Partage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos coordonnées peuvent être partagées avec un autre utilisateur uniquement dans le cadre d&apos;une réservation ou d&apos;un échange de messages. Nous ne vendons pas vos données.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">5. Sécurité</h2>
            <p className="text-muted-foreground leading-relaxed">
              LocEasy met en œuvre des mesures de sécurité pour protéger vos données. Cependant, aucun système n&apos;est infaillible.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">6. Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à la réglementation en vigueur, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question, vous pouvez nous contacter à l&apos;adresse contact@loceasy.tg.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
