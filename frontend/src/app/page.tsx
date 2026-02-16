"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HeroSection } from "@/components/features/HeroSection"
import { VideoPreview } from "@/components/features/VideoPreview"
import { DownloadPanel } from "@/components/features/DownloadPanel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "react-hot-toast"

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("")
  const [videoData, setVideoData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [step, setStep] = useState<"hero" | "result">("hero")

  const fetchVideoInfo = async (url: string) => {
    setIsLoading(true)
    // Show loading toast or UI update
    const loadingToast = toast.loading("Fetching video details...")
    
    try {
      // Use local backend URL
      const response = await fetch(`http://localhost:3001/api/video/info?url=${encodeURIComponent(url)}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch video info")
      }
      
      const data = await response.json()
      
      // Transform data if needed to match VideoPreview props
      // Assuming backend returns: { title, thumbnail, duration, ... }
      // If backend returns different structure, we map it here.
      // For now passing data directly, assuming typical ytdler format.
      
      setVideoData(data)
      setVideoUrl(url)
      setStep("result")
      toast.dismiss(loadingToast)
      toast.success("Video found!")
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Failed to fetch video details. Please check the URL.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (format: string, quality: string) => {
    setIsDownloading(true)
    const downloadToast = toast.loading("Starting download...")
    
    try {
      const response = await fetch("http://localhost:3001/api/video/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl, format, quality }),
      })
      
      if (!response.ok) throw new Error("Download failed")
        
      // Handle file download (blob)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      // Use title from videoData if available for filename
      const ext = format === "audio" ? "mp3" : "mp4"
      a.download = videoData?.title ? `${videoData.title}.${ext}` : `video.${ext}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.dismiss(downloadToast)
      toast.success("Download success!")
    } catch (error) {
      toast.dismiss(downloadToast)
      toast.error("Download failed. Please try again.")
      console.error(error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleBack = () => {
    setStep("hero")
    setVideoData(null)
    setVideoUrl("")
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-b from-emerald-100/40 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-t from-gray-100/40 to-transparent blur-3xl" />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <AnimatePresence mode="wait">
          {step === "hero" ? (
            <HeroSection 
              key="hero" 
              onVideoUrlSubmit={fetchVideoInfo} 
              isLoading={isLoading} 
            />
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="mx-auto max-w-6xl"
            >
              <div className="mb-8">
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="group pl-0 hover:bg-transparent hover:text-emerald-600"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Search
                </Button>
              </div>

              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <VideoPreview video={videoData} />
                <DownloadPanel 
                  onDownload={handleDownload} 
                  isDownloading={isDownloading} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
