import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { db } from './db';
import { publicUserSelect } from './user';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return db.user.findUnique({
    where: { id: payload.userId },
    select: publicUserSelect,
  });
}
