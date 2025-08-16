"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Globe, Send, Clock, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"

interface ApiTest {
  id: string
  method: string
  url: string
  status: "pending" | "success" | "error"
  responseTime: number
  statusCode?: number
  response?: string
}

const CHROME_API_EXAMPLES = [
  { name: "Get Active Tab", code: "chrome.tabs.query({active: true, currentWindow: true})" },
  {
    name: "Create Notification",
    code: "chrome.notifications.create({type: 'basic', iconUrl: 'icon.png', title: 'Hello', message: 'World'})",
  },
  { name: "Get Storage", code: "chrome.storage.sync.get(['key'])" },
  { name: "Set Storage", code: "chrome.storage.sync.set({key: 'value'})" },
  {
    name: "Create Context Menu",
    code: "chrome.contextMenus.create({id: 'menu1', title: 'My Menu', contexts: ['selection']})",
  },
]

export function ApiTester() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState("")
  const [body, setBody] = useState("")
  const [tests, setTests] = useState<ApiTest[]>([])
  const [selectedExample, setSelectedExample] = useState("")

  const runApiTest = () => {
    if (!url.trim()) return

    const testId = Date.now().toString()
    const newTest: ApiTest = {
      id: testId,
      method,
      url,
      status: "pending",
      responseTime: 0,
    }

    setTests((prev) => [newTest, ...prev])

    // Simulate API call
    const startTime = Date.now()
    setTimeout(
      () => {
        const endTime = Date.now()
        const responseTime = endTime - startTime
        const isSuccess = Math.random() > 0.3 // 70% success rate

        setTests((prev) =>
          prev.map((test) =>
            test.id === testId
              ? {
                  ...test,
                  status: isSuccess ? "success" : "error",
                  responseTime,
                  statusCode: isSuccess ? 200 : 404,
                  response: isSuccess
                    ? JSON.stringify(
                        { message: "API call successful", data: { timestamp: new Date().toISOString() } },
                        null,
                        2,
                      )
                    : JSON.stringify({ error: "API call failed", message: "Endpoint not found" }, null, 2),
                }
              : test,
          ),
        )
      },
      Math.random() * 2000 + 500,
    )
  }

  const loadExample = (example: string) => {
    setUrl("chrome://extensions/")
    setMethod("POST")
    setBody(example)
    setSelectedExample(example)
  }

  const getStatusIcon = (status: ApiTest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: ApiTest["status"]) => {
    switch (status) {
      case "pending":
        return "border-yellow-300 text-yellow-700"
      case "success":
        return "border-green-300 text-green-700"
      case "error":
        return "border-red-300 text-red-700"
    }
  }

  return (
    <Card className="border-retro-green/20 bg-retro-cream/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
          <Globe className="w-5 h-5" />
          <span>API Tester</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-24 border-retro-green/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter API endpoint or Chrome API call"
                className="border-retro-green/30 focus:border-retro-tan"
              />
              <Button
                onClick={runApiTest}
                disabled={!url.trim()}
                className="bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-mono text-retro-green">Headers (JSON)</label>
              <Textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"Content-Type": "application/json"}'
                className="border-retro-green/30 focus:border-retro-tan font-mono text-sm"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-mono text-retro-green">Request Body</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Request body (JSON)"
                className="border-retro-green/30 focus:border-retro-tan font-mono text-sm"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-mono text-retro-green">Chrome API Examples</label>
              <div className="space-y-1">
                {CHROME_API_EXAMPLES.map((example, index) => (
                  <Button
                    key={index}
                    onClick={() => loadExample(example.code)}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-retro-green/30 text-retro-green hover:bg-retro-tan font-mono text-xs"
                  >
                    {example.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-mono text-retro-green">Test Results</label>
              <Badge variant="outline" className="font-mono">
                {tests.length} tests
              </Badge>
            </div>

            <ScrollArea className="h-[400px] border border-retro-green/20 rounded-lg p-3 bg-retro-beige/20">
              <div className="space-y-3">
                {tests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-retro-green/20 rounded-lg p-3 bg-retro-cream/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(test.status)}
                        <Badge className={`text-xs ${getStatusColor(test.status)}`}>{test.method}</Badge>
                        {test.statusCode && (
                          <Badge variant="outline" className="text-xs">
                            {test.statusCode}
                          </Badge>
                        )}
                      </div>
                      {test.responseTime > 0 && (
                        <span className="text-xs font-mono text-retro-green/70">{test.responseTime}ms</span>
                      )}
                    </div>

                    <p className="text-xs font-mono text-retro-green/80 mb-2 break-all">{test.url}</p>

                    {test.response && (
                      <div className="bg-black/5 rounded p-2 mt-2">
                        <pre className="text-xs font-mono text-retro-green/70 whitespace-pre-wrap">{test.response}</pre>
                      </div>
                    )}
                  </motion.div>
                ))}

                {tests.length === 0 && (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 mx-auto text-retro-green/30 mb-2" />
                    <p className="text-sm font-mono text-retro-green/50">No API tests yet. Run your first test!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="bg-retro-beige/30 rounded-lg p-3">
          <p className="text-xs font-mono text-retro-green/70">
            💡 Test Chrome extension APIs and external endpoints. Use the examples to quickly test common Chrome API
            calls.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
