"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Square,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Code,
  Terminal,
  RefreshCw,
  Settings,
  Globe,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface LogEntry {
  id: string
  timestamp: Date
  level: "log" | "warn" | "error" | "info"
  message: string
  source: "popup" | "options" | "background" | "content"
  stack?: string
}

interface MockChromeAPI {
  [key: string]: any
}

const VIEWPORT_SIZES = {
  desktop: { width: 1200, height: 800, label: "Desktop" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  mobile: { width: 375, height: 667, label: "Mobile" },
  popup: { width: 400, height: 600, label: "Extension Popup" },
}

const SAMPLE_PAGES = [
  { name: "Google", url: "https://www.google.com", description: "Test content scripts on Google" },
  { name: "GitHub", url: "https://github.com", description: "Test on GitHub interface" },
  { name: "YouTube", url: "https://www.youtube.com", description: "Test video-related features" },
  { name: "Local HTML", url: "about:blank", description: "Custom HTML for testing" },
]

export function LivePreview() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentViewport, setCurrentViewport] = useState<keyof typeof VIEWPORT_SIZES>("popup")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedPage, setSelectedPage] = useState(SAMPLE_PAGES[0])
  const [showConsole, setShowConsole] = useState(true)
  const [autoReload, setAutoReload] = useState(true)
  const [mockAPIs, setMockAPIs] = useState<MockChromeAPI>({})
  const popupRef = useRef<HTMLIFrameElement>(null)
  const optionsRef = useRef<HTMLIFrameElement>(null)
  const contentRef = useRef<HTMLIFrameElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize mock Chrome APIs
    initializeMockAPIs()
  }, [])

  const initializeMockAPIs = () => {
    const mockChrome: MockChromeAPI = {
      runtime: {
        id: "mock-extension-id",
        getManifest: () => ({
          name: "Test Extension",
          version: "1.0.0",
          manifest_version: 3,
        }),
        sendMessage: (message: any, callback?: Function) => {
          addLog("info", "runtime", `Message sent: ${JSON.stringify(message)}`)
          if (callback) callback({ success: true })
        },
        onMessage: {
          addListener: (callback: Function) => {
            addLog("info", "runtime", "Message listener added")
          },
        },
      },
      storage: {
        local: {
          get: (keys: string | string[], callback: Function) => {
            addLog("info", "storage", `Getting storage keys: ${JSON.stringify(keys)}`)
            callback({})
          },
          set: (items: any, callback?: Function) => {
            addLog("info", "storage", `Setting storage items: ${JSON.stringify(items)}`)
            if (callback) callback()
          },
        },
        sync: {
          get: (keys: string | string[], callback: Function) => {
            addLog("info", "storage", `Getting sync storage keys: ${JSON.stringify(keys)}`)
            callback({})
          },
          set: (items: any, callback?: Function) => {
            addLog("info", "storage", `Setting sync storage items: ${JSON.stringify(items)}`)
            if (callback) callback()
          },
        },
      },
      tabs: {
        query: (queryInfo: any, callback: Function) => {
          addLog("info", "tabs", `Querying tabs: ${JSON.stringify(queryInfo)}`)
          callback([
            {
              id: 1,
              url: selectedPage.url,
              title: selectedPage.name,
              active: true,
            },
          ])
        },
        create: (createProperties: any, callback?: Function) => {
          addLog("info", "tabs", `Creating tab: ${JSON.stringify(createProperties)}`)
          if (callback) callback({ id: 2, url: createProperties.url })
        },
      },
      action: {
        onClicked: {
          addListener: (callback: Function) => {
            addLog("info", "action", "Action click listener added")
          },
        },
        setBadgeText: (details: any) => {
          addLog("info", "action", `Setting badge text: ${JSON.stringify(details)}`)
        },
      },
    }

    setMockAPIs(mockChrome)
  }

  const addLog = (level: LogEntry["level"], source: LogEntry["source"], message: string, stack?: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      source,
      stack,
    }
    setLogs((prev) => [newLog, ...prev].slice(0, 100)) // Keep last 100 logs
  }

  const startPreview = () => {
    setIsRunning(true)
    setLogs([])
    addLog("info", "background", "Extension preview started")

    // Simulate background script initialization
    setTimeout(() => {
      addLog("info", "background", "Background script initialized")
      addLog("info", "popup", "Popup context ready")
    }, 500)

    toast({
      title: "Preview started",
      description: "Extension is now running in sandbox mode",
    })
  }

  const stopPreview = () => {
    setIsRunning(false)
    addLog("info", "background", "Extension preview stopped")

    toast({
      title: "Preview stopped",
      description: "Extension sandbox has been terminated",
    })
  }

  const reloadPreview = () => {
    if (isRunning) {
      addLog("info", "background", "Reloading extension...")
      // Simulate reload
      setTimeout(() => {
        addLog("info", "background", "Extension reloaded successfully")
      }, 300)
    }
  }

  const simulateUserAction = (action: string) => {
    switch (action) {
      case "click-icon":
        addLog("info", "action", "Extension icon clicked")
        addLog("info", "popup", "Popup opened")
        break
      case "navigate":
        addLog("info", "content", `Content script injected into ${selectedPage.name}`)
        break
      case "storage-test":
        addLog("info", "background", "Testing storage API...")
        setTimeout(() => {
          addLog("info", "storage", "Storage test completed")
        }, 200)
        break
      case "message-test":
        addLog("info", "popup", "Sending message to background...")
        setTimeout(() => {
          addLog("info", "background", "Message received from popup")
        }, 100)
        break
    }
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return "🔴"
      case "warn":
        return "🟡"
      case "info":
        return "🔵"
      default:
        return "⚪"
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600"
      case "warn":
        return "text-yellow-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const viewport = VIEWPORT_SIZES[currentViewport]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-retro-green/20 bg-retro-cream/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <Eye className="w-5 h-5" />
            <span>Live Preview & Testing Sandbox</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-retro-green/70 font-mono">
              Test your extension in a safe, isolated environment with mock Chrome APIs
            </p>
            <div className="flex items-center space-x-2">
              <Button
                onClick={isRunning ? stopPreview : startPreview}
                className={`font-mono ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-retro-green hover:bg-retro-green/80 text-retro-cream"
                }`}
              >
                {isRunning ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              {isRunning && (
                <Button
                  onClick={reloadPreview}
                  variant="outline"
                  className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="border-retro-green/20 bg-retro-cream/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <Settings className="w-5 h-5" />
            <span>Preview Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-mono text-retro-green">Viewport Size</Label>
              <Select
                value={currentViewport}
                onValueChange={(value: keyof typeof VIEWPORT_SIZES) => setCurrentViewport(value)}
              >
                <SelectTrigger className="border-retro-green/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VIEWPORT_SIZES).map(([key, size]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        {key === "desktop" && <Monitor className="w-4 h-4" />}
                        {key === "tablet" && <Tablet className="w-4 h-4" />}
                        {key === "mobile" && <Smartphone className="w-4 h-4" />}
                        {key === "popup" && <Layers className="w-4 h-4" />}
                        <span>
                          {size.label} ({size.width}×{size.height})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-mono text-retro-green">Test Page</Label>
              <Select
                value={selectedPage.name}
                onValueChange={(value) => {
                  const page = SAMPLE_PAGES.find((p) => p.name === value)
                  if (page) setSelectedPage(page)
                }}
              >
                <SelectTrigger className="border-retro-green/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_PAGES.map((page) => (
                    <SelectItem key={page.name} value={page.name}>
                      <div className="space-y-1">
                        <div className="font-medium">{page.name}</div>
                        <div className="text-xs text-gray-500">{page.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-mono text-retro-green">Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="console" checked={showConsole} onCheckedChange={setShowConsole} />
                  <Label htmlFor="console" className="text-xs font-mono">
                    Show Console
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-reload" checked={autoReload} onCheckedChange={setAutoReload} />
                  <Label htmlFor="auto-reload" className="text-xs font-mono">
                    Auto Reload
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => simulateUserAction("click-icon")}
              disabled={!isRunning}
              variant="outline"
              size="sm"
              className="border-retro-green text-retro-green hover:bg-retro-tan font-mono"
            >
              Simulate Icon Click
            </Button>
            <Button
              onClick={() => simulateUserAction("navigate")}
              disabled={!isRunning}
              variant="outline"
              size="sm"
              className="border-retro-green text-retro-green hover:bg-retro-tan font-mono"
            >
              Inject Content Script
            </Button>
            <Button
              onClick={() => simulateUserAction("storage-test")}
              disabled={!isRunning}
              variant="outline"
              size="sm"
              className="border-retro-green text-retro-green hover:bg-retro-tan font-mono"
            >
              Test Storage API
            </Button>
            <Button
              onClick={() => simulateUserAction("message-test")}
              disabled={!isRunning}
              variant="outline"
              size="sm"
              className="border-retro-green text-retro-green hover:bg-retro-tan font-mono"
            >
              Test Messaging
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Preview */}
        <div className="lg:col-span-2">
          <Card className="border-retro-green/20 bg-retro-cream/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
                  <Globe className="w-5 h-5" />
                  <span>Extension Preview</span>
                </CardTitle>
                <Badge variant="outline" className="font-mono">
                  {viewport.width}×{viewport.height}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="bg-gray-100 rounded-lg p-4 flex items-center justify-center"
                style={{ height: Math.min(viewport.height, 600) }}
              >
                {isRunning ? (
                  <div
                    className="bg-white rounded-lg shadow-lg border"
                    style={{ width: Math.min(viewport.width, 800), height: "100%" }}
                  >
                    <div className="h-full flex items-center justify-center text-gray-500 font-mono">
                      <div className="text-center space-y-4">
                        <Layers className="w-16 h-16 mx-auto text-retro-green/50" />
                        <div>
                          <p className="text-lg font-semibold">Extension Preview</p>
                          <p className="text-sm">Your extension UI would appear here</p>
                          <p className="text-xs text-gray-400 mt-2">Testing on: {selectedPage.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Play className="w-16 h-16 mx-auto text-retro-green/50" />
                    <div>
                      <p className="text-lg font-semibold text-retro-green font-mono">Preview Stopped</p>
                      <p className="text-sm text-retro-green/70 font-mono">Click Start to begin testing</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Console */}
        <div className="lg:col-span-1">
          <AnimatePresence>
            {showConsole && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Card className="border-retro-green/20 bg-retro-cream/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
                        <Terminal className="w-5 h-5" />
                        <span>Console</span>
                      </CardTitle>
                      <Button
                        onClick={() => setLogs([])}
                        variant="outline"
                        size="sm"
                        className="border-retro-green text-retro-green hover:bg-retro-tan font-mono"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-1">
                        {logs.length === 0 ? (
                          <p className="text-sm text-retro-green/50 font-mono italic">
                            Console output will appear here...
                          </p>
                        ) : (
                          logs.map((log) => (
                            <motion.div
                              key={log.id}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-mono border-b border-retro-green/10 pb-1"
                            >
                              <div className="flex items-start space-x-2">
                                <span className="text-xs">{getLogIcon(log.level)}</span>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {log.source}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                                  </div>
                                  <p className={`mt-1 ${getLogColor(log.level)}`}>{log.message}</p>
                                  {log.stack && (
                                    <pre className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">{log.stack}</pre>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* API Status */}
      <Card className="border-retro-green/20 bg-retro-cream/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <Code className="w-5 h-5" />
            <span>Mock Chrome APIs Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(mockAPIs).map((api) => (
              <div key={api} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono text-retro-green">chrome.{api}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-retro-green/60 font-mono mt-4">
            All Chrome extension APIs are mocked and ready for testing
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
