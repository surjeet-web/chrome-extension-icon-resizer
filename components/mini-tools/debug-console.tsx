"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Terminal, Play, Trash2, Download, AlertCircle, Info, AlertTriangle, CheckCircle, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ConsoleEntry {
  id: string
  timestamp: Date
  level: "log" | "warn" | "error" | "info" | "command"
  message: string
  source?: string
  stack?: string
}

const CHROME_API_COMMANDS = [
  "chrome.tabs.query({active: true, currentWindow: true})",
  "chrome.storage.sync.get(['key'])",
  "chrome.storage.sync.set({key: 'value'})",
  "chrome.runtime.getManifest()",
  "chrome.runtime.getPlatformInfo()",
  "chrome.permissions.getAll()",
  "chrome.action.setBadgeText({text: '1'})",
  "chrome.notifications.create({type: 'basic', iconUrl: 'icon.png', title: 'Test', message: 'Hello'})",
]

export function DebugConsole() {
  const [entries, setEntries] = useState<ConsoleEntry[]>([])
  const [command, setCommand] = useState("")
  const [filter, setFilter] = useState<"all" | "log" | "warn" | "error" | "info">("all")
  const [isCapturing, setIsCapturing] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [entries])

  const addEntry = (level: ConsoleEntry["level"], message: string, source?: string, stack?: string) => {
    const entry: ConsoleEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      message,
      source,
      stack,
    }

    setEntries((prev) => [...prev, entry].slice(-1000)) // Keep last 1000 entries
  }

  const executeCommand = async () => {
    if (!command.trim()) return

    // Add command to history
    setCommandHistory((prev) => [...prev, command].slice(-50))
    setHistoryIndex(-1)

    // Add command to console
    addEntry("command", `> ${command}`)

    try {
      // Mock Chrome API responses
      if (command.includes("chrome.tabs.query")) {
        addEntry(
          "info",
          JSON.stringify(
            [
              {
                id: 1,
                url: "https://example.com",
                title: "Example Domain",
                active: true,
                windowId: 1,
              },
            ],
            null,
            2,
          ),
          "chrome.tabs",
        )
      } else if (command.includes("chrome.storage.sync.get")) {
        addEntry("info", JSON.stringify({ key: "stored_value" }, null, 2), "chrome.storage")
      } else if (command.includes("chrome.storage.sync.set")) {
        addEntry("info", "Storage updated successfully", "chrome.storage")
      } else if (command.includes("chrome.runtime.getManifest")) {
        addEntry(
          "info",
          JSON.stringify(
            {
              name: "Test Extension",
              version: "1.0.0",
              manifest_version: 3,
              permissions: ["activeTab", "storage"],
            },
            null,
            2,
          ),
          "chrome.runtime",
        )
      } else if (command.includes("chrome.runtime.getPlatformInfo")) {
        addEntry(
          "info",
          JSON.stringify(
            {
              os: "mac",
              arch: "x86-64",
              nacl_arch: "x86-64",
            },
            null,
            2,
          ),
          "chrome.runtime",
        )
      } else if (command.includes("chrome.permissions.getAll")) {
        addEntry(
          "info",
          JSON.stringify(
            {
              permissions: ["activeTab", "storage"],
              origins: [],
            },
            null,
            2,
          ),
          "chrome.permissions",
        )
      } else if (command.includes("chrome.action.setBadgeText")) {
        addEntry("info", "Badge text updated", "chrome.action")
      } else if (command.includes("chrome.notifications.create")) {
        addEntry("info", "Notification created with ID: notification_1", "chrome.notifications")
      } else {
        // Try to evaluate as JavaScript
        try {
          const result = eval(command)
          addEntry("info", typeof result === "object" ? JSON.stringify(result, null, 2) : String(result))
        } catch (error) {
          addEntry("error", `Error: ${error}`, undefined, (error as Error).stack)
        }
      }
    } catch (error) {
      addEntry("error", `Command failed: ${error}`)
    }

    setCommand("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCommand(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCommand("")
        } else {
          setHistoryIndex(newIndex)
          setCommand(commandHistory[newIndex])
        }
      }
    }
  }

  const clearConsole = () => {
    setEntries([])
    toast({
      title: "Console cleared",
      description: "All console entries have been removed",
    })
  }

  const exportLogs = () => {
    const logText = entries
      .map(
        (entry) =>
          `[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()}: ${entry.message}${
            entry.source ? ` (${entry.source})` : ""
          }`,
      )
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `console-logs-${new Date().toISOString().split("T")[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Logs exported",
      description: "Console logs have been downloaded",
    })
  }

  const copyEntry = (entry: ConsoleEntry) => {
    const text = `[${entry.timestamp.toLocaleTimeString()}] ${entry.level.toUpperCase()}: ${entry.message}`
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Console entry copied to clipboard",
    })
  }

  const startCapturing = () => {
    setIsCapturing(true)

    // Mock capturing real console logs
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    }

    console.log = (...args) => {
      originalConsole.log(...args)
      addEntry("log", args.join(" "), "console")
    }

    console.warn = (...args) => {
      originalConsole.warn(...args)
      addEntry("warn", args.join(" "), "console")
    }

    console.error = (...args) => {
      originalConsole.error(...args)
      addEntry("error", args.join(" "), "console")
    }

    console.info = (...args) => {
      originalConsole.info(...args)
      addEntry("info", args.join(" "), "console")
    }

    addEntry("info", "Console capturing started", "debug-console")

    toast({
      title: "Capturing started",
      description: "Now capturing console output",
    })
  }

  const stopCapturing = () => {
    setIsCapturing(false)
    addEntry("info", "Console capturing stopped", "debug-console")

    toast({
      title: "Capturing stopped",
      description: "Console capture has been disabled",
    })
  }

  const getEntryIcon = (level: ConsoleEntry["level"]) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      case "command":
        return <Terminal className="w-4 h-4 text-purple-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getEntryColor = (level: ConsoleEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      case "warn":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "command":
        return "text-purple-600 bg-purple-50 border-purple-200"
      default:
        return "text-green-600 bg-green-50 border-green-200"
    }
  }

  const filteredEntries = entries.filter((entry) => filter === "all" || entry.level === filter)

  const levelCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card className="border-retro-green/20 bg-retro-cream/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <Terminal className="w-5 h-5" />
            <span>Debug Console</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={isCapturing ? stopCapturing : startCapturing}
              variant="outline"
              size="sm"
              className={`font-mono ${
                isCapturing
                  ? "border-red-500 text-red-500 hover:bg-red-50"
                  : "border-retro-green text-retro-green hover:bg-retro-tan"
              }`}
            >
              {isCapturing ? "Stop Capture" : "Start Capture"}
            </Button>
            <Button
              onClick={exportLogs}
              variant="outline"
              size="sm"
              className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={clearConsole}
              variant="outline"
              size="sm"
              className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="font-mono">
            Total: {entries.length}
          </Badge>
          {levelCounts.error && (
            <Badge variant="destructive" className="font-mono">
              Errors: {levelCounts.error}
            </Badge>
          )}
          {levelCounts.warn && (
            <Badge variant="outline" className="font-mono text-yellow-600">
              Warnings: {levelCounts.warn}
            </Badge>
          )}
          {levelCounts.log && (
            <Badge variant="secondary" className="font-mono">
              Logs: {levelCounts.log}
            </Badge>
          )}
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-retro-green">Filter:</span>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32 border-retro-green/30 font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="log">Logs</SelectItem>
              <SelectItem value="warn">Warnings</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Console Output */}
        <ScrollArea
          ref={scrollAreaRef}
          className="h-64 border border-retro-green/20 rounded-lg p-3 bg-retro-beige/20 font-mono text-sm"
        >
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`mb-2 p-2 rounded border ${getEntryColor(entry.level)} group hover:shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  {getEntryIcon(entry.level)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs opacity-60">{entry.timestamp.toLocaleTimeString()}</span>
                      {entry.source && (
                        <Badge variant="outline" className="text-xs">
                          {entry.source}
                        </Badge>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{entry.message}</div>
                    {entry.stack && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer opacity-60 hover:opacity-100">Stack trace</summary>
                        <pre className="text-xs mt-1 opacity-60 whitespace-pre-wrap">{entry.stack}</pre>
                      </details>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => copyEntry(entry)}
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <div className="text-center py-8">
              <Terminal className="w-12 h-12 mx-auto text-retro-green/30 mb-2" />
              <p className="text-retro-green/50">
                {entries.length === 0
                  ? "Console is empty. Start capturing or run commands."
                  : "No entries match the current filter."}
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Command Input */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter JavaScript or Chrome API command..."
              className="flex-1 font-mono border-retro-green/30 focus:border-retro-tan"
            />
            <Button
              onClick={executeCommand}
              disabled={!command.trim()}
              className="bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono"
            >
              <Play className="w-4 h-4 mr-1" />
              Run
            </Button>
          </div>

          {/* Quick Commands */}
          <div className="flex flex-wrap gap-1">
            {CHROME_API_COMMANDS.slice(0, 4).map((cmd, index) => (
              <Button
                key={index}
                onClick={() => setCommand(cmd)}
                variant="outline"
                size="sm"
                className="text-xs font-mono border-retro-green/30 text-retro-green hover:bg-retro-tan"
              >
                {cmd.split("(")[0]}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-retro-beige/30 rounded-lg p-3">
          <p className="text-xs font-mono text-retro-green/70">
            💡 Debug console captures runtime errors and allows testing Chrome API calls. Use arrow keys to navigate
            command history.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
