export const desktopBootstrap = {
  productName: 'Telegram Lite Desktop',
  mode: 'tauri-webview-wrapper',
  targetUrl: process.env.TELEGRAM_LITE_WEB_URL ?? 'http://localhost:3000',
};

export function getDesktopStartMessage(): string {
  return `${desktopBootstrap.productName} -> ${desktopBootstrap.targetUrl}`;
}

