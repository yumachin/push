'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [_, setPermission] = useState<string>('default');
  const [inputMessage, setInputMessage] = useState<string>('');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setPermission(Notification.permission);
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  const sendMessageToDeveloper = async () => {
    await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputMessage }),
    });
    alert('開発者のスマホへ通知を送信しました！');
  };

  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <div className="border p-4 rounded bg-white space-y-3">
        <input
          type="text"
          placeholder="追加してほしい機能や改善点を書いてください"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="border w-full p-2 rounded"
        />
        <button onClick={sendMessageToDeveloper} className="bg-emerald-500 text-white p-3 rounded w-full font-bold">
          送信する
        </button>
      </div>
    </main>
  );
}