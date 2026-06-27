"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle, Shield, BookOpen, Users, Award } from "lucide-react"

interface Credential {
  role: string
  id: string
  password: string
  color: string
}

const demoCredentials: Credential[] = [
  { role: "Super Admin", id: "superadmin@aits.ac.in", password: "SuperAdmin@123", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { role: "Admin", id: "admin@aits.ac.in", password: "Admin@123", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { role: "HOD", id: "dr.sharma@aits.ac.in", password: "Faculty@123", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { role: "Faculty", id: "prof.anand@aits.ac.in", password: "Faculty@123", color: "bg-green-100 text-green-800 border-green-200" },
  { role: "Student", id: "22B21A0501", password: "Student@123", color: "bg-sky-100 text-sky-800 border-sky-200" },
]

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !password) return
    setLoading(true)
    setError("")
    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })
      if (result?.error) {
        if (result.error === "PENDING_APPROVAL") {
          setError("Your account is pending approval from the administrator.")
        } else {
          setError("Invalid credentials. Please check your email/roll number/employee ID and password.")
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (cred: Credential) => {
    setIdentifier(cred.id)
    setPassword(cred.password)
    setError("")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a3a6b] via-[#1e4d8c] to-[#0d2547] relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f5a623]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 bg-[#f5a623] rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AITS Rajampet</h1>
              <p className="text-blue-200 text-sm">ERP Management System</p>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Annamacharya Institute of Technology & Sciences
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              A centralized platform for managing all academic, administrative, and departmental operations.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <GraduationCap className="size-5" />, label: "Students", value: "5000+" },
              { icon: <Users className="size-5" />, label: "Faculty", value: "250+" },
              { icon: <BookOpen className="size-5" />, label: "Departments", value: "6" },
              { icon: <Award className="size-5" />, label: "Accreditation", value: "NAAC A+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-[#f5a623] mb-1">{stat.icon}</div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-300 text-sm">
            Rajampet, Kadapa District, Andhra Pradesh — Affiliated to JNTU Anantapur
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1a3a6b] rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">AITS Rajampet ERP</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "login" ? "bg-white text-[#1a3a6b] shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "register" ? "bg-white text-[#1a3a6b] shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Register
            </button>
          </div>

          {activeTab === "login" ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 mt-1">Sign in to access the AITS ERP portal</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                    Email / Roll Number / Employee ID
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="e.g. student@aits.ac.in or 22B21A0501"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="h-11 border-gray-200 focus:border-[#1a3a6b] focus:ring-[#1a3a6b]/20"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10 border-gray-200 focus:border-[#1a3a6b] focus:ring-[#1a3a6b]/20"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    <AlertCircle className="size-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !identifier || !password}
                  className="w-full h-11 bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white font-semibold rounded-lg transition-all"
                >
                  {loading ? <><Loader2 className="size-4 animate-spin mr-2" />Signing in...</> : "Sign In"}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="size-3.5 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Demo Credentials</p>
                </div>
                <div className="space-y-2">
                  {demoCredentials.map((cred) => (
                    <button
                      key={cred.role}
                      onClick={() => fillCredentials(cred)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-white hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] px-2 py-0 border ${cred.color}`}>{cred.role}</Badge>
                        <span className="text-xs text-gray-500 font-mono">{cred.id}</span>
                      </div>
                      <span className="text-xs text-[#1a3a6b] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to fill →</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <RegisterForm onBackToLogin={() => setActiveTab("login")} />
          )}
        </div>
      </div>
    </div>
  )
}

function RegisterForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "student", rollNumber: "", employeeId: "", phone: "",
    departmentId: "", secretCode: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [departments, setDepartments] = useState<any[]>([])

  useState(() => {
    fetch("/api/departments").then(r => r.json()).then(d => setDepartments(d.departments || []))
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message)
      } else {
        setError(data.error)
      }
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Award className="size-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Registration Submitted!</h3>
        <p className="text-gray-500">{success}</p>
        <Button onClick={onBackToLogin} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">Back to Sign In</Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-1">Register for AITS ERP access</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label className="text-sm">Full Name</Label>
          <Input className="h-10 mt-1" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
        </div>
        <div>
          <Label className="text-sm">Email</Label>
          <Input className="h-10 mt-1" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
        </div>
        <div>
          <Label className="text-sm">Register As</Label>
          <select
            className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
            value={form.role}
            onChange={e => setForm(f => ({...f, role: e.target.value}))}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty (requires approval)</option>
            <option value="hod">HOD (requires approval)</option>
          </select>
        </div>
        {form.role === "student" && (
          <div>
            <Label className="text-sm">Roll Number</Label>
            <Input className="h-10 mt-1" placeholder="e.g. 22B21A0501" value={form.rollNumber} onChange={e => setForm(f => ({...f, rollNumber: e.target.value}))} />
          </div>
        )}
        {(form.role === "faculty" || form.role === "hod") && (
          <>
            <div>
              <Label className="text-sm">Employee ID</Label>
              <Input className="h-10 mt-1" placeholder="e.g. EMP001" value={form.employeeId} onChange={e => setForm(f => ({...f, employeeId: e.target.value}))} />
            </div>
            <div>
              <Label className="text-sm">Registration Code</Label>
              <Input className="h-10 mt-1" type="password" placeholder="Provided by administration" value={form.secretCode} onChange={e => setForm(f => ({...f, secretCode: e.target.value}))} />
            </div>
          </>
        )}
        <div>
          <Label className="text-sm">Department</Label>
          <select
            className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
            value={form.departmentId}
            onChange={e => setForm(f => ({...f, departmentId: e.target.value}))}
          >
            <option value="">Select department</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-sm">Password</Label>
          <Input className="h-10 mt-1" type="password" placeholder="Create password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
        </div>
        <div>
          <Label className="text-sm">Confirm Password</Label>
          <Input className="h-10 mt-1" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={e => setForm(f => ({...f, confirmPassword: e.target.value}))} required />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <AlertCircle className="size-4 mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full h-11 bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white font-semibold">
          {loading ? <><Loader2 className="size-4 animate-spin mr-2" />Creating Account...</> : "Create Account"}
        </Button>
        <button type="button" onClick={onBackToLogin} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
          Already have an account? Sign in
        </button>
      </form>
    </>
  )
}
