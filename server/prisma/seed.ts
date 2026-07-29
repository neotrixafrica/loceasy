import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

async function hash(pwd: string) {
  return bcrypt.hash(pwd, 12);
}

async function seed() {
  // Clean existing data
  await db.message.deleteMany();
  await db.favorite.deleteMany();
  await db.booking.deleteMany();
  await db.listing.deleteMany();
  await db.user.deleteMany();

  // Create users
  const tenant1 = await db.user.create({
    data: {
      email: 'komlan@student.tg',
      password: await hash('password123'),
      name: 'Komlan Agbéko',
      phone: '+228 90 12 34 56',
      role: 'tenant',
      city: 'Lomé',
      verified: true,
    },
  });

  const tenant2 = await db.user.create({
    data: {
      email: 'ayawo@fonctionnaire.tg',
      password: await hash('password123'),
      name: 'Ayawo Dossou',
      phone: '+228 91 23 45 67',
      role: 'tenant',
      city: 'Sokodé',
      verified: true,
    },
  });

  const landlord1 = await db.user.create({
    data: {
      email: 'mensah@proprio.tg',
      password: await hash('password123'),
      name: 'Mensah Akakpo',
      phone: '+228 92 34 56 78',
      role: 'landlord',
      city: 'Lomé',
      verified: true,
    },
  });

  const landlord2 = await db.user.create({
    data: {
      email: 'amenega@proprio.tg',
      password: await hash('password123'),
      name: 'Aménégah Koffi',
      phone: '+228 93 45 67 89',
      role: 'landlord',
      city: 'Kara',
      verified: true,
    },
  });

  // Create listings for landlord1 (Lomé)
  const listings1 = await Promise.all([
    db.listing.create({
      data: {
        title: 'Chambre meublée à Tokoin',
        description: 'Chambre spacieuse et meublée dans un quartier calme de Tokoin. Proche de l\'Université de Lomé et des transports en commun. Idéal pour étudiant. La chambre dispose d\'un lit double, d\'une armoire, d\'un bureau et d\'un ventilateur. L\'eau et l\'électricité sont incluses dans le loyer.',
        price: 25000,
        type: 'chambre',
        city: 'Lomé',
        quartier: 'Tokoin',
        address: 'Rue du Collège, Tokoin',
        latitude: 6.1319,
        longitude: 1.2228,
        rooms: 1,
        area: 18,
        amenities: ['Ventilateur', 'Lit double', 'Armoire', 'Bureau', 'Eau incluse', 'Électricité incluse', 'Cour commune'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Chambre+Tokoin+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Chambre+Tokoin+2',
          'https://placehold.co/600x400/059669/ffffff?text=Chambre+Tokoin+3',
        ],
        rules: 'Pas d\'animaux. Pas de visiteurs après 22h. Le loyer est payable le 5 de chaque mois.',
        available: true,
        landlordId: landlord1.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Studio moderne à Kodjoviakopé',
        description: 'Studio entièrement rénové dans le quartier résidentiel de Kodjoviakopé. Cuisine équipée, salle de bain moderne, climatisation. Proche du Marché de Kodjoviakopé et des écoles. Parking disponible. Parfait pour un jeune fonctionnaire.',
        price: 65000,
        type: 'studio',
        city: 'Lomé',
        quartier: 'Kodjoviakopé',
        address: 'Avenue de la Paix, Kodjoviakopé',
        latitude: 6.1395,
        longitude: 1.2154,
        rooms: 2,
        area: 35,
        amenities: ['Climatisation', 'Cuisine équipée', 'Salle de bain moderne', 'Parking', 'Eau courante', 'Gardiennage'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Studio+Kodjoviakopé+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Studio+Kodjoviakopé+2',
          'https://placehold.co/600x400/059669/ffffff?text=Studio+Kodjoviakopé+3',
        ],
        rules: 'Caution d\'un mois de loyer. Pas d\'animaux de compagnie.',
        available: true,
        landlordId: landlord1.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Appartement 3 pièces à Bé',
        description: 'Bel appartement de 3 pièces dans le quartier de Bé, à 10 minutes du centre-ville. Deux chambres, un salon, une cuisine et une salle de bain. Meubles de base inclus. Cour commune avec espace de lavage.',
        price: 120000,
        type: 'appartement',
        city: 'Lomé',
        quartier: 'Bé',
        address: 'Boulevard du 13 Janvier, Bé',
        latitude: 6.1490,
        longitude: 1.2340,
        rooms: 3,
        area: 65,
        amenities: ['2 Chambres', 'Salon', 'Cuisine', 'Salle de bain', 'Cour commune', 'Espace lavage', 'Eau courante'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Appart+Bé+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Appart+Bé+2',
          'https://placehold.co/600x400/059669/ffffff?text=Appart+Bé+3',
        ],
        rules: 'Caution de deux mois. Loyer payable d\'avance. Visite sur rendez-vous.',
        available: true,
        landlordId: landlord1.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Chambre universitaire à Adidogomé',
        description: 'Chambre individuelle meublée dans une maison partagée, spécialement conçue pour les étudiants. Accès internet Wi-Fi, cuisine commune équipée, salle de bain partagée. Quartier étudiant avec commerces de proximité.',
        price: 18000,
        type: 'chambre',
        city: 'Lomé',
        quartier: 'Adidogomé',
        address: 'Derrière le lycée, Adidogomé',
        latitude: 6.1700,
        longitude: 1.2000,
        rooms: 1,
        area: 14,
        amenities: ['Wi-Fi', 'Cuisine commune', 'Salle de bain partagée', 'Lit', 'Bureau', 'Électricité incluse'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Chambre+Adidogomé+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Chambre+Adidogomé+2',
        ],
        rules: 'Pas de fumeurs. Respect des horaires de calme (22h-7h). Partage des tâches ménagères.',
        available: true,
        landlordId: landlord1.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Studio standing à Centreville',
        description: 'Studio haut standing au cœur de Lomé-Centreville. Finitions modernes, climatisation réversible, cuisine américaine équipée, terrasse privée avec vue. Proche des administrations et ambassades.',
        price: 150000,
        type: 'studio',
        city: 'Lomé',
        quartier: 'Centreville',
        address: 'Avenue du 2 Octobre, Centreville',
        latitude: 6.1363,
        longitude: 1.2224,
        rooms: 1,
        area: 40,
        amenities: ['Climatisation réversible', 'Cuisine américaine', 'Terrasse', 'Vue panoramique', 'Gardiennage 24h', 'Lave-linge'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Studio+Centreville+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Studio+Centreville+2',
          'https://placehold.co/600x400/059669/ffffff?text=Studio+Centreville+3',
        ],
        rules: 'Loyer trimestriel. Pas de sous-location. Copie de pièce d\'identité requise.',
        available: true,
        landlordId: landlord1.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Chambre à Agoè-Nyékonakpoé',
        description: 'Chambre meublée à Agoè, dans un environnement familial et sécurisé. Proche de l\'École Nationale d\'Administration et du Centre Hospitalier Universitaire. Transport facile vers le centre-ville.',
        price: 22000,
        type: 'chambre',
        city: 'Lomé',
        quartier: 'Agoè',
        address: 'Route d\'Agoè, Nyékonakpoé',
        latitude: 6.1550,
        longitude: 1.2100,
        rooms: 1,
        area: 16,
        amenities: ['Ventilateur', 'Lit simple', 'Armoire', 'Eau courante', 'Cour commune', 'Sécurité'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Chambre+Agoè+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Chambre+Agoè+2',
        ],
        rules: 'Pas de bruit excessif. Visiteurs limités en semaine.',
        available: true,
        landlordId: landlord1.id,
      },
    }),
  ]);

  // Create listings for landlord2 (Kara and others)
  const listings2 = await Promise.all([
    db.listing.create({
      data: {
        title: 'Chambre étudiante à Kara',
        description: 'Chambre individuelle pour étudiant à Kara-centre. Proche de l\'Université de Kara. Quartier calme et sécurisé avec tous les commerces à proximité. Transport en commun disponible.',
        price: 15000,
        type: 'chambre',
        city: 'Kara',
        quartier: 'Centre-ville',
        address: 'Avenue de l\'Indépendance, Kara',
        latitude: 9.5513,
        longitude: 1.1862,
        rooms: 1,
        area: 15,
        amenities: ['Lit', 'Bureau', 'Armoire', 'Ventilateur', 'Eau courante', 'Électricité'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Chambre+Kara+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Chambre+Kara+2',
        ],
        rules: 'Pas d\'animaux. Calme de rigueur.',
        available: true,
        landlordId: landlord2.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Studio pour fonctionnaire à Sokodé',
        description: 'Studio confortable à Sokodé, adapté pour un fonctionnaire en poste. Meublé avec goût, proche de la Préfecture et des services administratifs. Climatisation et eau courante.',
        price: 55000,
        type: 'studio',
        city: 'Sokodé',
        quartier: 'Centre-ville',
        address: 'Rue du Marché, Sokodé',
        latitude: 9.0340,
        longitude: 1.1300,
        rooms: 2,
        area: 30,
        amenities: ['Climatisation', 'Cuisine', 'Salle de bain', 'Meubles', 'Eau courante', 'Parking'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Studio+Sokodé+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Studio+Sokodé+2',
        ],
        rules: 'Caution d\'un mois. Loyer mensuel.',
        available: true,
        landlordId: landlord2.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Chambre à Kpalimé',
        description: 'Chambre meublée à Kpalimé, dans une maison avec vue sur les montagnes. Idéal pour ceux qui aiment la nature et le climat frais. Proche du marché de Kpalimé.',
        price: 20000,
        type: 'chambre',
        city: 'Kpalimé',
        quartier: 'Centre-ville',
        address: 'Route du Mont Agou, Kpalimé',
        latitude: 7.7500,
        longitude: 0.8333,
        rooms: 1,
        area: 16,
        amenities: ['Vue montagne', 'Ventilateur', 'Lit', 'Armoire', 'Eau courante', 'Jardin'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Chambre+Kpalimé+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Chambre+Kpalimé+2',
        ],
        rules: 'Respect de la propriété. Pas de fumeurs.',
        available: true,
        landlordId: landlord2.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Appartement familial à Atakpamé',
        description: 'Appartement spacieux de 4 pièces à Atakpamé. Convient pour un couple ou une petite famille de fonctionnaire. Cuisine équipée, deux chambres, salon, salle de bain. Quartier résidentiel.',
        price: 90000,
        type: 'appartement',
        city: 'Atakpamé',
        quartier: 'Tokpli',
        address: 'Quartier Tokpli, Atakpamé',
        latitude: 7.8570,
        longitude: 1.2170,
        rooms: 4,
        area: 75,
        amenities: ['2 Chambres', 'Salon', 'Cuisine équipée', 'Salle de bain', 'Cour', 'Eau courante', 'Parking'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Appart+Atakpamé+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Appart+Atakpamé+2',
          'https://placehold.co/600x400/059669/ffffff?text=Appart+Atakpamé+3',
        ],
        rules: 'Caution de deux mois. Pas d\'animaux.',
        available: true,
        landlordId: landlord2.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Chambre à Tsévié',
        description: 'Chambre meublée à Tsévié, à 35 km de Lomé. Transport quotidien vers la capitale. Meubles basiques, ventilateur, armoire. Quartier calme et abordable.',
        price: 12000,
        type: 'chambre',
        city: 'Tsévié',
        quartier: 'Centre',
        address: 'Route de Lomé, Tsévié',
        latitude: 6.3260,
        longitude: 1.2350,
        rooms: 1,
        area: 14,
        amenities: ['Ventilateur', 'Lit', 'Armoire', 'Eau courante', 'Transport quotidien'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Chambre+Tsévié+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Chambre+Tsévié+2',
        ],
        rules: 'Paiement mensuel ponctuel.',
        available: true,
        landlordId: landlord2.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Studio à Aného',
        description: 'Studio meublé à Aného, à deux pas de la plage. Climatisation, cuisine équipée. Idéal pour ceux qui travaillent dans la zone frontalière ou apprécient la vie côtière.',
        price: 45000,
        type: 'studio',
        city: 'Aného',
        quartier: 'Centre-ville',
        address: 'Boulevard de la Plage, Aného',
        latitude: 6.2283,
        longitude: 1.6367,
        rooms: 1,
        area: 28,
        amenities: ['Climatisation', 'Cuisine', 'Salle de bain', 'Proche plage', 'Meubles'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Studio+Aného+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Studio+Aného+2',
        ],
        rules: 'Caution d\'un mois. Loyer mensuel.',
        available: true,
        landlordId: landlord2.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Chambre à Dapaong',
        description: 'Chambre meublée à Dapaong, dans le nord du Togo. Proche des services administratifs de la région des Savanes. Abordable et fonctionnel.',
        price: 10000,
        type: 'chambre',
        city: 'Dapaong',
        quartier: 'Centre-ville',
        address: 'Rue de la Mairie, Dapaong',
        latitude: 10.8620,
        longitude: 0.2280,
        rooms: 1,
        area: 15,
        amenities: ['Ventilateur', 'Lit', 'Armoire', 'Eau courante', 'Électricité'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Chambre+Dapaong+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Chambre+Dapaong+2',
        ],
        rules: 'Paiement mensuel. Pas de sous-location.',
        available: true,
        landlordId: landlord2.id,
      },
    }),
    db.listing.create({
      data: {
        title: 'Appartement à Kara-centre',
        description: 'Appartement de 3 pièces au centre de Kara. Idéal pour fonctionnaire en poste dans la capitale régionale. Salon, deux chambres, cuisine, salle de bain. Gardiennage inclus.',
        price: 85000,
        type: 'appartement',
        city: 'Kara',
        quartier: 'Centre-ville',
        address: 'Avenue de la République, Kara',
        latitude: 9.5500,
        longitude: 1.1900,
        rooms: 3,
        area: 60,
        amenities: ['2 Chambres', 'Salon', 'Cuisine', 'Salle de bain', 'Gardiennage', 'Parking', 'Eau courante'],
        images: [
          'https://placehold.co/600x400/047857/ffffff?text=Appart+Kara+1',
          'https://placehold.co/600x400/065f46/ffffff?text=Appart+Kara+2',
          'https://placehold.co/600x400/059669/ffffff?text=Appart+Kara+3',
        ],
        rules: 'Caution de deux mois. Loyer mensuel à payer le 1er.',
        available: true,
        landlordId: landlord2.id,
      },
    }),
  ]);

  const allListings = [...listings1, ...listings2];

  // Create bookings
  await db.booking.createMany({
    data: [
      {
        status: 'pending',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-12-31'),
        message: 'Bonjour, je suis étudiant à l\'Université de Lomé et je cherche une chambre pour le semestre prochain. Est-elle toujours disponible ?',
        tenantId: tenant1.id,
        listingId: listings1[0].id,
      },
      {
        status: 'accepted',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-01-31'),
        message: 'Je souhaite réserver ce studio à partir du 1er août. Je suis fonctionnaire en poste à Lomé.',
        tenantId: tenant1.id,
        listingId: listings1[1].id,
      },
      {
        status: 'pending',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-06-30'),
        message: 'Bonjour, fonctionnaire muté à Sokodé. Ce studio me conviendrait-il ? Merci.',
        tenantId: tenant2.id,
        listingId: listings2[1].id,
      },
    ],
  });

  // Create favorites
  await db.favorite.createMany({
    data: [
      { userId: tenant1.id, listingId: listings1[2].id },
      { userId: tenant1.id, listingId: listings1[4].id },
      { userId: tenant1.id, listingId: listings2[0].id },
      { userId: tenant2.id, listingId: listings2[2].id },
    ],
  });

  // Create messages
  await db.message.createMany({
    data: [
      {
        content: 'Bonjour, votre chambre à Tokoin est-elle encore disponible ?',
        senderId: tenant1.id,
        receiverId: landlord1.id,
        listingId: listings1[0].id,
        read: true,
      },
      {
        content: 'Oui, elle est disponible. Vous pouvez venir la visiter demain entre 10h et 16h.',
        senderId: landlord1.id,
        receiverId: tenant1.id,
        listingId: listings1[0].id,
        read: true,
      },
      {
        content: 'Merci beaucoup ! Je serai là à 11h.',
        senderId: tenant1.id,
        receiverId: landlord1.id,
        listingId: listings1[0].id,
        read: true,
      },
      {
        content: 'Bonjour, je suis intéressé par votre studio à Sokodé. Quel est le mode de paiement accepté ?',
        senderId: tenant2.id,
        receiverId: landlord2.id,
        listingId: listings2[1].id,
        read: false,
      },
      {
        content: 'Bonjour ! Nous acceptons le paiement par Mobile Money (Moov Money, T-Money) et par virement bancaire.',
        senderId: landlord2.id,
        receiverId: tenant2.id,
        listingId: listings2[1].id,
        read: false,
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log(`Created ${4} users, ${allListings.length} listings, 3 bookings, 4 favorites, 5 messages`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
