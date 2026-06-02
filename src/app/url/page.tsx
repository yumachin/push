'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalonePWA(): boolean {
  return (
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

export default function Home() {
  const [permission, setPermission] = useState<string>('default');
  const [subJson, setSubJson] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsHomeScreenInstall, setNeedsHomeScreenInstall] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      setErrorMessage('このブラウザは Web Push に対応していません。');
      return;
    }

    setPermission(Notification.permission);
    navigator.serviceWorker.register('/sw.js').catch(() => {
      setErrorMessage('Service Worker の登録に失敗しました。HTTPS で開いているか確認してください。');
    });

    if (isIOS() && !isStandalonePWA()) {
      setNeedsHomeScreenInstall(true);
    }
  }, []);

  const setupNotification = async () => {
    setErrorMessage('');
    setStatusMessage('');
    setIsLoading(true);

    try {
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        throw new Error('このブラウザは Web Push に対応していません。');
      }

      if (isIOS() && !isStandalonePWA()) {
        throw new Error(
          'iPhone では Safari の「共有」→「ホーム画面に追加」したあと、ホーム画面のアイコンから開いてください。通常の Safari タブでは Push は使えません。'
        );
      }

      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID 公開鍵 (NEXT_PUBLIC_VAPID_PUBLIC_KEY) が設定されていません。');
      }

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }
      await navigator.serviceWorker.ready;

      if (!registration.pushManager) {
        throw new Error(
          'PushManager が利用できません。iPhone の場合はホーム画面に追加した PWA として開いているか確認してください。'
        );
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setStatusMessage('通知が許可されませんでした。設定アプリから通知を許可してください。');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSubJson(JSON.stringify(subscription, null, 2));
      setStatusMessage('登録完了。下の JSON を .env.local の MOBILE_SUBSCRIPTION に設定してください。');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '登録に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <div className="border p-4 rounded bg-gray-50 space-y-3">
        <h2 className="font-semibold">開発者の端末登録</h2>

        {needsHomeScreenInstall && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">iPhone 向けの手順</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Safari でこのページを開く</li>
              <li>共有ボタン →「ホーム画面に追加」</li>
              <li>ホーム画面のアイコンからアプリを起動する</li>
              <li>再度「URLを取得」を押す</li>
            </ol>
          </div>
        )}

        <p className="text-sm text-gray-600">通知の許可状態: {permission}</p>

        <button
          type="button"
          onClick={setupNotification}
          disabled={isLoading}
          className="bg-blue-500 text-white p-2 rounded w-full disabled:opacity-50"
        >
          {isLoading ? '処理中...' : 'URLを取得'}
        </button>

        {statusMessage && <p className="text-sm text-green-700">{statusMessage}</p>}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        {subJson && (
          <textarea
            readOnly
            value={subJson}
            className="w-full h-32 text-xs mt-2 p-1 border bg-white"
            onClick={(event) => (event.target as HTMLTextAreaElement).select()}
          />
        )}
      </div>
      <Link href="/">ホーム</Link>
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