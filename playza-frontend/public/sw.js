/*
  Playza Service Worker
  Handles background push notifications and notification clicks.
*/

self.addEventListener('push', function(event) {
  if (event.data) {
    const payload = event.data.json();
    
    const options = {
      body: payload.body,
      icon: '/logo192.png', // Fallback icon
      badge: '/badge.png',  // Small monochrome icon for status bar
      image: payload.image,
      data: payload.data,
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Open Playza' },
        { action: 'close', title: 'Close' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
