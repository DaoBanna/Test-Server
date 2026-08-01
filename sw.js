const CACHE_NAME = 'stockpro-v4';

// บังคับให้ติดตั้งและใช้งานตัวใหม่ทันที
self.addEventListener('install', event => {
  self.skipWaiting(); 
});

// ไล่ลบ Cache เก่าที่พังๆ ทิ้งให้หมด
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // 1. เมินไฟล์ API จาก Google และ CDN ต่างๆ ให้ปล่อยผ่านไปเลย ไม่ต้องเซฟ
  if (event.request.url.includes('script.google.com') || 
      event.request.url.includes('script.googleusercontent.com') ||
      event.request.url.includes('cdn.')) {
    return; 
  }

  // 2. [แก้บั๊กสำคัญ] อนุญาตให้เซฟลงเครื่องเฉพาะไฟล์ที่เป็น HTTP/HTTPS และเป็นการดึงข้อมูล (GET) เท่านั้น
  // ป้องกันบั๊ก 'chrome-extension' is unsupported
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // 3. กฎ Network First: พยายามดึงไฟล์จากเน็ตก่อน ถ้าเน็ตล่มค่อยควักของเก่ามาโชว์
  event.respondWith(
    fetch(event.request).then(response => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
