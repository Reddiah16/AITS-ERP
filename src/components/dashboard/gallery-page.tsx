"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image, Plus, X, Camera, Filter } from "lucide-react"
import { toast } from "sonner"

const categories = ["campus", "events", "department", "sports"]

const categoryColors: Record<string, string> = {
  campus: "bg-blue-100 text-blue-700",
  events: "bg-amber-100 text-amber-700",
  department: "bg-green-100 text-green-700",
  sports: "bg-red-100 text-red-700",
}

// Placeholder colored SVG images for demo
const placeholderImages: Record<string, string> = {
  campus: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhM2E2YiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYW1wdXM8L3RleHQ+PC9zdmc+",
  events: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1YTYyMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FdmVudHM8L3RleHQ+PC9zdmc+",
  department: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE2YTM0YSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZXB0LjwvdGV4dD48L3N2Zz4=",
  sports: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2RjMjYyNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TcG9ydHM8L3RleHQ+PC9zdmc+",
}

export function GalleryPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", category: "campus", imageUrl: "" })

  useEffect(() => { loadImages() }, [filterCat])

  const loadImages = async () => {
    setLoading(true)
    try {
      const url = filterCat ? `/api/gallery?category=${filterCat}` : "/api/gallery"
      const res = await fetch(url)
      if (res.ok) setImages((await res.json()).images || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const saveImage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success("Image added to gallery"); setShowForm(false); loadImages() }
      else toast.error("Failed to add image")
    } catch { toast.error("Error") }
  }

  const canManage = ["super_admin", "admin", "hod"].includes(role)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-500 mt-1">AITS Rajampet campus photo gallery</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <Plus className="size-4 mr-2" />Add Photo
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border border-[#1a3a6b]/20">
          <CardContent className="pt-5">
            <form onSubmit={saveImage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="text-sm">Title *</Label><Input className="mt-1 h-10" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required /></div>
              <div>
                <Label className="text-sm">Category</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                  {categories.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Image URL</Label>
                <Input className="mt-1 h-10" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(f => ({...f, imageUrl: e.target.value}))} required />
              </div>
              <div className="md:col-span-2"><Label className="text-sm">Description</Label><Input className="mt-1 h-10" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">Add to Gallery</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!filterCat ? "bg-[#1a3a6b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${filterCat === cat ? "bg-[#1a3a6b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >{cat}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />)}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Camera className="size-12 mx-auto mb-3 opacity-20" />
          <p>No photos in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <img
                src={placeholderImages[img.category] || img.imageUrl}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={e => { (e.target as HTMLImageElement).src = placeholderImages[img.category] || placeholderImages.campus }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-semibold truncate">{img.title}</p>
                  <Badge className={`text-[10px] border ${categoryColors[img.category] || "bg-gray-100 text-gray-600"} mt-1`}>{img.category}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
