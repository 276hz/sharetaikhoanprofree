// device.js - Lấy thông tin thiết bị và trình duyệt

const DeviceInfo = {
    getInfo() {
        const ua = navigator.userAgent;
        const platform = navigator.platform;
        
        let device = 'Không xác định';
        let os = 'Không xác định';
        let browser = 'Không xác định';
        
        // Xác định OS
        if (/iPhone|iPad|iPod/i.test(ua)) {
            os = 'iOS';
            device = /iPad/i.test(ua) ? 'iPad' : 'iPhone';
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
        } else if (ua.includes('Linux')) {
            os = 'Linux';
            device = 'PC/Laptop';
        }
        
        // Xác định trình duyệt
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';
        
        return {
            device,
            os,
            browser,
            userAgent: ua,
            language: navigator.language,
            screenSize: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    },
    
    getBattery() {
        if (!navigator.getBattery) return Promise.resolve(null);
        return navigator.getBattery().then(battery => ({
            level: Math.round(battery.level * 100) + '%',
            charging: battery.charging
        })).catch(() => null);
    }
};
