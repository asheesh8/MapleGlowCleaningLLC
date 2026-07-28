import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ChatWidget } from '@/components/ChatWidget';
import { getActiveCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const catalog = await getActiveCatalog();

  return (
    <>
      <Nav />
      <main className="pt-20">{children}</main>
      <Footer services={catalog.services} />
      <ChatWidget />
    </>
  );
}
