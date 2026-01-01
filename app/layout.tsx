import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Coffee Collections",
  description: "コーヒー豆の評価記録アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
