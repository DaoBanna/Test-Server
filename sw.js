const CACHE_NAME = 'stockpro-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap'
];

// ตอนติดตั้งแอป ให้โหลดไฟล์พื้นฐานเก็บไว้ในเครื่อง
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ดักจับการเชื่อมต่อ
self.addEventListener('fetch', event => {
  // ข้ามการ Cache ถ้าเป็นการดึงข้อมูล API จาก Google Apps Script (เพื่อให้ได้ข้อมูลล่าสุดเสมอ)
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  // สำหรับไฟล์อื่นๆ (หน้าเว็บ, ดีไซน์) ให้ดึงจากที่ Cache ไว้ในเครื่องก่อน จะได้เปิดแอปไวๆ
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; 
        }
        return fetch(event.request);
      })
  );
});

// ล้าง Cache เก่าทิ้งเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
