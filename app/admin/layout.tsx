import { AdminShell } from '@/components/AdminShell';

export const metadata = { title: { default: 'Admin', template: '%s · Admin' } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell adminName="Katie Proper">{children}</AdminShell>;
}
