import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { isOnline } from "./const";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Larkdocs2md",
  description: "10s! Export .md file from the Feishu/Lark Document",
  keywords: ['larkdocs2md', 'ischanx', 'lark', 'feishu', '飞书文档', 'docx', 'markdown', '导出', 'export'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" ></link>
        <link rel="apple-touch-icon" href="/favicon.png" ></link>
      </head>
      <body className={inter.className}>{children}</body>
      {isOnline && <script defer src="https://umami.showmecode.net/script.js" data-website-id="5840f1ed-4ace-4825-ab54-aea9df375f45"></script>}
    </html>
  );
}
