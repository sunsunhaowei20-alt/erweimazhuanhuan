"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  Link2Icon,
  QrCodeIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { generateQrDataUrl, looksLikeUrl } from "@/lib/generate-qr";
import type { QRCodeErrorCorrectionLevel } from "qrcode";

const EXAMPLES = [
  {
    label: "网址",
    value: "https://github.com",
    icon: Link2Icon,
  },
  {
    label: "文字",
    value: "你好，这是一段可以扫出来的文字。",
    icon: TypeIcon,
  },
] as const;

const MAX_CHARS = 1200;

export function QrGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(320);
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<QRCodeErrorCorrectionLevel>("M");
  const [darkColor, setDarkColor] = useState("#111111");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [preview, setPreview] = useState<
    | { kind: "ready"; source: string; url: string }
    | { kind: "error"; source: string; message: string }
    | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const trimmed = text.trim();
  const isUrl = useMemo(() => looksLikeUrl(trimmed), [trimmed]);
  const previewKey = `${trimmed}|${size}|${errorCorrectionLevel}|${darkColor}|${lightColor}`;
  const shown = preview?.source === previewKey ? preview : null;
  const status = !trimmed
    ? "empty"
    : !shown
      ? "loading"
      : shown.kind === "error"
        ? "error"
        : "ready";
  const dataUrl = shown?.kind === "ready" ? shown.url : null;
  const errorMessage = shown?.kind === "error" ? shown.message : "";

  useEffect(() => {
    if (!trimmed) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const url = await generateQrDataUrl(trimmed, {
          size,
          margin: 2,
          errorCorrectionLevel,
          darkColor,
          lightColor,
        });
        if (cancelled) return;
        setPreview({ kind: "ready", source: previewKey, url });
      } catch {
        if (cancelled) return;
        setPreview({
          kind: "error",
          source: previewKey,
          message:
            trimmed.length > MAX_CHARS
              ? "内容过长，无法生成二维码。请缩短文字后再试。"
              : "当前内容无法编码成二维码。请检查是否包含无法识别的字符，或改短一些。",
        });
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed, size, errorCorrectionLevel, darkColor, lightColor, previewKey]);

  async function downloadPng() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function copyImage() {
    if (!dataUrl) return;
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopyError("");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopyError("复制失败。请改用下载，或允许浏览器访问剪贴板。");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>输入内容</CardTitle>
          <CardDescription>
            支持网址、纯文字、名片文本。输入后会立刻在右侧生成二维码，全程在浏览器完成。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="qr-content">文字或网址</Label>
              <span className="text-xs text-muted-foreground">
                {text.length} 字
              </span>
            </div>
            <Textarea
              id="qr-content"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="例如 https://example.com，或任意要分享的文字"
              className="min-h-36 resize-y"
              maxLength={2000}
              autoFocus
            />
            {trimmed ? (
              <p className="text-xs text-muted-foreground">
                {isUrl
                  ? "识别为网址：扫码后会打开这个链接。"
                  : "将按纯文字编码：扫码后会显示这段内容。"}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                还没有内容。可以从下面的示例开始，或直接粘贴。
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => {
              const Icon = example.icon;
              return (
                <Button
                  key={example.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setText(example.value)}
                >
                  <Icon />
                  填入{example.label}示例
                </Button>
              );
            })}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setText("")}
              disabled={!text}
            >
              <Trash2Icon />
              清空
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="qr-size">尺寸</Label>
                <span className="font-mono text-xs text-muted-foreground">
                  {size} px
                </span>
              </div>
              <Slider
                id="qr-size"
                min={160}
                max={640}
                step={16}
                value={[size]}
                onValueChange={(value) => setSize(value[0] ?? 320)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-level">容错等级</Label>
              <Select
                value={errorCorrectionLevel}
                onValueChange={(value) =>
                  setErrorCorrectionLevel(value as QRCodeErrorCorrectionLevel)
                }
              >
                <SelectTrigger id="qr-level" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">低 · 更紧凑</SelectItem>
                  <SelectItem value="M">中 · 推荐</SelectItem>
                  <SelectItem value="Q">较高 · 更耐污损</SelectItem>
                  <SelectItem value="H">高 · 最耐污损</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="qr-dark">前景色</Label>
                <input
                  id="qr-dark"
                  type="color"
                  value={darkColor}
                  onChange={(event) => setDarkColor(event.target.value)}
                  className="h-8 w-full cursor-pointer rounded-lg border border-input bg-background p-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qr-light">背景色</Label>
                <input
                  id="qr-light"
                  type="color"
                  value={lightColor}
                  onChange={(event) => setLightColor(event.target.value)}
                  className="h-8 w-full cursor-pointer rounded-lg border border-input bg-background p-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>二维码预览</CardTitle>
          <CardDescription>
            生成结果只存在于当前页面，刷新后需要重新输入。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 pt-5">
          <div
            className="flex min-h-72 flex-1 items-center justify-center rounded-xl border border-dashed bg-muted/40 p-4"
            aria-live="polite"
          >
            {status === "empty" ? (
              <div className="flex max-w-xs flex-col items-center gap-2 text-center text-muted-foreground">
                <QrCodeIcon className="size-10" />
                <p className="text-sm font-medium text-foreground">等待输入</p>
                <p className="text-sm">
                  在左侧输入文字或网址后，二维码会直接出现在这里。
                </p>
              </div>
            ) : null}

            {status === "loading" ? (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <div className="size-10 animate-pulse rounded-lg bg-muted" />
                <p>正在生成…</p>
              </div>
            ) : null}

            {status === "ready" && dataUrl ? (
              // Data URLs are generated in the browser; next/image is not suitable here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="根据当前输入生成的二维码"
                width={size}
                height={size}
                className="max-h-80 max-w-full rounded-lg bg-white shadow-sm"
              />
            ) : null}

            {status === "error" ? (
              <Alert variant="destructive" className="max-w-sm">
                <AlertCircleIcon />
                <AlertTitle>生成失败</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
          </div>

          {copyError ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>无法复制</AlertTitle>
              <AlertDescription>{copyError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              size="lg"
              onClick={downloadPng}
              disabled={status !== "ready"}
            >
              <DownloadIcon />
              下载 PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={copyImage}
              disabled={status !== "ready"}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "已复制" : "复制图片"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
