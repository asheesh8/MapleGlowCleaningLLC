import { services, addOns, frequencies, type ServiceId } from './content';

export interface QuoteInput {
  serviceType: ServiceId;
  bedrooms: number;
  bathrooms: number;
  frequency: string;
  addOns: string[];
}

export interface Quote {
  low: number;
  high: number;
  breakdown: { label: string; amount: number }[];
  savings: number;
}

/**
 * Transparent estimate model. Deliberately returns a *range* — the real number
 * depends on condition, which Katie confirms after seeing the photos.
 */
export function calculateQuote(input: QuoteInput): Quote {
  const service = services.find((s) => s.id === input.serviceType) ?? services[0];
  const breakdown: { label: string; amount: number }[] = [];

  const base = service.base;
  breakdown.push({ label: `${service.name} base`, amount: base });

  const bedroomCharge = Math.max(0, input.bedrooms - 1) * 25;
  if (bedroomCharge > 0) {
    breakdown.push({
      label: `${input.bedrooms - 1} extra bedroom${input.bedrooms - 1 > 1 ? 's' : ''}`,
      amount: bedroomCharge,
    });
  }

  const bathroomCharge = Math.max(0, input.bathrooms - 1) * 30;
  if (bathroomCharge > 0) {
    breakdown.push({
      label: `${input.bathrooms - 1} extra bathroom${input.bathrooms - 1 > 1 ? 's' : ''}`,
      amount: bathroomCharge,
    });
  }

  const addOnTotal = input.addOns.reduce((sum, id) => {
    const addOn = addOns.find((a) => a.id === id);
    if (addOn) {
      breakdown.push({ label: addOn.name, amount: addOn.price });
      return sum + addOn.price;
    }
    return sum;
  }, 0);

  const subtotal = base + bedroomCharge + bathroomCharge + addOnTotal;

  const freq = frequencies.find((f) => f.id === input.frequency) ?? frequencies[0];
  const savings = Math.round(subtotal * freq.discount);
  const adjusted = subtotal - savings;

  // ±12% range to reflect unknown condition
  return {
    low: Math.max(60, Math.round((adjusted * 0.94) / 5) * 5),
    high: Math.round((adjusted * 1.12) / 5) * 5,
    breakdown,
    savings,
  };
}

export function formatMoney(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}
