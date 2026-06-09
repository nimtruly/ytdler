"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Check, FileAudio, FileVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"

interface DownloadPanelProps {
  videoData?: any
  onDownload: (format: string, quality: string) => void
  isDownloading: boolean
}

export function DownloadPanel({ videoData, onDownload, isDownloading }: DownloadPanelProps) {
  const [format, setFormat] = useState("video")
  const [quality, setQuality] = useState("best")

  // Helper to parse numeric height from a resolution string (e.g. "3840x2160" -> 2160, "1080p" -> 1080)
  const getHeight = (res: string): number => {
    const match = res.match(/(\d+)x(\d+)/)
    if (match) return parseInt(match[2])
    const h = parseInt(res)
    return isNaN(h) ? 0 : h
  }

  // Extract the maximum video height from available formats
  const heights = videoData?.formats
    ?.filter((f: any) => f.vcodec && f.vcodec !== "none")
    ?.map((f: any) => getHeight(f.resolution || "")) || []
  const maxHeight = heights.length > 0 ? Math.max(...heights) : 1080

  // Friendly label for a height
  const getResolutionLabel = (h: number): string => {
    if (h >= 8640) return `${h}p / 16K Ultra HD`
    if (h >= 4320) return `${h}p / 8K Ultra HD`
    if (h >= 2160) return `${h}p / 4K Ultra HD`
    if (h >= 1440) return `${h}p / 2K Quad HD`
    if (h >= 1080) return `${h}p / Full HD`
    if (h >= 720) return `${h}p / HD`
    if (h >= 480) return `${h}p / SD`
    if (h >= 360) return `${h}p / SD`
    return `${h}p`
  }

  // Standard qualities from 144p to 16K
  const standardQualities = [
    { label: "16K Ultra HD (8640p)", value: "8640p", height: 8640 },
    { label: "8K Ultra HD (4320p)", value: "4320p", height: 4320 },
    { label: "4K Ultra HD (2160p)", value: "2160p", height: 2160 },
    { label: "2K Quad HD (1440p)", value: "1440p", height: 1440 },
    { label: "1080p (Full HD)", value: "1080p", height: 1080 },
    { label: "720p (HD)", value: "720p", height: 720 },
    { label: "480p (SD)", value: "480p", height: 480 },
    { label: "360p (SD)", value: "360p", height: 360 },
    { label: "240p (SD)", value: "240p", height: 240 },
    { label: "144p (SD)", value: "144p", height: 144 },
  ]

  // Filter to only show standard resolutions that are available for the video
  const availableQualities = standardQualities.filter(q => q.height <= maxHeight)

  const handleDownload = () => {
    onDownload(format, quality)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <Card className="h-full border-0 bg-white/80 shadow-2xl backdrop-blur-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Download Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-700">Format</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => { setFormat("video"); setQuality("best"); }}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all hover:scale-[1.02] ${
                  format === "video" 
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20" 
                    : "border-gray-100 bg-white hover:border-emerald-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${format === "video" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    <FileVideo className="h-5 w-5" />
                  </div>
                  <span className={`font-semibold ${format === "video" ? "text-emerald-900" : "text-gray-600"}`}>Video</span>
                </div>
              </div>

              <div 
                onClick={() => { setFormat("audio"); setQuality("320kbps"); }}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all hover:scale-[1.02] ${
                  format === "audio" 
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20" 
                    : "border-gray-100 bg-white hover:border-emerald-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${format === "audio" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    <FileAudio className="h-5 w-5" />
                  </div>
                  <span className={`font-semibold ${format === "audio" ? "text-emerald-900" : "text-gray-600"}`}>Audio</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <Label className="text-base font-semibold text-gray-700">Quality</Label>
             <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="h-16 text-lg">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {format === "video" ? (
                  <>
                    <SelectItem value="best">Best Available (Auto)</SelectItem>
                    <SelectItem value="highest">Highest Quality ({getResolutionLabel(maxHeight)})</SelectItem>
                    {availableQualities.map((q) => (
                      <SelectItem key={q.value} value={q.value}>
                        {q.label}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <>
                    <SelectItem value="320kbps">320kbps (High Quality)</SelectItem>
                    <SelectItem value="128kbps">128kbps (Standard)</SelectItem>
                  </>
                )}
              </SelectContent>
             </Select>
          </div>

          <Button 
            size="lg" 
            className="w-full h-16 text-xl shadow-xl shadow-emerald-200"
            onClick={handleDownload}
            loading={isDownloading}
          >
            {!isDownloading && <Download className="mr-2 h-6 w-6" />}
            Download {format === "video" ? "Video" : "Audio"}
          </Button>

        </CardContent>
      </Card>
    </motion.div>
  )
}
