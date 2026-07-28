import { prisma } from '@/lib/db';
import { ReviewsManager, type AdminReview } from '@/components/ReviewsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviews' };

export default async function AdminReviewsPage() {
  const rows = await prisma.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  const reviews: AdminReview[] = rows.map((r) => ({
    id: r.id,
    author: r.author,
    body: r.body,
    source: r.source,
    featured: r.featured,
    order: r.order,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ReviewsManager reviews={reviews} />;
}
