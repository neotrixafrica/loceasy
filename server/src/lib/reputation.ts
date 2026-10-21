import { db } from './db';

interface ReputationMetrics {
  totalListings: number;
  totalBookings: number;
  completedBookings: number;
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  responseTime: number;
  trustScore: number;
  badge: string;
}

/**
 * Calculate reputation metrics for a user
 */
export async function calculateUserReputation(userId: string): Promise<ReputationMetrics> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      listings: {
        select: { id: true, bookings: { select: { status: true } } },
      },
      bookings: {
        select: { status: true },
      },
      reviews: {
        select: { rating: true },
      },
      sentMessages: {
        select: { createdAt: true },
      },
      receivedMessages: {
        select: { createdAt: true, read: true },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate basic counts
  const totalListings = user.listings.length;
  const totalBookings = user.bookings.length;
  const completedBookings = user.bookings.filter(b => b.status === 'accepted').length;
  const totalReviews = user.reviews.length;

  // Calculate average rating
  const averageRating = totalReviews > 0
    ? user.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // Calculate response rate (messages read / messages received)
  const receivedMessages = user.receivedMessages.length;
  const readMessages = user.receivedMessages.filter(m => m.read).length;
  const responseRate = receivedMessages > 0 ? (readMessages / receivedMessages) * 100 : 0;

  // Calculate response time (average time to read messages)
  const responseTime = receivedMessages > 0 ? 24 : 0; // Default to 24 hours

  // Calculate trust score (0-100)
  let trustScore = 0;

  // Base score from verifications
  if (user.phoneVerified) trustScore += 20;
  if (user.verificationStatus === 'verified') trustScore += 30;

  // Score from activity
  trustScore += Math.min(totalListings * 5, 20); // Max 20 from listings
  trustScore += Math.min(completedBookings * 3, 15); // Max 15 from completed bookings
  trustScore += Math.min(averageRating * 10, 15); // Max 15 from rating

  // Score from responsiveness
  trustScore += Math.min(responseRate * 0.1, 10); // Max 10 from response rate

  // Cap at 100
  trustScore = Math.min(trustScore, 100);

  // Determine badge
  let badge = 'Débutant';
  if (trustScore >= 90) badge = 'Légendaire';
  else if (trustScore >= 75) badge = 'Expert';
  else if (trustScore >= 60) badge = 'Fiable';
  else if (trustScore >= 40) badge = 'Confirmé';
  else if (trustScore >= 20) badge = 'En progression';

  return {
    totalListings,
    totalBookings,
    completedBookings,
    totalReviews,
    averageRating,
    responseRate,
    responseTime,
    trustScore,
    badge,
  };
}

/**
 * Update user reputation metrics in database
 */
export async function updateUserReputation(userId: string): Promise<void> {
  const metrics = await calculateUserReputation(userId);

  await db.user.update({
    where: { id: userId },
    data: {
      totalListings: metrics.totalListings,
      totalBookings: metrics.totalBookings,
      completedBookings: metrics.completedBookings,
      totalReviews: metrics.totalReviews,
      averageRating: metrics.averageRating,
      responseRate: metrics.responseRate,
      responseTime: metrics.responseTime,
      trustScore: metrics.trustScore,
      badge: metrics.badge,
      lastActiveAt: new Date(),
    },
  });
}

/**
 * Update reputation for all users (cron job)
 */
export async function updateAllUsersReputation(): Promise<void> {
  const users = await db.user.findMany({
    select: { id: true },
  });

  for (const user of users) {
    try {
      await updateUserReputation(user.id);
    } catch (error) {
      console.error(`Failed to update reputation for user ${user.id}:`, error);
    }
  }
}
