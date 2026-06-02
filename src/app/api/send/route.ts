import { NextResponse } from 'next/server';
import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateKey = process.env.VAPID_PRIVATE_KEY || '';

webpush.setVapidDetails(
  'mailto:your-email@example.com', // メルアド
  publicKey,
  privateKey
);

const subPCEnv = process.env.PC_SUBSCRIPTION;
const subMOBILEEnv = process.env.MOBILE_SUBSCRIPTION;
const PC_SUBSCRIPTION = subPCEnv ? JSON.parse(subPCEnv) : null;
const MOBILE_SUBSCRIPTION = subMOBILEEnv ? JSON.parse(subMOBILEEnv) : null;

const TARGET_SUBSCRIPTIONS = [PC_SUBSCRIPTION, MOBILE_SUBSCRIPTION];

export async function POST(request: Request) {
  const { message } = await request.json();

	const uniqueTag = `msg-${Date.now()}`;

  try {
    await Promise.all(
      TARGET_SUBSCRIPTIONS.map((sub) =>
        webpush.sendNotification(
          sub,
          JSON.stringify({
            title: 'ユーザーからの通知',
            body: message || 'ボタンが押されました！',
						tag: uniqueTag,
          })
        )
      )
		);
		
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push送信失敗:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}