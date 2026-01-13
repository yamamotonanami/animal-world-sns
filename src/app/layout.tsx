import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-maru",
});

export const metadata: Metadata = {
  title: "動物世界SNS | 穏やかな時間",
  description: "人間の言葉を動物の言葉に翻訳する、数値のない静かなSNS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInForceRedirectUrl="/diagnosis"
      signUpForceRedirectUrl="/diagnosis"
      appearance={{
        variables: {
          colorPrimary: "#B2AC88", // Sage Green
          colorText: "#333333",
          colorBackground: "#FFFFFF",
          borderRadius: "1.5rem",
        },
        elements: {
          card: "shadow-2xl border-2 border-sage/10",
          formButtonPrimary: "bg-sage hover:bg-sage/90 text-white font-bold py-3 transition-all",
          footerActionLink: "text-sage hover:text-sage/80 font-bold",
          headerTitle: "font-maru font-bold text-2xl text-sage",
          headerSubtitle: "font-maru text-zinc-400",
        },
      }}
    >
      <html lang="ja">
        <body className={`${zenMaruGothic.variable} font-maru antialiased bg-zinc-100 flex justify-center`}>
          {/* スマホサイズのコンテナ */}
          <div className="w-full max-w-[430px] min-h-screen shadow-2xl flex flex-col relative overflow-x-hidden">
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
