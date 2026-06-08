// camera.js - Xử lý camera và chụp ảnh

const CameraManager = {
    stream: null,
    videoElement: null,
    
    init(videoElement) {
        this.videoElement = videoElement;
    },
    
    async requestCamera(facingMode = 'user') {
        if (!navigator.mediaDevices?.getUserMedia) {
            console.error('❌ getUserMedia không được hỗ trợ');
            return null;
        }
        
        try {
            if (this.stream) {
                this.stopCamera();
            }
            
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: facingMode } },
                audio: false
            });
            
            if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                this.videoElement.style.display = 'block';
                await this.videoElement.play();
            }
            
            console.log(`✅ Camera ${facingMode === 'user' ? 'trước' : 'sau'} đã sẵn sàng`);
            return this.stream;
            
        } catch(e) {
            // Fallback: thử không yêu cầu exact
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facingMode },
                    audio: false
                });
                
                if (this.videoElement) {
                    this.videoElement.srcObject = this.stream;
                    this.videoElement.style.display = 'block';
                    await this.videoElement.play();
                }
                
                return this.stream;
            } catch(e2) {
                console.error(`❌ Không thể mở camera ${facingMode}:`, e2);
                return null;
            }
        }
    },
    
    async capturePhoto() {
        if (!this.videoElement || !this.stream) {
            console.error('❌ Camera chưa được khởi tạo');
            return null;
        }
        
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = this.videoElement.videoWidth;
            canvas.height = this.videoElement.videoHeight;
            
            if (canvas.width === 0 || canvas.height === 0) {
                resolve(null);
                return;
            }
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this.videoElement, 0, 0);
            
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
        });
    },
    
    async captureBoth() {
        const frontPhoto = await this.capturePhoto();
        
        // Chụp ảnh sau (nếu có)
        let backPhoto = null;
        if (this.stream) {
            const tracks = this.stream.getVideoTracks();
            const hasBackCamera = tracks.some(track => {
                const settings = track.getSettings();
                return settings.facingMode === 'environment';
            });
            
            if (hasBackCamera) {
                // Lưu stream hiện tại
                const currentStream = this.stream;
                const currentVideo = this.videoElement;
                
                // Chụp camera sau
                const backStream = await this.requestCamera('environment');
                if (backStream) {
                    await new Promise(r => setTimeout(r, 500));
                    backPhoto = await this.capturePhoto();
                    this.stopCamera();
                    // Khôi phục lại camera trước
                    if (currentStream) {
                        this.stream = currentStream;
                        this.videoElement = currentVideo;
                        this.videoElement.srcObject = currentStream;
                    }
                }
            }
        }
        
        return { frontPhoto, backPhoto };
    },
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
            this.videoElement.style.display = 'none';
        }
    }
};
