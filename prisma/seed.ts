import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addOns, seedTestimonials, services } from '../lib/content';

const prisma = new PrismaClient();

const serializeIncludes = (includes: string[]) =>
  JSON.stringify(includes.map((item) => item.trim()).filter(Boolean));

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

  for (const [order, service] of services.entries()) {
    await prisma.cleaningService.upsert({
      where: { id: service.id },
      update: {},
      create: {
        id: service.id,
        name: service.name,
        short: service.short,
        description: service.description,
        includes: serializeIncludes(service.includes),
        base: service.base,
        icon: service.icon,
        order,
        active: true,
      },
    });
  }
  console.log(`✓ ${services.length} service(s) ready`);

  for (const [order, addOn] of addOns.entries()) {
    await prisma.cleaningAddOn.upsert({
      where: { id: addOn.id },
      update: {},
      create: {
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
        order,
        active: true,
      },
    });
  }
  console.log(`✓ ${addOns.length} add-on(s) ready`);

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
