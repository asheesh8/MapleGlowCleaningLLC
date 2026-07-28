import { AdminShell } from '@/components/AdminShell';
import { getSession } from '@/lib/auth';

export const metadata = { title: { default: 'Admin', template: '%s · Admin' } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // The login page renders inside this layout too, before a session exists.
  if (!session) return <>{children}</>;

  return <AdminShell adminName={session.name}>{children}</AdminShell>;
}
