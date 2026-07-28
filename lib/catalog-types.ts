import type { AddOn, Service } from './content';

export interface CatalogService extends Service {
  order: number;
  active: boolean;
}

export interface CatalogAddOn extends AddOn {
  order: number;
  active: boolean;
}

export interface PublicCatalog {
  services: CatalogService[];
  addOns: CatalogAddOn[];
}
