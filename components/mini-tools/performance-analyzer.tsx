"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap, Clock, HardDrive, Cpu } from "lucide-react"
import { motion } from "framer-motion"

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: "good" | "warning" | "critical"
  icon: React.ReactNode
}

export function PerformanceAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [overallScore, setOverallScore] = useState(0)

  const runAnalysis = () => {
    setIsAnalyzing(true)
    setMetrics([])
    setOverallScore(0)

    // Simulate performance analysis
    const analysisSteps = [
      { name: "Load Time", value: Math.random() * 2000 + 500, unit: "ms", icon: <Clock className="w-4 h-4" /> },
      { name: "Memory Usage", value: Math.random() * 50 + 10, unit: "MB", icon: <HardDrive className="w-4 h-4" /> },
      { name: "CPU Usage", value: Math.random() * 30 + 5, unit: "%", icon: <Cpu className="w-4 h-4" /> },
      { name: "Bundle Size", value: Math.random() * 500 + 100, unit: "KB", icon: <Activity className="w-4 h-4" /> },
      { name: "API Calls", value: Math.random() * 20 + 5, unit: "req/s", icon: <Zap className="w-4 h-4" /> },
    ]

    analysisSteps.forEach((step, index) => {
      setTimeout(
        () => {
          const status =
            step.value < (step.unit === "ms" ? 1000 : step.unit === "%" ? 20 : 200)
              ? "good"
              : step.value < (step.unit === "ms" ? 2000 : step.unit === "%" ? 40 : 400)
                ? "warning"
                : "critical"

          setMetrics((prev) => [...prev, { ...step, status }])

          if (index === analysisSteps.length - 1) {
            setIsAnalyzing(false)
            // Calculate overall score
            const avgScore =
              analysisSteps.reduce((acc, metric) => {
                const score =
                  metric.value < (metric.unit === "ms" ? 1000 : metric.unit === "%" ? 20 : 200)
                    ? 90
                    : metric.value < (metric.unit === "ms" ? 2000 : metric.unit === "%" ? 40 : 400)
                      ? 70
                      : 40
                return acc + score
              }, 0) / analysisSteps.length
            setOverallScore(avgScore)
          }
        },
        (index + 1) * 800,
      )
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-retro-green"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Good</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Warning</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="border-retro-green/20 bg-retro-cream/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <Activity className="w-5 h-5" />
            <span>Performance Analyzer</span>
          </CardTitle>
          {overallScore > 0 && (
            <Badge
              variant="outline"
              className={`font-mono ${overallScore >= 80 ? "border-green-500 text-green-700" : overallScore >= 60 ? "border-yellow-500 text-yellow-700" : "border-red-500 text-red-700"}`}
            >
              Score: {Math.round(overallScore)}/100
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono"
        >
          <Activity className="w-4 h-4 mr-2" />
          {isAnalyzing ? "Analyzing..." : "Run Performance Analysis"}
        </Button>

        {overallScore > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex justify-between text-sm font-mono text-retro-green">
              <span>Overall Performance</span>
              <span>{Math.round(overallScore)}%</span>
            </div>
            <Progress value={overallScore} className="h-3" />
          </motion.div>
        )}

        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-retro-beige/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={getStatusColor(metric.status)}>{metric.icon}</div>
                <div>
                  <p className="font-mono text-sm text-retro-green">{metric.name}</p>
                  <p className="font-mono text-xs text-retro-green/70">
                    {metric.value.toFixed(metric.unit === "ms" ? 0 : 1)} {metric.unit}
                  </p>
                </div>
              </div>
              {getStatusBadge(metric.status)}
            </motion.div>
          ))}
        </div>

        {metrics.length > 0 && (
          <div className="bg-retro-beige/30 rounded-lg p-3 space-y-2">
            <h4 className="font-mono text-sm text-retro-green font-semibold">Recommendations:</h4>
            <ul className="text-xs font-mono text-retro-green/70 space-y-1">
              <li>• Optimize images and assets for faster loading</li>
              <li>• Minimize API calls during initialization</li>
              <li>• Use lazy loading for non-critical components</li>
              <li>• Consider code splitting for large bundles</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
