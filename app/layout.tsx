import "./globals.css";
import Script from "next/script";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "英语闯关台 LexiQuest · 多年龄段英语学习工作台",
  description:
    "LexiQuest 英语闯关台：为儿童、青少年、成人定制的每日单词拆分记忆卡、组词练习与闯关积分英语学习工作台。Next.js + 腾讯云 EdgeOne 部署，支持 Edge KV 跨设备云端同步。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {/* Google Analytics 4（衡量 ID: G-W806DBME5G）。
            采用 next/script 的 afterInteractive 策略，避免阻塞首屏渲染；
            内联 config 先定义 gtag 函数与 dataLayer，再由 loader 加载库后重放。 */}
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-W806DBME5G');
            `,
          }}
        />
        <Script
          id="ga-loader"
          src="https://www.googletagmanager.com/gtag/js?id=G-W806DBME5G"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
