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
  onDownload: (format: string, quality: string) => void
  isDownloading: boolean
}

export function DownloadPanel({ onDownload, isDownloading }: DownloadPanelProps) {
  const [format, setFormat] = useState("video")
  const [quality, setQuality] = useState("1080p")

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
                onClick={() => setFormat("video")}
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
                onClick={() => setFormat("audio")}
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
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="480p">480p (SD)</SelectItem>
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
