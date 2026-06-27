"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  Settings,
  ImageIcon,
  Save,
} from "lucide-react"

export function CmsPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [activeTab, setActiveTab] = useState<"banners" | "settings">("banners")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    title: "", subtitle: "", imageUrl: "", isActive: true, order: 0,
  })

  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({})

  const fetchBanners = useCallback(async () => {
    setLoadingBanners(true)
    try {
      const res = await fetch("/api/cms/banners")
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch {
      // Ignore
    } finally {
      setLoadingBanners(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true)
    try {
      const res = await fetch("/api/cms/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setSettingsForm(data)
      }
    } catch {
      // Ignore
    } finally {
      setLoadingSettings(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
    fetchSettings()
  }, [fetchBanners, fetchSettings])

  const handleBannerSubmit = async () => {
    try {
      const res = await fetch("/api/cms/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success("Banner created successfully")
        setDialogOpen(false)
        setForm({ title: "", subtitle: "", imageUrl: "", isActive: true, order: 0 })
        fetchBanners()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to create banner")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return
    try {
      const res = await fetch(`/api/cms/banners/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Banner deleted successfully")
        fetchBanners()
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const toggleBanner = async (banner: any) => {
    try {
      const res = await fetch(`/api/cms/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      })
      if (res.ok) {
        toast.success(`Banner ${banner.isActive ? "disabled" : "enabled"}`)
        fetchBanners()
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleSettingsSave = async () => {
    try {
      const res = await fetch("/api/cms/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      })
      if (res.ok) {
        toast.success("Settings saved successfully")
        fetchSettings()
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Content Management</h2>
          <p className="text-sm text-gray-500">Manage banners and site settings</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "banners" ? "default" : "outline"}
          size="sm"
          className={activeTab === "banners" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          onClick={() => setActiveTab("banners")}
        >
          <ImageIcon className="size-4" />
          Banners
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "outline"}
          size="sm"
          className={activeTab === "settings" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          onClick={() => setActiveTab("settings")}
        >
          <Settings className="size-4" />
          Settings
        </Button>
      </div>

      {activeTab === "banners" && (
        <>
          <div className="flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                  <Plus className="size-4" />
                  Add Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Banner</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Banner title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Banner subtitle" />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL *</Label>
                    <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Order</Label>
                      <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Active</Label>
                      <div className="flex items-center h-9">
                        <Badge
                          className={`cursor-pointer ${form.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}
                          variant="outline"
                          onClick={() => setForm({ ...form, isActive: !form.isActive })}
                        >
                          {form.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleBannerSubmit}>Create Banner</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loadingBanners ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : banners.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <ImageIcon className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No banners</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => (
                <Card key={banner.id} className={`border-0 shadow-sm overflow-hidden ${!banner.isActive ? "opacity-60" : ""}`}>
                  <div className="h-32 bg-gray-100 relative">
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="size-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-500 mt-0.5">{banner.subtitle}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs cursor-pointer ${banner.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`} variant="outline" onClick={() => toggleBanner(banner)}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-gray-400">Order: {banner.order}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="size-7 text-red-500 hover:text-red-700" onClick={() => handleDeleteBanner(banner.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "settings" && (
        <>
          {loadingSettings ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="size-4 text-emerald-600" />
                  Site Settings
                </CardTitle>
                <CardDescription>Configure your site settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settingsForm).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 items-center">
                    <Label className="text-sm text-gray-600 capitalize col-span-1">
                      {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}
                    </Label>
                    <Input
                      value={value}
                      onChange={(e) => setSettingsForm({ ...settingsForm, [key]: e.target.value })}
                      className="col-span-2"
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSettingsSave}>
                    <Save className="size-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
