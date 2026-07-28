import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { chatConversationPatchSchema } from '@/lib/validation';

export const runtime = 'nodejs';

/** Admin only: update a receptionist conversation status. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = chatConversationPatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  try {
    const conversation = await prisma.chatConversation.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json({
      ok: true,
      conversation: {
        ...conversation,
        updatedAt: conversation.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }
}
