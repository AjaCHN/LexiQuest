import "./globals.css";
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
      <body>{children}</body>
    </html>
  );
}
