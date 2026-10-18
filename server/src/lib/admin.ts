export function isAdmin(user: { email: string } | null | undefined): boolean {
  if (!user?.email) return false;
  const raw = process.env.ADMIN_EMAILS || '';
  const emails = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return emails.includes(user.email.toLowerCase());
}
