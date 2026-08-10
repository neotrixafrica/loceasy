import { Header } from '@/components/layout/Header';

export default function ConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-24 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
          Conditions d&apos;utilisation
        </h1>
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().getFullYear()}
        </p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">1. Objet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes conditions d&apos;utilisation régissent l&apos;accès et l&apos;utilisation de la plateforme LocEasy, qui met en relation des propriétaires et des locataires au Togo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">2. Inscription</h2>
            <p className="text-muted-foreground leading-relaxed">
              L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de son inscription. Chaque compte est personnel et ne peut être transféré sans autorisation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">3. Annonces</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les propriétaires sont responsables du contenu de leurs annonces. Les informations (prix, localisation, photos) doivent être véridiques et mises à jour.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">4. Réservations et paiements</h2>
            <p className="text-muted-foreground leading-relaxed">
              LocEasy facilite la mise en relation. Les conditions financières et les modalités de paiement sont définies directement entre les parties. La plateforme n&apos;est pas responsable des litiges.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">5. Comportement des utilisateurs</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tout contenu illicite, trompeur ou offensant est interdit. LocEasy se réserve le droit de suspendre ou supprimer un compte en cas de non-respect.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">6. Responsabilités</h2>
            <p className="text-muted-foreground leading-relaxed">
              LocEasy s&apos;efforce de maintenir le service disponible mais ne peut garantir l&apos;absence d&apos;interruptions. La plateforme n&apos;est pas partie aux contrats de location.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">7. Modification des conditions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les conditions peuvent être modifiées à tout moment. L&apos;utilisateur est invité à les consulter régulièrement.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
