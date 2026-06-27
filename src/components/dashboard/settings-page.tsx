"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save } from "lucide-react"
import { toast } from "sonner"

export function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/cms/settings").then(r => r.json()).then(d => {
      const map: Record<string, string> = {}
      if (d.settings) d.settings.forEach((s: any) => { map[s.key] = s.value })
      setSettings(map)
    }).finally(() => setLoading(false))
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/cms/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) toast.success("Settings saved successfully")
      else toast.error("Failed to save settings")
    } catch { toast.error("Error saving settings") }
    finally { setSaving(false) }
  }

  const fields = [
    { key: "college_name", label: "College Name" },
    { key: "college_short_name", label: "Short Name" },
    { key: "college_address", label: "Address" },
    { key: "college_phone", label: "Phone" },
    { key: "college_email", label: "Email" },
    { key: "college_website", label: "Website" },
    { key: "college_affiliation", label: "Affiliation" },
    { key: "college_accreditation", label: "Accreditation" },
    { key: "current_academic_year", label: "Academic Year" },
    { key: "current_semester", label: "Current Semester" },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure AITS ERP system settings</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
          <Save className="size-4 mr-2" />{saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="size-4 text-[#1a3a6b]" />College Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(field => (
                <div key={field.key}>
                  <Label className="text-sm text-gray-600">{field.label}</Label>
                  <Input
                    className="mt-1 h-10"
                    value={settings[field.key] || ""}
                    onChange={e => setSettings(s => ({...s, [field.key]: e.target.value}))}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
