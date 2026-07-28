import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateReceptionistReply } from '@/lib/receptionist';
import { chatMessageSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function cleanOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function nextStatus(current?: string) {
  if (!current || current === 'closed' || current === 'archived') return 'new';
  return current;
}

/** Public: save a receptionist chat message and return a placeholder reply. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please check your message.',
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const visitorName = cleanOptional(data.visitorName);
  const email = cleanOptional(data.email);
  const phone = cleanOptional(data.phone);

  try {
    let conversation = data.conversationId
      ? await prisma.chatConversation.findUnique({
          where: { id: data.conversationId },
        })
      : null;

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          visitorName,
          email,
          phone,
          status: 'new',
        },
      });
    } else {
      conversation = await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: {
          visitorName: visitorName ?? conversation.visitorName,
          email: email ?? conversation.email,
          phone: phone ?? conversation.phone,
          status: nextStatus(conversation.status),
        },
      });
    }

    const reply = await generateReceptionistReply({
      message: data.message,
      visitorName,
    });

    const [visitorMessage, assistantMessage] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'visitor',
          body: data.message,
        },
      }),
      prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          body: reply,
        },
      }),
      prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { status: nextStatus(conversation.status) },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      conversationId: conversation.id,
      messages: [
        {
          id: visitorMessage.id,
          role: visitorMessage.role,
          body: visitorMessage.body,
          createdAt: visitorMessage.createdAt.toISOString(),
        },
        {
          id: assistantMessage.id,
          role: assistantMessage.role,
          body: assistantMessage.body,
          createdAt: assistantMessage.createdAt.toISOString(),
        },
      ],
    });
  } catch (err) {
    console.error('[chat.POST]', err);
    return NextResponse.json(
      { error: 'Could not save that message right now.' },
      { status: 500 }
    );
  }
}
