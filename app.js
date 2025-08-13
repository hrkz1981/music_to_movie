class MP3VideoConverter {
    constructor() {
        this.audioFile = null;
        this.audioElement = new Audio();
        this.canvas = null;
        this.ctx = null;
        this.audioContext = null;
        this.analyser = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.isPlaying = false;
        this.animationId = null;

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.drawDefaultCanvas();
        this.startDefaultAnimation();
    }

    setupElements() {
        this.canvas = document.getElementById('visualCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 高解像度対応
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.audioElement.crossOrigin = 'anonymous';
    }

    setupEventListeners() {
        const audioFile = document.getElementById('audioFile');
        const uploadArea = document.getElementById('uploadArea');

        // ファイル選択
        audioFile.addEventListener('change', (e) => this.handleFileSelect(e));

        // ドラッグ&ドロップ
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect({ target: { files } });
            }
        });

        // ボタンイベント
        document.getElementById('convertBtn').addEventListener('click', () => this.startConversion());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadVideo());
        document.getElementById('previewBtn').addEventListener('click', () => this.togglePreview());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopPreview());

        // 設定変更時のプレビュー更新
        document.getElementById('visualStyle').addEventListener('change', () => this.updateVisualization());
        document.getElementById('colorTheme').addEventListener('change', () => this.updateVisualization());
        document.getElementById('backgroundColor').addEventListener('change', () => this.updateVisualization());
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // ファイルサイズチェック
        if (file.size > 100 * 1024 * 1024) {
            alert('ファイルサイズが大きすぎます。100MB以下のファイルを選択してください。');
            return;
        }

        this.audioFile = file;
        
        // ファイル情報表示
        document.getElementById('fileName').innerHTML = `<strong>📁 ${file.name}</strong>`;
        document.getElementById('fileSize').innerHTML = `📊 ファイルサイズ: ${this.formatFileSize(file.size)}`;
        document.getElementById('fileInfo').style.display = 'block';
        
        // タイトル自動設定
        const title = file.name.replace(/\.[^/.]+$/, '');
        document.getElementById('videoTitle').value = title;

        // 音声ファイルをロード
        const fileURL = URL.createObjectURL(file);
        this.audioElement.src = fileURL;

        try {
            await this.setupAudioContext();
            document.getElementById('convertBtn').disabled = false;
            document.getElementById('status').innerHTML = '✅ <strong>ファイル読み込み完了！</strong><br>設定を確認して「動画に変換開始」をクリックしてください';
            this.startVisualizationLoop();
        } catch (error) {
            console.error('Audio setup failed:', error);
            document.getElementById('status').innerHTML = '⚠️ 音声ファイルの読み込みに失敗しました';
        }
    }

    async setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const source = this.audioContext.createMediaElementSource(this.audioElement);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            return true;
        } catch (error) {
            console.error('AudioContext setup failed:', error);
            throw error;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    drawDefaultCanvas() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);
        
        this.ctx.fillStyle = '#4facfe';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵 音楽ビジュアライザー', width / 2, height / 2 - 20);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('MP3ファイルを選択すると表示されます', width / 2, height / 2 + 20);
    }

    startDefaultAnimation() {
        let time = 0;
        const animate = () => {
            if (!this.audioFile) {
                time += 0.1;
                this.drawDefaultVisualization(time);
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    drawDefaultVisualization(time) {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, width, height);

        // デモ用ウェーブ
        this.ctx.strokeStyle = '#4facfe';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let x = 0; x < width; x += 5) {
            const y = height / 2 + Math.sin((x + time * 50) * 0.02) * 30;
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
    }

    startVisualizationLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const animate = () => {
            this.drawVisualization();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    updateVisualization() {
        if (this.audioFile) {
            this.drawVisualization();
        }
    }

    drawVisualization() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        const backgroundColor = document.getElementById('backgroundColor').value;
        const visualStyle = document.getElementById('visualStyle').value;
        const colorTheme = document.getElementById('colorTheme').value;

        // 背景をクリア
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        // 音声データを取得
        let dataArray;
        if (this.analyser && this.isPlaying) {
            const bufferLength = this.analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(dataArray);
        } else {
            // デモ用ランダムデータ
            dataArray = new Uint8Array(128);
            for (let i = 0; i < dataArray.length; i++) {
                dataArray[i] = Math.random() * 200 + 55;
            }
        }

        // スタイル別描画
        switch (visualStyle) {
            case 'spectrum':
                this.drawSpectrum(dataArray, width, height, colorTheme);
                break;
            case 'waveform':
                this.drawWaveform(dataArray, width, height, colorTheme);
                break;
            case 'particles':
                this.drawParticles(dataArray, width, height, colorTheme);
                break;
            case 'bars':
                this.drawBars(dataArray, width, height, colorTheme);
                break;
        }

        // タイトル表示
        this.drawTitle(width, height);
    }

    getColor(index, total, theme) {
        const ratio = index / total;
        
        switch (theme) {
            case 'rainbow':
                const hue = ratio * 360;
                return `hsl(${hue}, 70%, 60%)`;
            case 'neon':
                const colors = ['#ff0080', '#8000ff', '#0080ff', '#00ff80', '#ff8000'];
                return colors[Math.floor(ratio * colors.length)];
            case 'ocean':
                return `hsl(${200 + ratio * 60}, 70%, ${50 + ratio * 30}%)`;
            case 'fire':
                return `hsl(${ratio * 60}, 100%, ${50 + ratio * 30}%)`;
            default:
                return `hsl(${ratio * 360}, 70%, 60%)`;
        }
    }

    drawSpectrum(dataArray, width, height, colorTheme) {
        const barCount = Math.min(dataArray.length, 128);
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
            const barHeight = (dataArray[i] / 255) * height * 0.8;
            const x = i * barWidth;
            const y = height - barHeight;

            const gradient = this.ctx.createLinearGradient(x, y, x, height);
            const color1 = this.getColor(i, barCount, colorTheme);
            const color2 = this.getColor(i, barCount, colorTheme);
            
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2 + '80');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth - 2, barHeight);

            // グロー効果
            this.ctx.shadowColor = color1;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(x, y, barWidth - 2, barHeight);
            this.ctx.shadowBlur = 0;
        }
    }

    drawWaveform(dataArray, width, height, colorTheme) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 4;
        
        const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, this.getColor(0, 1, colorTheme));
        gradient.addColorStop(0.5, this.getColor(0.5, 1, colorTheme));
        gradient.addColorStop(1, this.getColor(1, 1, colorTheme));
        
        this.ctx.strokeStyle = gradient;

        const centerY = height / 2;
        for (let i = 0; i < dataArray.length; i++) {
            const x = (i / dataArray.length) * width;
            const y = centerY + ((dataArray[i] - 128) / 128) * centerY * 0.8;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
    }

    drawParticles(dataArray, width, height, colorTheme) {
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < dataArray.length; i += 3) {
            const amplitude = dataArray[i] / 255;
            const angle = (i / dataArray.length) * Math.PI * 2;
            const radius = amplitude * Math.min(width, height) * 0.3;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const color = this.getColor(i / dataArray.length, 1, colorTheme);
            this.ctx.fillStyle = color;
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 15;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, amplitude * 12 + 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        }
    }

    drawBars(dataArray, width, height, colorTheme) {
        const barCount = 64;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * dataArray.length / barCount);
            const barHeight = (dataArray[dataIndex] / 255) * height * 0.8;
            const x = i * barWidth;
            const y = height - barHeight;

            // 3D効果
            const gradient = this.ctx.createLinearGradient(x, y, x + barWidth, y + barHeight);
            const color1 = this.getColor(i, barCount, colorTheme);
            const color2 = this.getColor(i, barCount, colorTheme);
            
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2 + '60');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth - 3, barHeight);

            // ハイライト
            this.ctx.fillStyle = color1 + '40';
            this.ctx.fillRect(x, y, 2, barHeight);
        }
    }

    drawTitle(width, height) {
        const title = document.getElementById('videoTitle').value;
        if (title) {
            // 背景
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, height - 80, width, 80);

            // タイトル
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 5;
            this.ctx.fillText(title, width / 2, height - 30);
            this.ctx.shadowBlur = 0;
        }
    }

    async togglePreview() {
        if (!this.audioFile) return;

        if (this.audioElement.paused) {
            try {
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
                await this.audioElement.play();
                this.isPlaying = true;
                document.getElementById('previewBtn').textContent = '⏸️ 一時停止';
            } catch (error) {
                console.error('Preview play failed:', error);
            }
        } else {
            this.audioElement.pause();
            this.isPlaying = false;
            document.getElementById('previewBtn').textContent = '🔍 プレビュー再生';
        }
    }

    stopPreview() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.isPlaying = false;
        document.getElementById('previewBtn').textContent = '🔍 プレビュー再生';
    }

    async startConversion() {
        if (!this.audioFile) return;

        document.getElementById('convertBtn').disabled = true;
        document.getElementById('progressContainer').style.display = 'block';
        document.getElementById('status').innerHTML = '🎬 <strong>動画を作成中...</strong><br>しばらくお待ちください';

        try {
            const stream = this.canvas.captureStream(30);
            
            let mimeType = 'video/webm';
            if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
                mimeType = 'video/webm; codecs=vp9';
            }

            this.mediaRecorder = new MediaRecorder(stream, { mimeType });
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.finishConversion();
            };

            this.mediaRecorder.start(1000);
            this.isRecording = true;

            // 音声再生
            this.audioElement.currentTime = 0;
            this.isPlaying = true;
            await this.audioElement.play();

            // 進行状況の更新
            this.updateProgress();

        } catch (error) {
            console.error('Conversion failed:', error);
            document.getElementById('status').innerHTML = '❌ <strong>変換に失敗しました</strong><br>' + error.message;
            document.getElementById('convertBtn').disabled = false;
        }
    }

    updateProgress() {
        const duration = this.audioElement.duration || 30;
        const maxDuration = Math.min(duration, 30); // 最大30秒
        
        const updateInterval = setInterval(() => {
            if (!this.isRecording) {
                clearInterval(updateInterval);
                return;
            }

            const currentTime = this.audioElement.currentTime;
            const progress = Math.min((currentTime / maxDuration) * 100, 100);
            
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = Math.round(progress) + '%';

            if (currentTime >= maxDuration || this.audioElement.ended) {
                this.stopRecording();
                clearInterval(updateInterval);
            }
        }, 100);
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.isPlaying = false;
            this.audioElement.pause();
        }
    }

    finishConversion() {
        if (this.recordedChunks.length === 0) {
            document.getElementById('status').innerHTML = '❌ <strong>録画データがありません</strong>';
            document.getElementById('convertBtn').disabled = false;
            return;
        }

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.videoBlob = blob;

        const fileSize = (blob.size / 1024 / 1024).toFixed(2);
        document.getElementById('status').innerHTML = `✅ <strong>変換完了！</strong><br>ファイルサイズ: ${fileSize}MB`;
        document.getElementById('downloadBtn').classList.remove('hidden');
        document.getElementById('convertBtn').disabled = false;
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressText').textContent = '100%';
    }

    downloadVideo() {
        if (!this.videoBlob) return;

        const url = URL.createObjectURL(this.videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (document.getElementById('videoTitle').value || 'music_video') + '.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        document.getElementById('status').innerHTML = '💾 <strong>ダウンロード完了！</strong><br>YouTubeにアップロードできます';
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new MP3VideoConverter();
});