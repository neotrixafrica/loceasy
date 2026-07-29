export type Lang = 'fr' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // App
    'app.name': 'LocEasy Togo',
    'app.tagline': 'Trouvez votre logement au Togo en quelques clics',
    'app.subtitle': 'La plateforme de référence pour les étudiants et fonctionnaires',

    // Navigation
    'nav.home': 'Accueil',
    'nav.search': 'Recherche',
    'nav.messages': 'Messages',
    'nav.favorites': 'Favoris',
    'nav.profile': 'Profil',
    'nav.dashboard': 'Tableau de bord',
    'nav.addListing': 'Ajouter une annonce',
    'nav.myBookings': 'Mes réservations',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',

    // Hero
    'hero.title': 'Votre prochain logement vous attend',
    'hero.subtitle': 'Des milliers de chambres, studios et appartements disponibles dans toutes les villes du Togo',
    'hero.search.placeholder': 'Ville, quartier ou mot-clé...',
    'hero.search.button': 'Rechercher',
    'hero.stats.listings': 'Logements',
    'hero.stats.cities': 'Villes',
    'hero.stats.users': 'Utilisateurs',

    // Popular Cities
    'cities.title': 'Villes populaires',
    'cities.subtitle': 'Explorez les logements disponibles dans les principales villes du Togo',
    'cities.listings': 'logements disponibles',

    // How it works
    'how.title': 'Comment ça marche',
    'how.subtitle': 'Trouvez votre logement en 3 étapes simples',
    'how.step1.title': 'Recherchez',
    'how.step1.desc': 'Parcourez les annonces par ville, prix et type de logement selon vos besoins.',
    'how.step2.title': 'Réservez',
    'how.step2.desc': 'Demandez une visite et réservez en ligne. Paiement sécurisé par Mobile Money.',
    'how.step3.title': 'Emménagez',
    'how.step3.desc': 'Prenez possession de votre nouveau logement et installez-vous confortablement.',

    // Search
    'search.title': 'Recherche de logements',
    'search.filters': 'Filtres',
    'search.city': 'Ville',
    'search.city.all': 'Toutes les villes',
    'search.quartier': 'Quartier',
    'search.quartier.all': 'Tous les quartiers',
    'search.type': 'Type',
    'search.type.all': 'Tous les types',
    'search.price.min': 'Prix min',
    'search.price.max': 'Prix max',
    'search.apply': 'Appliquer',
    'search.reset': 'Réinitialiser',
    'search.results': 'résultats trouvés',
    'search.noResults': 'Aucun résultat trouvé',
    'search.noResults.desc': 'Essayez de modifier vos filtres de recherche',
    'search.sort': 'Trier par',
    'search.sort.priceAsc': 'Prix croissant',
    'search.sort.priceDesc': 'Prix décroissant',
    'search.sort.recent': 'Plus récent',
    'search.keyword': 'Mot-clé',

    // Listing types
    'type.chambre': 'Chambre',
    'type.studio': 'Studio',
    'type.appartement': 'Appartement',

    // Listing detail
    'detail.back': 'Retour',
    'detail.price': 'FCFA/mois',
    'detail.rooms': 'pièce(s)',
    'detail.area': 'm²',
    'detail.amenities': 'Équipements',
    'detail.description': 'Description',
    'detail.rules': 'Règles et conditions',
    'detail.landlord': 'Propriétaire',
    'detail.contact': 'Contacter',
    'detail.book': 'Réserver',
    'detail.favorites': 'Ajouter aux favoris',
    'detail.location': 'Localisation',
    'detail.gallery': 'Galerie photos',

    // Auth
    'auth.login.title': 'Connexion',
    'auth.register.title': 'Créer un compte',
    'auth.email': 'Adresse email',
    'auth.password': 'Mot de passe',
    'auth.name': 'Nom complet',
    'auth.phone': 'Téléphone',
    'auth.role': 'Vous êtes',
    'auth.role.tenant': 'Locataire',
    'auth.role.landlord': 'Propriétaire',
    'auth.submit': 'Se connecter',
    'auth.register.submit': "S'inscrire",
    'auth.noAccount': 'Pas de compte ?',
    'auth.hasAccount': 'Déjà un compte ?',
    'auth.success': 'Connexion réussie !',
    'auth.error': 'Email ou mot de passe incorrect',
    'auth.register.success': 'Compte créé avec succès !',

    // Booking
    'booking.title': 'Réservation',
    'booking.start': 'Date de début',
    'booking.end': 'Date de fin',
    'booking.message': 'Message pour le propriétaire',
    'booking.message.placeholder': 'Décrivez votre situation et vos besoins...',
    'booking.submit': 'Envoyer la demande',
    'booking.success': 'Demande de réservation envoyée !',
    'booking.requests': 'Demandes de réservation',
    'booking.myBookings': 'Mes réservations',

    // Booking status
    'status.pending': 'En attente',
    'status.accepted': 'Acceptée',
    'status.rejected': 'Refusée',
    'status.cancelled': 'Annulée',

    // Messages
    'messages.title': 'Messages',
    'messages.noMessages': 'Aucun message',
    'messages.noMessages.desc': 'Commencez une conversation en contactant un propriétaire',
    'messages.placeholder': 'Écrivez un message...',
    'messages.send': 'Envoyer',
    'messages.online': 'En ligne',

    // Favorites
    'favorites.title': 'Mes favoris',
    'favorites.empty': 'Aucun favori',
    'favorites.empty.desc': 'Sauvegardez vos annonces préférées pour les retrouver facilement',
    'favorites.remove': 'Retirer',

    // Profile
    'profile.title': 'Mon profil',
    'profile.edit': 'Modifier',
    'profile.logout': 'Déconnexion',
    'profile.role.tenant': 'Locataire',
    'profile.role.landlord': 'Propriétaire',
    'profile.myListings': 'Mes annonces',
    'profile.settings': 'Paramètres',
    'profile.language': 'Langue',

    // Dashboard (Landlord)
    'dashboard.title': 'Tableau de bord',
    'dashboard myListings': 'Mes annonces',
    'dashboard.totalListings': 'Total annonces',
    'dashboard.activeBookings': 'Réservations actives',
    'dashboard.pendingRequests': 'Demandes en attente',
    'dashboard.accept': 'Accepter',
    'dashboard.reject': 'Refuser',
    'dashboard.edit': 'Modifier',
    'dashboard.delete': 'Supprimer',
    'dashboard.noListings': 'Aucune annonce',
    'dashboard.noListings.desc': 'Ajoutez votre première annonce de logement',
    'dashboard.listing.add': 'Ajouter une annonce',

    // Add Listing
    'addListing.title': 'Nouvelle annonce',
    'addListing.titleField': 'Titre de l\'annonce',
    'addListing.description': 'Description',
    'addListing.price': 'Prix (FCFA/mois)',
    'addListing.type': 'Type de logement',
    'addListing.city': 'Ville',
    'addListing.quartier': 'Quartier',
    'addListing.address': 'Adresse',
    'addListing.rooms': 'Nombre de pièces',
    'addListing.area': 'Superficie (m²)',
    'addListing.amenities': 'Équipements',
    'addListing.images': 'URLs des images',
    'addListing.rules': 'Règles',
    'addListing.submit': 'Publier l\'annonce',
    'addListing.success': 'Annonce publiée avec succès !',

    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.confirm': 'Confirmer',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.success': 'Opération réussie',
    'common.back': 'Retour',
    'common.all': 'Tous',
    'common.fcfa': 'FCFA',
    'common.perMonth': '/mois',

    // Footer
    'footer.about': 'À propos',
    'footer.contact': 'Contact',
    'footer.terms': 'Conditions',
    'footer.rights': 'Tous droits réservés',
    'footer.description': 'La plateforme de location de logements au Togo pour les étudiants et fonctionnaires.',

    // Cities list
    'city.lome': 'Lomé',
    'city.sokode': 'Sokodé',
    'city.kara': 'Kara',
    'city.atakpame': 'Atakpamé',
    'city.kpalime': 'Kpalimé',
    'city.tsevie': 'Tsévié',
    'city.aneho': 'Aného',
    'city.dapaong': 'Dapaong',
    'city.bafilo': 'Bafilo',
    'city.niamtougou': 'Niamtougou',

    // Amenities
    'amenity.climatisation': 'Climatisation',
    'amenity.wifi': 'Wi-Fi',
    'amenity.parking': 'Parking',
    'amenity.water': 'Eau courante',
    'amenity.electricity': 'Électricité',
    'amenity.kitchen': 'Cuisine',
    'amenity.bathroom': 'Salle de bain',
    'amenity.security': 'Sécurité',
    'amenity.garden': 'Jardin',
    'amenity.furniture': 'Meubles',
  },
  en: {
    // App
    'app.name': 'LocEasy Togo',
    'app.tagline': 'Find your housing in Togo in a few clicks',
    'app.subtitle': 'The leading platform for students and civil servants',

    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.messages': 'Messages',
    'nav.favorites': 'Favorites',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    'nav.addListing': 'Add listing',
    'nav.myBookings': 'My bookings',
    'nav.login': 'Login',
    'nav.register': 'Register',

    // Hero
    'hero.title': 'Your next home is waiting',
    'hero.subtitle': 'Thousands of rooms, studios and apartments available across all cities in Togo',
    'hero.search.placeholder': 'City, neighborhood or keyword...',
    'hero.search.button': 'Search',
    'hero.stats.listings': 'Listings',
    'hero.stats.cities': 'Cities',
    'hero.stats.users': 'Users',

    // Popular Cities
    'cities.title': 'Popular cities',
    'cities.subtitle': 'Explore available housing in major cities of Togo',
    'cities.listings': 'listings available',

    // How it works
    'how.title': 'How it works',
    'how.subtitle': 'Find your housing in 3 simple steps',
    'how.step1.title': 'Search',
    'how.step1.desc': 'Browse listings by city, price and housing type according to your needs.',
    'how.step2.title': 'Book',
    'how.step2.desc': 'Request a visit and book online. Secure payment via Mobile Money.',
    'how.step3.title': 'Move in',
    'how.step3.desc': 'Take possession of your new home and settle in comfortably.',

    // Search
    'search.title': 'Housing search',
    'search.filters': 'Filters',
    'search.city': 'City',
    'search.city.all': 'All cities',
    'search.quartier': 'Neighborhood',
    'search.quartier.all': 'All neighborhoods',
    'search.type': 'Type',
    'search.type.all': 'All types',
    'search.price.min': 'Min price',
    'search.price.max': 'Max price',
    'search.apply': 'Apply',
    'search.reset': 'Reset',
    'search.results': 'results found',
    'search.noResults': 'No results found',
    'search.noResults.desc': 'Try adjusting your search filters',
    'search.sort': 'Sort by',
    'search.sort.priceAsc': 'Price ascending',
    'search.sort.priceDesc': 'Price descending',
    'search.sort.recent': 'Most recent',
    'search.keyword': 'Keyword',

    // Listing types
    'type.chambre': 'Room',
    'type.studio': 'Studio',
    'type.appartement': 'Apartment',

    // Listing detail
    'detail.back': 'Back',
    'detail.price': 'FCFA/month',
    'detail.rooms': 'room(s)',
    'detail.area': 'm²',
    'detail.amenities': 'Amenities',
    'detail.description': 'Description',
    'detail.rules': 'Rules and conditions',
    'detail.landlord': 'Landlord',
    'detail.contact': 'Contact',
    'detail.book': 'Book',
    'detail.favorites': 'Add to favorites',
    'detail.location': 'Location',
    'detail.gallery': 'Photo gallery',

    // Auth
    'auth.login.title': 'Login',
    'auth.register.title': 'Create account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.name': 'Full name',
    'auth.phone': 'Phone',
    'auth.role': 'You are',
    'auth.role.tenant': 'Tenant',
    'auth.role.landlord': 'Landlord',
    'auth.submit': 'Sign in',
    'auth.register.submit': 'Sign up',
    'auth.noAccount': 'No account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.success': 'Login successful!',
    'auth.error': 'Incorrect email or password',
    'auth.register.success': 'Account created successfully!',

    // Booking
    'booking.title': 'Booking',
    'booking.start': 'Start date',
    'booking.end': 'End date',
    'booking.message': 'Message to landlord',
    'booking.message.placeholder': 'Describe your situation and needs...',
    'booking.submit': 'Send request',
    'booking.success': 'Booking request sent!',
    'booking.requests': 'Booking requests',
    'booking.myBookings': 'My bookings',

    // Booking status
    'status.pending': 'Pending',
    'status.accepted': 'Accepted',
    'status.rejected': 'Rejected',
    'status.cancelled': 'Cancelled',

    // Messages
    'messages.title': 'Messages',
    'messages.noMessages': 'No messages',
    'messages.noMessages.desc': 'Start a conversation by contacting a landlord',
    'messages.placeholder': 'Write a message...',
    'messages.send': 'Send',
    'messages.online': 'Online',

    // Favorites
    'favorites.title': 'My favorites',
    'favorites.empty': 'No favorites',
    'favorites.empty.desc': 'Save your favorite listings to find them easily',
    'favorites.remove': 'Remove',

    // Profile
    'profile.title': 'My profile',
    'profile.edit': 'Edit',
    'profile.logout': 'Logout',
    'profile.role.tenant': 'Tenant',
    'profile.role.landlord': 'Landlord',
    'profile.myListings': 'My listings',
    'profile.settings': 'Settings',
    'profile.language': 'Language',

    // Dashboard (Landlord)
    'dashboard.title': 'Dashboard',
    'dashboard myListings': 'My listings',
    'dashboard.totalListings': 'Total listings',
    'dashboard.activeBookings': 'Active bookings',
    'dashboard.pendingRequests': 'Pending requests',
    'dashboard.accept': 'Accept',
    'dashboard.reject': 'Reject',
    'dashboard.edit': 'Edit',
    'dashboard.delete': 'Delete',
    'dashboard.noListings': 'No listings',
    'dashboard.noListings.desc': 'Add your first housing listing',
    'dashboard.listing.add': 'Add listing',

    // Add Listing
    'addListing.title': 'New listing',
    'addListing.titleField': 'Listing title',
    'addListing.description': 'Description',
    'addListing.price': 'Price (FCFA/month)',
    'addListing.type': 'Housing type',
    'addListing.city': 'City',
    'addListing.quartier': 'Neighborhood',
    'addListing.address': 'Address',
    'addListing.rooms': 'Number of rooms',
    'addListing.area': 'Area (m²)',
    'addListing.amenities': 'Amenities',
    'addListing.images': 'Image URLs',
    'addListing.rules': 'Rules',
    'addListing.submit': 'Publish listing',
    'addListing.success': 'Listing published successfully!',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Operation successful',
    'common.back': 'Back',
    'common.all': 'All',
    'common.fcfa': 'FCFA',
    'common.perMonth': '/month',

    // Footer
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.terms': 'Terms',
    'footer.rights': 'All rights reserved',
    'footer.description': 'The housing rental platform in Togo for students and civil servants.',

    // Cities list
    'city.lome': 'Lomé',
    'city.sokode': 'Sokodé',
    'city.kara': 'Kara',
    'city.atakpame': 'Atakpamé',
    'city.kpalime': 'Kpalimé',
    'city.tsevie': 'Tsévié',
    'city.aneho': 'Aného',
    'city.dapaong': 'Dapaong',
    'city.bafilo': 'Bafilo',
    'city.niamtougou': 'Niamtougou',

    // Amenities
    'amenity.climatisation': 'Air conditioning',
    'amenity.wifi': 'Wi-Fi',
    'amenity.parking': 'Parking',
    'amenity.water': 'Running water',
    'amenity.electricity': 'Electricity',
    'amenity.kitchen': 'Kitchen',
    'amenity.bathroom': 'Bathroom',
    'amenity.security': 'Security',
    'amenity.garden': 'Garden',
    'amenity.furniture': 'Furniture',
  },
};

export function t(key: string, lang: Lang = 'fr'): string {
  return translations[lang]?.[key] || translations['fr']?.[key] || key;
}

export const TOGO_CITIES = [
  'Lomé', 'Sokodé', 'Kara', 'Atakpamé', 'Kpalimé',
  'Tsévié', 'Aného', 'Dapaong', 'Bafilo', 'Niamtougou',
];

export const TOGO_QUARTIERS: Record<string, string[]> = {
  'Lomé': ['Tokoin', 'Kodjoviakopé', 'Adidogomé', 'Bé', 'Agoè', 'Centreville', 'Nyékonakpoé', 'Amoutivé'],
  'Sokodé': ['Centre-ville', 'Tchati', 'Kolina'],
  'Kara': ['Centre-ville', 'Léo', 'Pagouda'],
  'Atakpamé': ['Tokpli', 'Centre-ville'],
  'Kpalimé': ['Centre-ville', 'Agou', 'Kloto'],
  'Tsévié': ['Centre', 'Hohoe road'],
  'Aného': ['Centre-ville', 'Beach'],
  'Dapaong': ['Centre-ville', 'Tambi', 'Savanes'],
};

export const AMENITIES_LIST = [
  'Climatisation', 'Wi-Fi', 'Parking', 'Eau courante', 'Électricité',
  'Cuisine', 'Salle de bain', 'Sécurité', 'Jardin', 'Meubles',
  'Ventilateur', 'Lit double', 'Armoire', 'Bureau', 'Gardiennage',
  'Terrasse', 'Lave-linge', 'Cour commune', 'Éspace lavage',
  'Climatisation réversible', 'Cuisine américaine', 'Vue montagne', 'Vue panoramique',
  'Proche plage', 'Transport quotidien',
];

export default translations;
