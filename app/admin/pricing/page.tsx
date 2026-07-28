import { getAdminCatalog } from '@/lib/catalog';
import { PricingManager } from '@/components/PricingManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pricing' };

export default async function AdminPricingPage() {
  const catalog = await getAdminCatalog();

  return (
    <PricingManager
      initialServices={catalog.services}
      initialAddOns={catalog.addOns}
    />
  );
}
