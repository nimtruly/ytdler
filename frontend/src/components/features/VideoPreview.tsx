import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card" 
// Using lucide badge? No, I need a UI badge or just styled span.
// I'll use styled span.

interface VideoPreviewProps {
  video: {
    title: string
    thumbnail: string
    duration: string
    channel: string
    embedUrl?: string
  }
}

export function VideoPreview({ video }: VideoPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden border-0 bg-white/80 shadow-2xl backdrop-blur-3xl">
        <CardContent className="p-6">
          <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
             <img 
               src={video.thumbnail} 
               alt={video.title}
               className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
             />
             {/* Alternatively use iframe if available */}
          </div>
          
          <div className="mt-6 space-y-4">
            <h2 className="line-clamp-2 text-2xl font-bold leading-tight tracking-tight text-gray-900">
              {video.title}
            </h2>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {video.channel}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                {video.duration}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
