"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  FileText,
  Shield,
  FolderOpen,
  Archive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import JSZip from "jszip"

interface ValidationResult {
  type: "error" | "warning" | "info"
  category: string
  message: string
  file?: string
  line?: number
  suggestion?: string
}

interface ExtensionFile {
  name: string
  path: string
  content: string | ArrayBuffer
  size: number
  type: string
}

interface ManifestData {
  name?: string
  version?: string
  manifest_version?: number
  description?: string
  permissions?: string[]
  icons?: { [key: string]: string }
  background?: any
  content_scripts?: any[]
  action?: any
  browser_action?: any
}

export function ExtensionPackager() {
  const [files, setFiles] = useState<ExtensionFile[]>([])
  const [manifest, setManifest] = useState<ManifestData | null>(null)
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isPackaging, setIsPackaging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
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
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const items = Array.from(e.dataTransfer.items)
      const extensionFiles: ExtensionFile[] = []

      for (const item of items) {
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry()
          if (entry) {
            await processEntry(entry, extensionFiles)
          }
        }
      }

      if (extensionFiles.length > 0) {
        setFiles(extensionFiles)
        await processManifest(extensionFiles)
        toast({
          title: "Extension loaded!",
          description: `Loaded ${extensionFiles.length} files`,
        })
      }
    },
    [toast],
  )

  const processEntry = async (entry: any, files: ExtensionFile[], path = ""): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => entry.file(resolve))
      const content = await readFileContent(file)
      files.push({
        name: entry.name,
        path: path + entry.name,
        content,
        size: file.size,
        type: file.type,
      })
    } else if (entry.isDirectory) {
      const reader = entry.createReader()
      const entries = await new Promise<any[]>((resolve) => {
        reader.readEntries(resolve)
      })
      for (const childEntry of entries) {
        await processEntry(childEntry, files, path + entry.name + "/")
      }
    }
  }

  const readFileContent = async (file: File): Promise<string | ArrayBuffer> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      if (
        file.type.startsWith("text/") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".css") ||
        file.name.endsWith(".html")
      ) {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsText(file)
      } else {
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const processManifest = async (extensionFiles: ExtensionFile[]) => {
    const manifestFile = extensionFiles.find((f) => f.name === "manifest.json")
    if (manifestFile && typeof manifestFile.content === "string") {
      try {
        const manifestData = JSON.parse(manifestFile.content)
        setManifest(manifestData)
      } catch (error) {
        console.error("Failed to parse manifest:", error)
      }
    }
  }

  const validateExtension = async () => {
    if (files.length === 0) {
      toast({
        title: "No files loaded",
        description: "Please upload an extension folder first",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)
    setProgress(0)
    const results: ValidationResult[] = []

    try {
      // Validate manifest
      await validateManifest(results)
      setProgress(25)

      // Validate file references
      await validateFileReferences(results)
      setProgress(50)

      // Validate permissions
      await validatePermissions(results)
      setProgress(75)

      // Static code analysis
      await performStaticAnalysis(results)
      setProgress(100)

      setValidationResults(results)

      const errors = results.filter((r) => r.type === "error").length
      const warnings = results.filter((r) => r.type === "warning").length

      toast({
        title: "Validation complete!",
        description: `Found ${errors} errors and ${warnings} warnings`,
        variant: errors > 0 ? "destructive" : "default",
      })
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "An error occurred during validation",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const validateManifest = async (results: ValidationResult[]) => {
    if (!manifest) {
      results.push({
        type: "error",
        category: "Manifest",
        message: "manifest.json not found",
        suggestion: "Create a manifest.json file in the root directory",
      })
      return
    }

    // Required fields
    const requiredFields = ["name", "version", "manifest_version"]
    for (const field of requiredFields) {
      if (!manifest[field as keyof ManifestData]) {
        results.push({
          type: "error",
          category: "Manifest",
          message: `Missing required field: ${field}`,
          file: "manifest.json",
          suggestion: `Add "${field}" field to manifest.json`,
        })
      }
    }

    // Manifest version check
    if (manifest.manifest_version && ![2, 3].includes(manifest.manifest_version)) {
      results.push({
        type: "error",
        category: "Manifest",
        message: "Invalid manifest_version. Must be 2 or 3",
        file: "manifest.json",
        suggestion: "Update manifest_version to 2 or 3",
      })
    }

    // Icons validation
    if (manifest.icons) {
      for (const [size, iconPath] of Object.entries(manifest.icons)) {
        const iconFile = files.find((f) => f.path === iconPath || f.name === iconPath)
        if (!iconFile) {
          results.push({
            type: "error",
            category: "Icons",
            message: `Icon file not found: ${iconPath}`,
            file: "manifest.json",
            suggestion: `Add the missing icon file or update the path in manifest.json`,
          })
        }
      }
    } else {
      results.push({
        type: "warning",
        category: "Icons",
        message: "No icons specified in manifest",
        file: "manifest.json",
        suggestion: "Add icons for better user experience",
      })
    }
  }

  const validateFileReferences = async (results: ValidationResult[]) => {
    if (!manifest) return

    // Check background scripts
    if (manifest.background) {
      const scripts = manifest.background.scripts || [manifest.background.service_worker]
      for (const script of scripts.filter(Boolean)) {
        const scriptFile = files.find((f) => f.path === script || f.name === script)
        if (!scriptFile) {
          results.push({
            type: "error",
            category: "Files",
            message: `Background script not found: ${script}`,
            file: "manifest.json",
            suggestion: "Add the missing script file or update the path",
          })
        }
      }
    }

    // Check content scripts
    if (manifest.content_scripts) {
      for (const contentScript of manifest.content_scripts) {
        const scripts = contentScript.js || []
        for (const script of scripts) {
          const scriptFile = files.find((f) => f.path === script || f.name === script)
          if (!scriptFile) {
            results.push({
              type: "error",
              category: "Files",
              message: `Content script not found: ${script}`,
              file: "manifest.json",
              suggestion: "Add the missing script file or update the path",
            })
          }
        }
      }
    }
  }

  const validatePermissions = async (results: ValidationResult[]) => {
    if (!manifest?.permissions) return

    const dangerousPermissions = ["<all_urls>", "http://*/*", "https://*/*", "tabs", "history", "bookmarks"]
    const unusedPermissions: string[] = []

    for (const permission of manifest.permissions) {
      if (dangerousPermissions.includes(permission)) {
        results.push({
          type: "warning",
          category: "Security",
          message: `Potentially dangerous permission: ${permission}`,
          file: "manifest.json",
          suggestion: "Consider using more specific permissions if possible",
        })
      }

      // Check if permission is actually used (basic check)
      const isUsed = files.some(
        (file) =>
          (typeof file.content === "string" && file.content.includes(`chrome.${permission}`)) ||
          file.content.includes(`browser.${permission}`),
      )

      if (!isUsed && !["storage", "activeTab"].includes(permission)) {
        unusedPermissions.push(permission)
      }
    }

    if (unusedPermissions.length > 0) {
      results.push({
        type: "warning",
        category: "Permissions",
        message: `Potentially unused permissions: ${unusedPermissions.join(", ")}`,
        file: "manifest.json",
        suggestion: "Remove unused permissions to improve security",
      })
    }
  }

  const performStaticAnalysis = async (results: ValidationResult[]) => {
    const jsFiles = files.filter((f) => f.name.endsWith(".js") && typeof f.content === "string")

    for (const file of jsFiles) {
      const content = file.content as string
      const lines = content.split("\n")

      // Check for debug statements
      lines.forEach((line, index) => {
        if (line.includes("console.log") || line.includes("alert(") || line.includes("debugger")) {
          results.push({
            type: "warning",
            category: "Code Quality",
            message: "Debug statement found",
            file: file.path,
            line: index + 1,
            suggestion: "Remove debug statements for production",
          })
        }
      })

      // Check for unhandled promises
      if (content.includes("Promise") && !content.includes(".catch")) {
        results.push({
          type: "warning",
          category: "Code Quality",
          message: "Potential unhandled promise",
          file: file.path,
          suggestion: "Add .catch() handlers to promises",
        })
      }

      // Check for missing event listeners cleanup
      if (content.includes("addEventListener") && !content.includes("removeEventListener")) {
        results.push({
          type: "info",
          category: "Code Quality",
          message: "Consider cleaning up event listeners",
          file: file.path,
          suggestion: "Remove event listeners when no longer needed",
        })
      }
    }
  }

  const packageExtension = async () => {
    if (!manifest || validationResults.filter((r) => r.type === "error").length > 0) {
      toast({
        title: "Cannot package",
        description: "Fix all errors before packaging",
        variant: "destructive",
      })
      return
    }

    setIsPackaging(true)
    setProgress(0)

    try {
      const zip = new JSZip()

      for (const file of files) {
        if (typeof file.content === "string") {
          zip.file(file.path, file.content)
        } else {
          zip.file(file.path, file.content)
        }
        setProgress((files.indexOf(file) / files.length) * 100)
      }

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const zipUrl = URL.createObjectURL(zipBlob)

      const link = document.createElement("a")
      link.href = zipUrl
      link.download = `${manifest.name?.replace(/\s+/g, "_") || "extension"}_${manifest.version || "1.0"}.zip`
      link.click()

      URL.revokeObjectURL(zipUrl)

      toast({
        title: "Extension packaged!",
        description: "Your extension is ready for distribution",
      })
    } catch (error) {
      toast({
        title: "Packaging failed",
        description: "An error occurred while creating the package",
        variant: "destructive",
      })
    } finally {
      setIsPackaging(false)
      setProgress(0)
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const errorCount = validationResults.filter((r) => r.type === "error").length
  const warningCount = validationResults.filter((r) => r.type === "warning").length
  const infoCount = validationResults.filter((r) => r.type === "info").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-retro-green/20 bg-retro-cream/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <Package className="w-5 h-5" />
            <span>Extension Packager & Validator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-retro-green/70 font-mono">
            Upload your extension folder to validate structure, permissions, and package for distribution
          </p>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="border-retro-green/20 bg-retro-cream/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
            <Upload className="w-5 h-5" />
            <span>Upload Extension</span>
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
              <FolderOpen className="w-12 h-12 mx-auto text-retro-green/50" />
              <div>
                <p className="text-retro-green font-mono">Drag & drop extension folder here</p>
                <p className="text-sm text-retro-green/60 font-mono">or click to browse</p>
              </div>
              <Button
                variant="outline"
                onClick={() => folderInputRef.current?.click()}
                className="border-retro-green text-retro-green hover:bg-retro-tan font-mono"
              >
                Browse Folder
              </Button>
            </motion.div>
          </div>

          <input
            ref={folderInputRef}
            type="file"
            multiple
            // @ts-ignore
            webkitdirectory=""
            onChange={(e) => {
              if (e.target.files) {
                // Handle folder upload
                console.log("Folder selected:", e.target.files)
              }
            }}
            className="hidden"
          />

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-mono text-retro-green">
                  Loaded {files.length} files
                  {manifest && (
                    <span className="ml-2 text-retro-tan">
                      • {manifest.name} v{manifest.version}
                    </span>
                  )}
                </p>
                <div className="space-x-2">
                  <Button
                    onClick={validateExtension}
                    disabled={isValidating}
                    className="bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {isValidating ? "Validating..." : "Validate"}
                  </Button>
                  <Button
                    onClick={packageExtension}
                    disabled={isPackaging || errorCount > 0}
                    className="bg-retro-green hover:bg-retro-green/80 text-retro-cream font-mono"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    {isPackaging ? "Packaging..." : "Package"}
                  </Button>
                </div>
              </div>

              {(isValidating || isPackaging) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-retro-green font-mono">
                    {isValidating ? "Validating" : "Packaging"}... {Math.round(progress)}%
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Validation Results */}
      <AnimatePresence>
        {validationResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="border-retro-green/20 bg-retro-cream/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
                    <FileText className="w-5 h-5" />
                    <span>Validation Results</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    {errorCount > 0 && (
                      <Badge variant="destructive" className="font-mono">
                        {errorCount} Errors
                      </Badge>
                    )}
                    {warningCount > 0 && (
                      <Badge variant="secondary" className="font-mono bg-yellow-100 text-yellow-800">
                        {warningCount} Warnings
                      </Badge>
                    )}
                    {infoCount > 0 && (
                      <Badge variant="outline" className="font-mono">
                        {infoCount} Info
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {validationResults.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border ${getResultColor(result.type)}`}
                      >
                        <div className="flex items-start space-x-3">
                          {getResultIcon(result.type)}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {result.category}
                              </Badge>
                              {result.file && (
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {result.file}
                                  {result.line && `:${result.line}`}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-mono text-gray-800">{result.message}</p>
                            {result.suggestion && (
                              <p className="text-xs font-mono text-gray-600 italic">💡 {result.suggestion}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Package Status */}
      {validationResults.length > 0 && (
        <Card className="border-retro-green/20 bg-retro-cream/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {errorCount === 0 ? (
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <p className="text-retro-green font-mono font-semibold">✅ Extension ready for packaging!</p>
                  <p className="text-sm text-retro-green/70 font-mono">
                    All critical issues resolved. You can now package your extension.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="w-12 h-12 mx-auto text-red-500" />
                  <p className="text-retro-green font-mono font-semibold">❌ Fix errors before packaging</p>
                  <p className="text-sm text-retro-green/70 font-mono">
                    Resolve all errors to create a valid extension package.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
