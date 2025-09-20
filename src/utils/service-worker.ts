export function registerServiceWorker() {

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").then(
        function (registration) {
          console.log(
            "Service Worker registration successful with scope: ",
            registration.scope
          );

          // Define the service worker behavior
          registration.active?.postMessage({
            type: "INITIALIZE",
            payload: {
              fetchHandler: `
                                    self.addEventListener('fetch', (event) => {
                                        if (!navigator.onLine) {
                                            // Handle offline scenario
                                            event.respondWith(
                                                caches.match(event.request).then((response) => {
                                                    return response || fetch(event.request);
                                                })
                                            );
                                        }
                                    });
                                `,
              onlineHandler: `
                                    self.addEventListener('online', () => {
                                        self.clients.matchAll().then((clients) => {
                                            clients.forEach((client) => {
                                                client.postMessage({ type: 'CONNECTION_CHANGE', online: true });
                                            });
                                        });
                                    });
                                `,
              offlineHandler: `
                                    self.addEventListener('offline', () => {
                                        self.clients.matchAll().then((clients) => {
                                            clients.forEach((client) => {
                                                client.postMessage({ type: 'CONNECTION_CHANGE', online: false });
                                            });
                                        });
                                    });
                                `,
            },
          });
        },
        function (err) {
          console.log("Service Worker registration failed: ", err);
        }
      );
    });
  }
}
