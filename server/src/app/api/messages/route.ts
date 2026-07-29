import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');
    const userId = searchParams.get('userId');

    // Get conversations for a user (latest message per conversation partner)
    if (userId) {
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
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const key = partnerId;
        if (!conversations.has(key)) {
          conversations.set(key, []);
        }
        conversations.get(key)!.push(msg);
      }

      // Get latest message per conversation
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
    }

    // Get specific conversation messages
    if (senderId && receiverId) {
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
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
          senderId: receiverId,
          receiverId: senderId,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json(messages);
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, senderId, receiverId, listingId } = body;

    if (!content || !senderId || !receiverId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        content,
        senderId,
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
