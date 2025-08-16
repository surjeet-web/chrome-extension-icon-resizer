"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ManifestData {
  name: string
  version: string
  description: string
  manifestVersion: "2" | "3"
  permissions: string[]
  hostPermissions: string[]
  actionType: "browser_action" | "page_action" | "action"
  popupHtml: string
  backgroundScript: string
  contentScripts: boolean
  optionsPage: boolean
}

const COMMON_PERMISSIONS = [
  "activeTab",
  "storage",
  "tabs",
  "cookies",
  "history",
  "bookmarks",
  "downloads",
  "notifications",
  "contextMenus",
  "webRequest",
  "webRequestBlocking",
  "identity",
  "management",
]

export function ManifestGenerator() {
  const [manifestData, setManifestData] = useState<ManifestData>({
    name: "My Chrome Extension",
    version: "1.0.0",
    description: "A powerful Chrome extension",
    manifestVersion: "3",
    permissions: ["activeTab", "storage"],
    hostPermissions: [],
    actionType: "action",
    popupHtml: "popup.html",
    backgroundScript: "background.js",
    contentScripts: false,
    optionsPage: false,
  })

  const [generatedManifest, setGeneratedManifest] = useState("")
  const { toast } = useToast()

  const generateManifest = () => {
    const manifest: any = {
      manifest_version: Number.parseInt(manifestData.manifestVersion),
      name: manifestData.name,
      version: manifestData.version,
      description: manifestData.description,
      permissions: manifestData.permissions,
    }

    // Add host permissions for Manifest V3
    if (manifestData.manifestVersion === "3" && manifestData.hostPermissions.length > 0) {
      manifest.host_permissions = manifestData.hostPermissions
    }

    // Add action/browser_action
    if (manifestData.popupHtml) {
      const actionKey = manifestData.manifestVersion === "3" ? "action" : manifestData.actionType
      manifest[actionKey] = {
        default_popup: manifestData.popupHtml,
        default_title: manifestData.name,
      }
    }

    // Add background script
    if (manifestData.backgroundScript) {
      if (manifestData.manifestVersion === "3") {
        manifest.background = {
          service_worker: manifestData.backgroundScript,
        }
      } else {
        manifest.background = {
          scripts: [manifestData.backgroundScript],
          persistent: false,
        }
      }
    }

    // Add content scripts
    if (manifestData.contentScripts) {
      manifest.content_scripts = [
        {
          matches: ["<all_urls>"],
          js: ["content.js"],
        },
      ]
    }

    // Add options page
    if (manifestData.optionsPage) {
      manifest.options_page = "options.html"
    }

    const formatted = JSON.stringify(manifest, null, 2)
    setGeneratedManifest(formatted)

    toast({
      title: "Manifest generated!",
      description: `Manifest v${manifestData.manifestVersion} created successfully`,
    })
  }

  const copyManifest = () => {
    navigator.clipboard.writeText(generatedManifest)
    toast({
      title: "Manifest copied!",
      description: "Manifest has been copied to clipboard",
    })
  }

  const downloadManifest = () => {
    const blob = new Blob([generatedManifest], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "manifest.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const togglePermission = (permission: string) => {
    setManifestData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  return (
    <Card className="border-retro-green/20 bg-retro-cream/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-retro-green font-mono">
          <FileText className="w-5 h-5" />
          <span>Manifest Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-mono text-retro-green">Extension Name</label>
              <Input
                value={manifestData.name}
                onChange={(e) => setManifestData((prev) => ({ ...prev, name: e.target.value }))}
                className="border-retro-green/30 focus:border-retro-tan"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-mono text-retro-green">Version</label>
                <Input
                  value={manifestData.version}
                  onChange={(e) => setManifestData((prev) => ({ ...prev, version: e.target.value }))}
                  className="border-retro-green/30 focus:border-retro-tan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-mono text-retro-green">Manifest Version</label>
                <Select
                  value={manifestData.manifestVersion}
                  onValueChange={(value: "2" | "3") => setManifestData((prev) => ({ ...prev, manifestVersion: value }))}
                >
                  <SelectTrigger className="border-retro-green/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Manifest V3 (Recommended)</SelectItem>
                    <SelectItem value="2">Manifest V2 (Legacy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-mono text-retro-green">Description</label>
              <Textarea
                value={manifestData.description}
                onChange={(e) => setManifestData((prev) => ({ ...prev, description: e.target.value }))}
                className="border-retro-green/30 focus:border-retro-tan"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-mono text-retro-green">Permissions</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {COMMON_PERMISSIONS.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      checked={manifestData.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <label className="text-xs font-mono text-retro-green">{permission}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={manifestData.contentScripts}
                  onCheckedChange={(checked) => setManifestData((prev) => ({ ...prev, contentScripts: !!checked }))}
                />
                <label className="text-sm font-mono text-retro-green">Include Content Scripts</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={manifestData.optionsPage}
                  onCheckedChange={(checked) => setManifestData((prev) => ({ ...prev, optionsPage: !!checked }))}
                />
                <label className="text-sm font-mono text-retro-green">Include Options Page</label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-mono text-retro-green">Generated Manifest</label>
              <Textarea
                value={generatedManifest}
                readOnly
                className="min-h-[300px] font-mono text-sm border-retro-green/30 bg-retro-beige/20"
                placeholder="Click 'Generate Manifest' to see the result..."
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={generateManifest}
                className="bg-retro-tan hover:bg-retro-tan/80 text-retro-green font-mono"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Manifest
              </Button>

              {generatedManifest && (
                <>
                  <Button
                    onClick={copyManifest}
                    variant="outline"
                    className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={downloadManifest}
                    variant="outline"
                    className="border-retro-green text-retro-green hover:bg-retro-tan font-mono bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-retro-beige/30 rounded-lg p-3">
          <p className="text-xs font-mono text-retro-green/70">
            💡 Manifest V3 is the latest standard with enhanced security and performance. Use V2 only for legacy
            compatibility.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
