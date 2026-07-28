import { prisma } from '@/lib/db';
import {
  AdminChatInbox,
  type AdminChatConversation,
} from '@/components/AdminChatInbox';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Receptionist chats' };

export default async function AdminChatPage() {
  const rows = await prisma.chatConversation
    .findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      take: 200,
    })
    .catch((err) => {
      console.error('[admin.chats]', err);
      return [];
    });

  const conversations: AdminChatConversation[] = rows.map((conversation) => ({
    id: conversation.id,
    visitorName: conversation.visitorName,
    email: conversation.email,
    phone: conversation.phone,
    status: conversation.status,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    })),
  }));

  return <AdminChatInbox conversations={conversations} />;
}
