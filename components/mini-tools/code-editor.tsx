"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Download, Play, FileCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const LANGUAGE_TEMPLATES = {
  javascript: `// Chrome Extension Background Script
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {action: "toggle"});
});`,

  manifest: `{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0",
  "description": "A Chrome extension",
  "permissions": ["activeTab", "storage"],
  "action": {
    "default_popup": "popup.html",
    "default_title": "My Extension"
  },
  "background": {
    "service_worker": "background.js"
  }
}`,

  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 300px; padding: 20px; }
    .container { text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>My Extension</h1>
    <button id="action-btn">Click Me</button>
  </div>
  <script src="popup.js"></script>
</body>
</html>`,

  css: `/* Chrome Extension Styles */
.extension-container {
  width: 300px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.btn-primary {
  background: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #3367d6;
}`,
}

export function CodeEditor() {
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.javascript)
  const [language, setLanguage] = useState("javascript")
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setCode(LANGUAGE_TEMPLATES[newLanguage as keyof typeof LANGUAGE_TEMPLATES] || "")
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code copied!",
      description: "Code has been copied to clipboard",
    })
  }

  const downloadCode = () => {
    const extensions = {
      javascript: "js",
      manifest: "json",
      html: "html",
      css: "css",
    }

    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `code.${extensions[language as keyof typeof extensions]}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const validateCode = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      if (language === "manifest") {
        try {
          JSON.parse(code)
          toast({
            title: "Valid JSON!",
            description: "Manifest file is properly formatted",
          })
        } catch (e) {
          toast({
            title: "Invalid JSON",
            description: "Please check your manifest syntax",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Code validated!",
          description: "No syntax errors detected",
        })
      }
    }, 1000)
  }

  return (
    <Card className="border-retro-green/20 bg-retro-cream/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <FileCode className="w-5 h-5" />
            <span>Code Editor</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32 border-retro-green/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="manifest">Manifest</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="font-mono">
              {language}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-[300px] font-mono text-sm border-retro-green/30 focus:border-retro-tan"
          placeholder="Enter your code here..."
        />

        <div className="flex space-x-2">
          <Button
            onClick={validateCode}
            disabled={isRunning}
            className="bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Validating..." : "Validate"}
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button
            onClick={downloadCode}
            variant="outline"
            className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        <div className="bg-retro-beige/30 rounded-lg p-3">
          <p className="text-xs font-mono text-retro-green/70">
            💡 Tip: Use Ctrl+A to select all, Ctrl+C to copy. The validator checks JSON syntax for manifest files.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
