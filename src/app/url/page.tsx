'use client';

import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export default function Home() {
  const [_, setPermission] = useState<string>('default');
  const [subJson, setSubJson] = useState<string>('');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setPermission(Notification.permission);
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  const setupNotification = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setSubJson(JSON.stringify(subscription, null, 2));
    }
  };

  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-semibold mb-2">開発者の端末登録</h2>
        <button onClick={setupNotification} className="bg-blue-500 text-white p-2 rounded w-full">
          URLを取得
        </button>
        {subJson && (
          <textarea
            readOnly
            value={subJson}
            className="w-full h-32 text-xs mt-2 p-1 border bg-white"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        )}
      </div>
    </main>
  );
}

// VAPID鍵の変換に必要な補助関数
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}