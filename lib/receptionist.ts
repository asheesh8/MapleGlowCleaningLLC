import { business } from './content';

export interface ReceptionistInput {
  message: string;
  visitorName?: string | null;
}

/**
 * Agent integration point.
 *
 * Replace this fallback with your Supabase/agent call when you are ready.
 * Keep the return shape as plain text and the existing chat UI/admin inbox can
 * stay unchanged.
 */
export async function generateReceptionistReply({
  message,
  visitorName,
}: ReceptionistInput): Promise<string> {
  const lower = message.toLowerCase();
  const greeting = visitorName ? `${visitorName}, ` : '';

  if (/(price|pricing|cost|quote|estimate)/.test(lower)) {
    return `${greeting}the fastest way to price this is the instant estimate form. Share the service, bedroom/bathroom count, and any problem areas here too, and Katie can tighten the number when she follows up.`;
  }

  if (/(available|availability|schedule|book|appointment|tomorrow|weekend)/.test(lower)) {
    return `${greeting}Katie confirms every appointment personally. Send the town, preferred day, and morning/afternoon preference, and she can follow up with the closest opening.`;
  }

  if (/(phone|call|text|number|contact)/.test(lower)) {
    return `${greeting}you can call or text Katie at ${business.phone.replace('+1 ', '')}. If you leave your number here, this conversation will also show up in her admin inbox.`;
  }

  return `${greeting}thanks, I saved this for Katie. If you can, include the service you need, your town, and the best way to reach you so she has everything in one place.`;
}
