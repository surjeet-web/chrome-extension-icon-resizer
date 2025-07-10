"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minimize2, Copy, Download, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CodeMinifier() {
  const [inputCode, setInputCode] = useState("")
  const [outputCode, setOutputCode] = useState("")
  const [codeType, setCodeType] = useState("javascript")
  const [isMinifying, setIsMinifying] = useState(false)
  const [compressionRatio, setCompressionRatio] = useState(0)
  const { toast } = useToast()

  const minifyCode = () => {
    if (!inputCode.trim()) {
      toast({
        title: "No code to minify",
        description: "Please enter some code first",
        variant: "destructive",
      })
      return
    }

    setIsMinifying(true)

    setTimeout(() => {
      let minified = ""
      const originalSize = inputCode.length

      switch (codeType) {
        case "javascript":
          // Simple JS minification simulation
          minified = inputCode
            .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
            .replace(/\/\/.*$/gm, "") // Remove line comments
            .replace(/\s+/g, " ") // Replace multiple spaces with single space
            .replace(/;\s*}/g, "}") // Remove semicolons before closing braces
            .replace(/\s*{\s*/g, "{") // Remove spaces around opening braces
            .replace(/\s*}\s*/g, "}") // Remove spaces around closing braces
            .replace(/\s*,\s*/g, ",") // Remove spaces around commas
            .replace(/\s*;\s*/g, ";") // Remove spaces around semicolons
            .trim()
          break

        case "css":
          // Simple CSS minification simulation
          minified = inputCode
            .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
            .replace(/\s+/g, " ") // Replace multiple spaces
            .replace(/\s*{\s*/g, "{") // Remove spaces around braces
            .replace(/\s*}\s*/g, "}")
            .replace(/\s*:\s*/g, ":") // Remove spaces around colons
            .replace(/\s*;\s*/g, ";") // Remove spaces around semicolons
            .replace(/;\s*}/g, "}") // Remove last semicolon in blocks
            .trim()
          break

        case "html":
          // Simple HTML minification simulation
          minified = inputCode
            .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
            .replace(/\s+/g, " ") // Replace multiple spaces
            .replace(/>\s+</g, "><") // Remove spaces between tags
            .trim()
          break

        case "json":
          try {
            const parsed = JSON.parse(inputCode)
            minified = JSON.stringify(parsed)
          } catch (e) {
            minified = inputCode.replace(/\s+/g, " ").trim()
          }
          break

        default:
          minified = inputCode.replace(/\s+/g, " ").trim()
      }

      const newSize = minified.length
      const ratio = originalSize > 0 ? ((originalSize - newSize) / originalSize) * 100 : 0

      setOutputCode(minified)
      setCompressionRatio(ratio)
      setIsMinifying(false)

      toast({
        title: "Code minified!",
        description: `Reduced size by ${ratio.toFixed(1)}%`,
      })
    }, 1000)
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(outputCode)
    toast({
      title: "Minified code copied!",
      description: "Code has been copied to clipboard",
    })
  }

  const downloadOutput = () => {
    const extensions = {
      javascript: "js",
      css: "css",
      html: "html",
      json: "json",
    }

    const blob = new Blob([outputCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `minified.${extensions[codeType as keyof typeof extensions]}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className="border-retro-green/20 bg-retro-cream/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <Minimize2 className="w-5 h-5" />
            <span>Code Minifier</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={codeType} onValueChange={setCodeType}>
              <SelectTrigger className="w-32 border-retro-green/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            {compressionRatio > 0 && (
              <Badge variant="outline" className="font-mono text-green-700 border-green-300">
                -{compressionRatio.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-mono text-retro-green">Input Code</label>
              {inputCode && (
                <Badge variant="outline" className="text-xs">
                  {formatFileSize(inputCode.length)}
                </Badge>
              )}
            </div>
            <Textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="min-h-[200px] font-mono text-sm border-retro-green/30 focus:border-retro-tan"
              placeholder={`Enter your ${codeType} code here...`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-mono text-retro-green">Minified Output</label>
              {outputCode && (
                <Badge variant="outline" className="text-xs">
                  {formatFileSize(outputCode.length)}
                </Badge>
              )}
            </div>
            <Textarea
              value={outputCode}
              readOnly
              className="min-h-[200px] font-mono text-sm border-retro-green/30 bg-retro-beige/20"
              placeholder="Minified code will appear here..."
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={minifyCode}
            disabled={isMinifying || !inputCode.trim()}
            className="bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            {isMinifying ? "Minifying..." : "Minify Code"}
          </Button>

          {outputCode && (
            <>
              <Button
                onClick={copyOutput}
                variant="outline"
                className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={downloadOutput}
                variant="outline"
                className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>

        {compressionRatio > 0 && (
          <div className="bg-retro-beige/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-retro-green">Compression Results</span>
              <FileText className="w-4 h-4 text-retro-green" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <p className="text-retro-green/70">Original</p>
                <p className="text-retro-green">{formatFileSize(inputCode.length)}</p>
              </div>
              <div>
                <p className="text-retro-green/70">Minified</p>
                <p className="text-retro-green">{formatFileSize(outputCode.length)}</p>
              </div>
              <div>
                <p className="text-retro-green/70">Saved</p>
                <p className="text-green-600">{compressionRatio.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-retro-beige/30 rounded-lg p-3">
          <p className="text-xs font-mono text-retro-green/70">
            💡 Minification removes comments, whitespace, and optimizes code structure to reduce file size for
            production.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
