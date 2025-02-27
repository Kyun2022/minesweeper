/* eslint-disable no-restricted-globals */

// このサービスワーカーは、Create React Appによって生成されたものを基にしています
// 詳細については、https://cra.link/PWAを参照してください

const CACHE_NAME = 'minesweeper-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.*.js',
  '/static/css/main.*.css',
  '/manifest.json',
  '/favicon.ico'
];

// インストール中にリソースをキャッシュする
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// キャッシュからリソースを取得する
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュが見つかった場合はそれを返す
        if (response) {
          return response;
        }

        // キャッシュが見つからない場合はネットワークからフェッチする
        return fetch(event.request)
          .then((response) => {
            // 有効なレスポンスかどうかを確認する
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存する
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// 古いキャッシュをクリーンアップする
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});
