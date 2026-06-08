// location.js - Lấy IP và thông tin vị trí

const LocationInfo = {
    async getLocationData() {
        for (const api of LOCATION_APIS) {
            try {
                console.log(`🔄 Đang thử API: ${api}`);
                const response = await fetch(api, { mode: 'cors' });
                const data = await response.json();
                
                // API ipwho.is
                if (data.success !== false && data.ip) {
                    return this._formatResult({
                        ip: data.ip,
                        isp: data.connection?.isp || data.isp || 'Không xác định',
                        country: data.country || 'Không xác định',
                        city: data.city || 'Không xác định',
                        region: data.region || 'Không xác định',
                        lat: data.latitude,
                        lon: data.longitude
                    }, 'ipwho.is');
                }
                
                // API ipapi.co
                if (data.ip) {
                    return this._formatResult({
                        ip: data.ip,
                        isp: data.org || data.asn || 'Không xác định',
                        country: data.country_name || 'Không xác định',
                        city: data.city || 'Không xác định',
                        region: data.region || 'Không xác định',
                        lat: data.latitude,
                        lon: data.longitude
                    }, 'ipapi.co');
                }
                
                // API freeipapi
                if (data.ipAddress) {
                    return this._formatResult({
                        ip: data.ipAddress,
                        isp: data.isp || 'Không xác định',
                        country: data.country || 'Không xác định',
                        city: data.city || 'Không xác định',
                        region: data.region || 'Không xác định',
                        lat: data.latitude,
                        lon: data.longitude
                    }, 'freeipapi');
                }
                
                // API ip-api.com
                if (data.status === 'success') {
                    return this._formatResult({
                        ip: data.query,
                        isp: data.isp || 'Không xác định',
                        country: data.country || 'Không xác định',
                        city: data.city || 'Không xác định',
                        region: data.regionName || 'Không xác định',
                        lat: data.lat,
                        lon: data.lon
                    }, 'ip-api.com');
                }
                
            } catch(e) {
                console.log(`❌ API ${api} thất bại:`, e.message);
            }
        }
        
        // Fallback: chỉ lấy IP từ ipify
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            if (data.ip) {
                return this._formatResult({
                    ip: data.ip,
                    isp: 'Không xác định',
                    country: 'Không xác định',
                    city: 'Không xác định',
                    region: 'Không xác định',
                    lat: null,
                    lon: null
                }, 'ipify (fallback)');
            }
        } catch(e) {}
        
        return this._getEmptyResult();
    },
    
    _formatResult(raw, source) {
        const hasLocation = raw.lat && raw.lon && raw.lat !== 'Không xác định';
        const location = [raw.city, raw.region, raw.country]
            .filter(f => f && f !== 'Không xác định')
            .join(', ') || 'Không xác định';
        
        console.log(`✅ Lấy thành công từ ${source}`);
        
        return {
            ip: raw.ip,
            isp: raw.isp,
            country: raw.country,
            city: raw.city,
            region: raw.region,
            lat: raw.lat || 'Không xác định',
            lon: raw.lon || 'Không xác định',
            location: location,
            maps: hasLocation ? `https://www.google.com/maps?q=${raw.lat},${raw.lon}` : '',
            source: source
        };
    },
    
    _getEmptyResult() {
        return {
            ip: 'Không xác định',
            isp: 'Không xác định',
            country: 'Không xác định',
            city: 'Không xác định',
            region: 'Không xác định',
            lat: 'Không xác định',
            lon: 'Không xác định',
            location: 'Không xác định',
            maps: '',
            source: 'none'
        };
    }
};
