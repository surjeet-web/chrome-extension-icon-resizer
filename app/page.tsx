"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Download, Settings, Moon, Sun, ImageIcon, Zap, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import JSZip from "jszip"

interface ProcessedIcon {
  id: string
  originalName: string
  size: number
  blob: Blob
  url: string
  filename: string
}

export default function IconResizerDashboard() {
  const [isDark, setIsDark] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [sizes, setSizes] = useState("16,32,48,128")
  const [processedIcons, setProcessedIcons] = useState<ProcessedIcon[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === "image/svg+xml" || file.type === "image/png",
      )

      if (droppedFiles.length > 0) {
        setFiles((prev) => [...prev, ...droppedFiles])
        toast({
          title: "Files added!",
          description: `${droppedFiles.length} file(s) ready for processing`,
        })
      }
    },
    [toast],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.type === "image/svg+xml" || file.type === "image/png",
      )
      setFiles((prev) => [...prev, ...selectedFiles])
      toast({
        title: "Files selected!",
        description: `${selectedFiles.length} file(s) ready for processing`,
      })
    }
  }

  const processImages = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select some SVG or PNG files first",
        variant: "destructive",
      })
      return
    }

    const sizeArray = sizes
      .split(",")
      .map((s) => Number.parseInt(s.trim()))
      .filter((s) => s > 0)
    if (sizeArray.length === 0) {
      toast({
        title: "Invalid sizes",
        description: "Please enter valid comma-separated sizes",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)
    const newProcessedIcons: ProcessedIcon[] = []
    const totalOperations = files.length * sizeArray.length
    let completedOperations = 0

    try {
      for (const file of files) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        const imageUrl = URL.createObjectURL(file)

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = imageUrl
        })

        for (const size of sizeArray) {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")!
          canvas.width = size
          canvas.height = size

          // Calculate scaling to maintain aspect ratio
          const scale = Math.min(size / img.width, size / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const x = (size - scaledWidth) / 2
          const y = (size - scaledHeight) / 2

          ctx.fillStyle = "transparent"
          ctx.fillRect(0, 0, size, size)
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), "image/png")
          })

          const processedUrl = URL.createObjectURL(blob)
          const baseName = file.name.replace(/\.[^/.]+$/, "")
          const filename = `${baseName}_${size}x${size}.png`

          newProcessedIcons.push({
            id: `${file.name}-${size}`,
            originalName: file.name,
            size,
            blob,
            url: processedUrl,
            filename,
          })

          completedOperations++
          setProgress((completedOperations / totalOperations) * 100)
        }

        URL.revokeObjectURL(imageUrl)
      }

      setProcessedIcons(newProcessedIcons)
      toast({
        title: "Processing complete!",
        description: `Generated ${newProcessedIcons.length} icons`,
      })
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "An error occurred while processing images",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadIcon = (icon: ProcessedIcon) => {
    const link = document.createElement("a")
    link.href = icon.url
    link.download = icon.filename
    link.click()
  }

  const downloadAllAsZip = async () => {
    if (processedIcons.length === 0) return

    const zip = new JSZip()

    for (const icon of processedIcons) {
      zip.file(icon.filename, icon.blob)
    }

    const zipBlob = await zip.generateAsync({ type: "blob" })
    const zipUrl = URL.createObjectURL(zipBlob)

    const link = document.createElement("a")
    link.href = zipUrl
    link.download = "chrome-extension-icons.zip"
    link.click()

    URL.revokeObjectURL(zipUrl)
    toast({
      title: "ZIP downloaded!",
      description: `Downloaded ${processedIcons.length} icons as ZIP`,
    })
  }

  const clearAll = () => {
    processedIcons.forEach((icon) => URL.revokeObjectURL(icon.url))
    setProcessedIcons([])
    setFiles([])
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "dark bg-retro-green" : "bg-retro-cream"}`}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-10 h-10 bg-retro-tan rounded-lg flex items-center justify-center"
            >
              <Package className="w-6 h-6 text-retro-green" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold font-mono text-retro-green">Chrome Extension Icon Resizer</h1>
              <p className="text-sm text-retro-green/70 font-mono">Pixel-perfect icons for your extensions</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="border-retro-green text-retro-green hover:bg-retro-tan"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-retro-green/20 bg-retro-cream/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
                <Upload className="w-5 h-5" />
                <span>Input Acquisition</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-retro-tan bg-retro-tan/10" : "border-retro-green/30 hover:border-retro-tan"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <motion.div animate={dragActive ? { scale: 1.05 } : { scale: 1 }} className="space-y-3">
                  <ImageIcon className="w-12 h-12 mx-auto text-retro-green/50" />
                  <div>
                    <p className="text-retro-green font-mono">Drag & drop SVG/PNG files here</p>
                    <p className="text-sm text-retro-green/60 font-mono">or click to browse</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-retro-green text-retro-green hover:bg-retro-tan font-mono"
                  >
                    Browse Files
                  </Button>
                </motion.div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".svg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />

              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <p className="text-sm font-mono text-retro-green">Selected files ({files.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <Badge key={index} variant="secondary" className="font-mono">
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Size Configuration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-retro-green/20 bg-retro-cream/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
                <Settings className="w-5 h-5" />
                <span>Size Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="16,32,48,128"
                    className="font-mono border-retro-green/30 focus:border-retro-tan"
                  />
                  <p className="text-xs text-retro-green/60 mt-1 font-mono">
                    Comma-separated dimensions (e.g., 16,32,48,128)
                  </p>
                </div>
                <Button
                  onClick={processImages}
                  disabled={isProcessing || files.length === 0}
                  className="bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Generate Icons"}
                </Button>
              </div>

              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-retro-green font-mono">Processing... {Math.round(progress)}%</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {processedIcons.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="border-retro-green/20 bg-retro-cream/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
                      <Download className="w-5 h-5" />
                      <span>Generated Icons ({processedIcons.length})</span>
                    </CardTitle>
                    <div className="space-x-2">
                      <Button
                        onClick={downloadAllAsZip}
                        className="bg-retro-green hover:bg-retro-green/80 text-retro-cream font-mono"
                      >
                        Download All (ZIP)
                      </Button>
                      <Button
                        onClick={clearAll}
                        variant="outline"
                        className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {processedIcons.map((icon, index) => (
                      <motion.div
                        key={icon.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <Card className="border-retro-green/20 hover:border-retro-tan transition-colors">
                          <CardContent className="p-3 space-y-2">
                            <div className="aspect-square bg-retro-beige rounded-lg p-2 flex items-center justify-center">
                              <img
                                src={icon.url || "/placeholder.svg"}
                                alt={icon.filename}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-mono text-retro-green truncate">{icon.filename}</p>
                              <Badge variant="outline" className="text-xs font-mono">
                                {icon.size}×{icon.size}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => downloadIcon(icon)}
                              className="w-full bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono text-xs"
                            >
                              Download
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
