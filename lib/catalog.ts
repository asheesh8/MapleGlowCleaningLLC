import { prisma } from './db';
import {
  addOns as defaultAddOns,
  services as defaultServices,
  type AddOn,
  type Service,
} from './content';
import type { CatalogAddOn, CatalogService, PublicCatalog } from './catalog-types';

type ServiceRow = {
  id: string;
  name: string;
  short: string;
  description: string;
  includes: string;
  base: number;
  icon: string;
  order: number;
  active: boolean;
};

type AddOnRow = {
  id: string;
  name: string;
  price: number;
  order: number;
  active: boolean;
};

const defaultCatalogServices: CatalogService[] = defaultServices.map((service, index) => ({
  ...service,
  order: index,
  active: true,
}));

const defaultCatalogAddOns: CatalogAddOn[] = defaultAddOns.map((addOn, index) => ({
  ...addOn,
  order: index,
  active: true,
}));

export function parseIncludes(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Older/manual records can still be newline-separated.
  }

  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeIncludes(includes: string[]): string {
  return JSON.stringify(includes.map((item) => item.trim()).filter(Boolean));
}

export function mapCleaningService(row: ServiceRow): CatalogService {
  return {
    id: row.id,
    name: row.name,
    short: row.short,
    description: row.description,
    includes: parseIncludes(row.includes),
    base: row.base,
    icon: row.icon,
    order: row.order,
    active: row.active,
  };
}

export function mapCleaningAddOn(row: AddOnRow): CatalogAddOn {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    order: row.order,
    active: row.active,
  };
}

function toServiceCreate(service: Service, order: number) {
  return {
    id: service.id,
    name: service.name,
    short: service.short,
    description: service.description,
    includes: serializeIncludes(service.includes),
    base: service.base,
    icon: service.icon,
    order,
    active: true,
  };
}

function toAddOnCreate(addOn: AddOn, order: number) {
  return {
    id: addOn.id,
    name: addOn.name,
    price: addOn.price,
    order,
    active: true,
  };
}

export async function ensureCatalogSeeded() {
  const [serviceCount, addOnCount] = await Promise.all([
    prisma.cleaningService.count(),
    prisma.cleaningAddOn.count(),
  ]);

  if (serviceCount === 0) {
    await prisma.cleaningService.createMany({
      data: defaultServices.map(toServiceCreate),
    });
  }

  if (addOnCount === 0) {
    await prisma.cleaningAddOn.createMany({
      data: defaultAddOns.map(toAddOnCreate),
    });
  }
}

export async function getActiveCatalog(): Promise<PublicCatalog> {
  try {
    const [services, addOns, serviceCount, addOnCount] = await Promise.all([
      prisma.cleaningService.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
      prisma.cleaningAddOn.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
      prisma.cleaningService.count(),
      prisma.cleaningAddOn.count(),
    ]);

    return {
      services: serviceCount > 0 ? services.map(mapCleaningService) : defaultCatalogServices,
      addOns: addOnCount > 0 ? addOns.map(mapCleaningAddOn) : defaultCatalogAddOns,
    };
  } catch {
    return {
      services: defaultCatalogServices,
      addOns: defaultCatalogAddOns,
    };
  }
}

export async function getAdminCatalog(): Promise<PublicCatalog> {
  try {
    await ensureCatalogSeeded();

    const [services, addOns] = await Promise.all([
      prisma.cleaningService.findMany({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
      prisma.cleaningAddOn.findMany({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
    ]);

    return {
      services: services.map(mapCleaningService),
      addOns: addOns.map(mapCleaningAddOn),
    };
  } catch {
    return {
      services: defaultCatalogServices,
      addOns: defaultCatalogAddOns,
    };
  }
}

export function slugifyCatalogId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  return slug || 'service';
}

export async function uniqueServiceId(name: string): Promise<string> {
  const base = slugifyCatalogId(name);
  let candidate = base;
  let suffix = 2;

  while (await prisma.cleaningService.findUnique({ where: { id: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function uniqueAddOnId(name: string): Promise<string> {
  const base = slugifyCatalogId(name);
  let candidate = base;
  let suffix = 2;

  while (await prisma.cleaningAddOn.findUnique({ where: { id: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
