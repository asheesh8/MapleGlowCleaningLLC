import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  // Same generic message for every failure mode — don't reveal which
  // emails exist.
  const deny = () =>
    NextResponse.json(
      { error: 'That email and password combination did not work.' },
      { status: 401 }
    );

  if (!parsed.success) return deny();

  const user = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    // Burn a comparable amount of time even when the user is missing.
    await bcrypt.compare(parsed.data.password, '$2a$12$invalidsaltinvalidsaltxx');
    return deny();
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return deny();

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, name: user.name });
}
