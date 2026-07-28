import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedTestimonials } from '../lib/content';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'propsk28@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Katie Proper';

  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set in .env — cannot seed admin user.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });
  console.log(`✓ admin user ready: ${email}`);

  for (const t of seedTestimonials) {
    const exists = await prisma.testimonial.findFirst({
      where: { author: t.author, body: t.body },
    });
    if (!exists) await prisma.testimonial.create({ data: t });
  }
  console.log(`✓ ${seedTestimonials.length} testimonial(s) ready`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
