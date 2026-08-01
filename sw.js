const CACHE_NAME = 'stockpro-v3'; // อัปเดตเวอร์ชันเป็น v3 เพื่อบังคับล้างของเก่า

// บังคับให้ติดตั้งและใช้งานตัวใหม่ทันที ไม่ต้องรอ
self.addEventListener('install', event => {
  self.skipWaiting(); 
});

// ไล่ลบ Cache เก่าที่พังๆ ทิ้งให้หมด
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('ล้าง Cache เก่า: ', key);
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // ข้ามการ Cache ข้อมูล API จาก Google
  if (event.request.url.includes('script.google.com') || 
      event.request.url.includes('script.googleusercontent.com')) {
    return;
  }

  // ใช้สูตร Network First: พยายามดึงไฟล์อัปเดตจากเน็ตก่อนเสมอ 
  // แต่ถ้าเน็ตหลุด ค่อยเอาไฟล์จากในเครื่อง (Cache) มาแสดง
  event.respondWith(
    fetch(event.request).then(response => {
      // ดึงสำเร็จ -> เอาไปเซฟเก็บไว้เผื่อเน็ตหลุดรอบหน้า
      return caches.open(CACHE_NAME).then(cache => {
        if (event.request.method === 'GET' && !event.request.url.includes('cdn')) {
          cache.put(event.request, response.clone());
        }
        return response;
      });
    }).catch(() => {
      // ถ้าไม่มีเน็ตจริงๆ ค่อยควักของเก่าในแคชมาโชว์
      return caches.match(event.request);
    })
  );
});
