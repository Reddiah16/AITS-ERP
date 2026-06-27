"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Building2, Calendar, MapPin, IndianRupee, CheckCircle, Clock, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  ongoing: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
}

const appStatusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-amber-100 text-amber-700",
  selected: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export function PlacementPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [data, setData] = useState<{ companies: any[]; drives: any[] }>({ companies: [], drives: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"drives" | "companies">("drives")
  const [showAddDrive, setShowAddDrive] = useState(false)
  const [form, setForm] = useState({ title: "", companyId: "", driveDate: "", eligibility: "", ctcOffered: "", location: "", type: "drive" })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/placement")
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const applyForDrive = async (driveId: string) => {
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "apply", driveId }),
      })
      if (res.ok) { toast.success("Applied successfully!"); loadData() }
      else { const d = await res.json(); toast.error(d.error || "Already applied") }
    } catch { toast.error("Failed to apply") }
  }

  const saveDrive = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "drive" }),
      })
      if (res.ok) { toast.success("Drive added"); setShowAddDrive(false); loadData() }
      else toast.error("Failed to add drive")
    } catch { toast.error("Error") }
  }

  const isStudent = role === "student"
  const canManage = ["super_admin", "admin"].includes(role)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Placement</h2>
          <p className="text-sm text-gray-500 mt-1">{data.drives.length} placement drives | {data.companies.length} companies</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAddDrive(!showAddDrive)} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <Plus className="size-4 mr-2" />Add Drive
          </Button>
        )}
      </div>

      {showAddDrive && (
        <Card className="border border-[#1a3a6b]/20">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Add Placement Drive</CardTitle>
              <button onClick={() => setShowAddDrive(false)}><X className="size-4 text-gray-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveDrive} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Company</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={form.companyId} onChange={e => setForm(f => ({...f, companyId: e.target.value}))} required>
                  <option value="">Select company</option>
                  {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><Label className="text-sm">Drive Title</Label><Input className="mt-1 h-10" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required /></div>
              <div><Label className="text-sm">Drive Date</Label><Input type="date" className="mt-1 h-10" value={form.driveDate} onChange={e => setForm(f => ({...f, driveDate: e.target.value}))} required /></div>
              <div><Label className="text-sm">CTC Offered</Label><Input className="mt-1 h-10" placeholder="e.g. 4.5 LPA" value={form.ctcOffered} onChange={e => setForm(f => ({...f, ctcOffered: e.target.value}))} /></div>
              <div><Label className="text-sm">Location</Label><Input className="mt-1 h-10" placeholder="Online / Hyderabad" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} /></div>
              <div><Label className="text-sm">Eligibility</Label><Input className="mt-1 h-10" placeholder="e.g. CGPA >= 7.0" value={form.eligibility} onChange={e => setForm(f => ({...f, eligibility: e.target.value}))} /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAddDrive(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">Add Drive</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
        {(["drives", "companies"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-white shadow-sm text-[#1a3a6b]" : "text-gray-500 hover:text-gray-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "drives" && (
        loading ? <div className="grid gap-4">{[...Array(3)].map((_, i) => <Card key={i} className="border-0 shadow-sm h-40 animate-pulse bg-gray-100" />)}</div> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.drives.map(drive => (
              <Card key={drive.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center">
                        <Building2 className="size-5 text-[#1a3a6b]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{drive.company?.name}</h3>
                        <p className="text-sm text-gray-500">{drive.title}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs border ${statusColors[drive.status]}`}>{drive.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1"><Calendar className="size-3" />{new Date(drive.driveDate).toLocaleDateString("en-IN")}</div>
                    {drive.location && <div className="flex items-center gap-1"><MapPin className="size-3" />{drive.location}</div>}
                    {drive.ctcOffered && <div className="flex items-center gap-1"><IndianRupee className="size-3" />{drive.ctcOffered}</div>}
                    <div className="flex items-center gap-1"><Briefcase className="size-3" />{drive._count?.applications || 0} applied</div>
                  </div>
                  {drive.eligibility && <p className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded">Eligibility: {drive.eligibility}</p>}
                  {isStudent && drive.status !== "completed" && (
                    <Button size="sm" onClick={() => applyForDrive(drive.id)} className="w-full bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white h-8 text-xs">
                      Apply Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === "companies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.companies.map(company => (
            <Card key={company.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Building2 className="size-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.industry || "IT Services"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
