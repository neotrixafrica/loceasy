import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { messageSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get('partnerId');
    const userId = currentUser.id;

    if (partnerId) {
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mark as read
      await db.message.updateMany({
        where: {
          senderId: partnerId,
          receiverId: userId,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json(messages);
    }

    // Get conversations for a user
    const messages = await db.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation
    const conversations = new Map<string, (typeof messages)[number][]>();
    for (const msg of messages) {
      const key = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(key)) {
        conversations.set(key, []);
      }
      conversations.get(key)!.push(msg);
    }

    const conversationList = Array.from(conversations.entries()).map(
      ([partnerId, msgs]) => ({
        partnerId,
        partnerName:
          msgs[0].senderId === userId
            ? msgs[0].receiver.name
            : msgs[0].sender.name,
        partnerAvatar:
          msgs[0].senderId === userId
            ? msgs[0].receiver.avatar
            : msgs[0].sender.avatar,
        lastMessage: msgs[0],
        unread: msgs.filter((m) => !m.read && m.receiverId === userId).length,
      })
    );

    return NextResponse.json(conversationList);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { content, receiverId, listingId } = parsed.data;

    const message = await db.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId,
        listingId: listingId || null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
