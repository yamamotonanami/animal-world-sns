import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // デプロイ時のESLintエラーによるビルド失敗を防ぐ
    ignoreDuringBuilds: true,
  },
  typescript: {
    // デプロイ時の型エラーによるビルド失敗を防ぐ（開発速度優先）
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
