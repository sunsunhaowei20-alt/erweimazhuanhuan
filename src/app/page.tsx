import { QrCodeIcon } from "lucide-react";
import { QrGenerator } from "@/components/qr-generator";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <QrCodeIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">二维码生成器</p>
            <p className="text-xs text-muted-foreground">纯前端 · 输入即出码</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            二维码生成器
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            把网址、名片或任意文字变成可扫描的二维码。不经过服务器，内容只留在你的浏览器里。
          </p>
        </div>
        <QrGenerator />
      </main>

      <footer className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          本地生成 PNG，适合分享链接、打印物料或临时出示。请自行确认扫码内容无误后再使用。
        </p>
      </footer>
    </div>
  );
}
