# 🎵 MP3 to YouTube Video Converter

MP3ファイルを美しいビジュアライザー付きのYouTube用動画に変換する無料Webアプリケーション

## 🌟 デモサイト

**[https://hrkz1981.github.io/mp3-to-youtube-converter/](https://hrkz1981.github.io/mp3-to-youtube-converter/)**

## ✨ 主な機能

- 🎨 **美しいビジュアライザー**: 音楽に合わせてリアルタイムで動くビジュアルエフェクト
- 🎬 **YouTube対応**: WebM形式で高品質動画を生成
- 🎯 **カスタマイズ**: 4種類のビジュアルスタイル & カラーテーマ
- 📱 **レスポンシブ**: PC・スマートフォン対応
- 🚀 **高速変換**: 最新のWeb技術による高速処理
- 💯 **完全無料**: 登録不要、制限なし

## 🎨 ビジュアルスタイル

1. **スペクトラムアナライザー** - 周波数解析によるクラシックな表示
2. **波形表示** - 滑らかな波形ビジュアル
3. **パーティクル** - 円形パーティクルによる美しいエフェクト
4. **3Dバー** - 立体的なバー表示

## 🌈 カラーテーマ

- **レインボー** - 虹色のグラデーション
- **ネオン** - 鮮やかなネオンカラー
- **オーシャン** - 青系の海洋カラー
- **ファイア** - 暖色系の炎カラー

## 🚀 使い方

1. **ファイル選択**: MP3/WAV/M4Aファイルをドラッグ&ドロップまたは選択
2. **設定**: ビジュアルスタイル、カラーテーマ、タイトルを設定
3. **プレビュー**: 変換前に音楽とビジュアルを確認
4. **変換**: 高品質なWebM動画を生成
5. **ダウンロード**: YouTubeにアップロード可能

## 🛠️ 技術仕様

- **フロントエンド**: Vanilla JavaScript (フレームワーク不要)
- **音声処理**: Web Audio API
- **動画生成**: MediaRecorder API + Canvas
- **対応形式**: 
  - 入力: MP3, WAV, M4A (最大100MB)
  - 出力: WebM (YouTube推奨)
- **ブラウザ対応**: Chrome, Firefox, Safari, Edge (最新版)

## 📊 システム要件

- **ブラウザ**: MediaRecorder API対応ブラウザ
- **メモリ**: 最低512MB推奨
- **容量**: ブラウザキャッシュ 50MB程度

## 🔧 ローカル実行

```bash
# リポジトリをクローン
git clone https://github.com/hrkz1981/mp3-to-youtube-converter.git

# ディレクトリに移動
cd mp3-to-youtube-converter

# ローカルサーバーで実行
python -m http.server 8000
# または
npx serve .

# ブラウザで開く
open http://localhost:8000
```

## 📈 パフォーマンス

- **変換速度**: 30秒の楽曲を約10-15秒で変換
- **ファイルサイズ**: 30秒の動画で約2-5MB
- **品質**: 720p/1080p対応

## 🤝 貢献

バグ報告や機能要望は [Issues](https://github.com/hrkz1981/mp3-to-youtube-converter/issues) にお願いします。

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- Web Audio API
- MediaRecorder API
- HTML5 Canvas

---

**🎵 音楽をもっと美しく、YouTubeでシェアしよう！**