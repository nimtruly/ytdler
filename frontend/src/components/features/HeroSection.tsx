"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const schema = z.object({
  url: z.string().url("Please enter a valid YouTube URL"),
})

interface HeroSectionProps {
  onVideoUrlSubmit: (url: string) => void
  isLoading: boolean
}

export function HeroSection({ onVideoUrlSubmit, isLoading }: HeroSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ url: string }>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: { url: string }) => {
    onVideoUrlSubmit(data.url)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex min-h-[80vh] w-full flex-col items-center justify-center px-4"
    >
      <div className="glass relative flex w-full max-w-2xl flex-col items-center gap-8 rounded-3xl border p-8 px-6 text-center shadow-2xl md:p-12">
        {/* Background glow effect */}
        <div className="absolute -z-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-[100px]" />
        
        <motion.div variants={item}>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
            Free • No Sign Up • Fast
          </span>
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Download YouTube <br className="hidden md:block" />
            <span className="text-emerald-600">Videos Instantly</span>
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Paste your link below and choose your preferred quality. 
            Download videos and audio in seconds.
          </p>
        </motion.div>

        <motion.form
          variants={item}
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-4"
        >
          <div className="relative w-full">
            <Input
              {...register("url")}
              placeholder="https://www.youtube.com/watch?v=..."
              icon={<Link className="h-5 w-5" />}
              className={errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}
              disabled={isLoading}
              autoComplete="off"
            />
            {errors.url && (
              <p className="absolute -bottom-6 left-2 text-sm text-red-500">
                {errors.url.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full text-lg shadow-emerald-200"
            loading={isLoading}
          >
            {!isLoading && "Get Video Info"}
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </motion.form>
      </div>
      
      {/* Footer Text */}
      <motion.p 
        variants={item}
        className="mt-8 text-sm text-muted-foreground opacity-50"
      >
        Supports YouTube, Shorts, and generic video links
      </motion.p>
    </motion.div>
  )
}
