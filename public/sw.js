// バックグラウンドで通知を受け取ったときの処理
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: '通知', body: '新着メッセージがあります' };

  const options = {
    body: data.body,
    icon: '/next.svg',
    badge: '/next.svg',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知センターの通知をクリックしたときの処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
