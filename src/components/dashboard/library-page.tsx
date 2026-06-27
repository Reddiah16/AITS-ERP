"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Library, BookOpen, Plus, X, Search, ArrowLeftRight, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function LibraryPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [data, setData] = useState<{ books: any[]; issues: any[] }>({ books: [], issues: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"catalog" | "issues">("catalog")
  const [search, setSearch] = useState("")
  const [showAddBook, setShowAddBook] = useState(false)
  const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "", quantity: "1" })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/library")
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const saveBook = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookForm, quantity: parseInt(bookForm.quantity), type: "add_book" }),
      })
      if (res.ok) { toast.success("Book added!"); setShowAddBook(false); loadData() }
      else toast.error("Failed to add book")
    } catch { toast.error("Error") }
  }

  const returnBook = async (issueId: string) => {
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "return", issueId }),
      })
      if (res.ok) {
        const d = await res.json()
        toast.success(d.fine > 0 ? `Book returned. Fine: ₹${d.fine}` : "Book returned successfully")
        loadData()
      }
    } catch { toast.error("Failed to return book") }
  }

  const canManage = ["super_admin", "admin"].includes(role)
  const filtered = data.books.filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Library</h2>
          <p className="text-sm text-gray-500 mt-1">{data.books.length} books in catalog</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAddBook(!showAddBook)} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <Plus className="size-4 mr-2" />Add Book
          </Button>
        )}
      </div>

      {showAddBook && (
        <Card className="border border-[#1a3a6b]/20">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Add New Book</CardTitle>
              <button onClick={() => setShowAddBook(false)}><X className="size-4 text-gray-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="text-sm">Title *</Label><Input className="mt-1 h-10" value={bookForm.title} onChange={e => setBookForm(f => ({...f, title: e.target.value}))} required /></div>
              <div><Label className="text-sm">Author *</Label><Input className="mt-1 h-10" value={bookForm.author} onChange={e => setBookForm(f => ({...f, author: e.target.value}))} required /></div>
              <div><Label className="text-sm">ISBN</Label><Input className="mt-1 h-10" value={bookForm.isbn} onChange={e => setBookForm(f => ({...f, isbn: e.target.value}))} /></div>
              <div>
                <Label className="text-sm">Category</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={bookForm.category} onChange={e => setBookForm(f => ({...f, category: e.target.value}))}>
                  <option value="">Select</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div><Label className="text-sm">Quantity</Label><Input type="number" min="1" className="mt-1 h-10" value={bookForm.quantity} onChange={e => setBookForm(f => ({...f, quantity: e.target.value}))} /></div>
              <div className="flex items-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddBook(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">Add Book</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
        {(["catalog", "issues"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-white shadow-sm text-[#1a3a6b]" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "issues" ? `Current Issues (${data.issues.length})` : "Book Catalog"}
          </button>
        ))}
      </div>

      {activeTab === "catalog" && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input className="pl-9 h-9" placeholder="Search by title or author..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <Card key={i} className="border-0 shadow-sm h-28 animate-pulse bg-gray-100" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(book => (
                <Card key={book.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                      <BookOpen className="size-5 text-[#1a3a6b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-500">{book.author}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {book.category && <Badge variant="outline" className="text-xs">{book.category}</Badge>}
                        <Badge className={`text-xs border ${book.available > 0 ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                          {book.available}/{book.quantity} Available
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "issues" && (
        <div className="space-y-3">
          {data.issues.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><ArrowLeftRight className="size-10 mx-auto mb-3 opacity-20" /><p>No active issues</p></div>
          ) : data.issues.map(issue => {
            const isOverdue = new Date(issue.dueDate) < new Date()
            return (
              <Card key={issue.id} className={`border-0 shadow-sm ${isOverdue ? "border-l-4 border-l-red-400" : ""}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    {isOverdue && <AlertTriangle className="size-4 text-red-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="font-semibold text-gray-900">{issue.book?.title}</p>
                      <p className="text-sm text-gray-500">{issue.student?.user?.name}</p>
                      <p className="text-xs text-gray-400">Due: {new Date(issue.dueDate).toLocaleDateString("en-IN")}{isOverdue ? " — OVERDUE" : ""}</p>
                    </div>
                  </div>
                  {canManage && (
                    <Button size="sm" variant="outline" onClick={() => returnBook(issue.id)} className="border-[#1a3a6b]/30 text-[#1a3a6b]">
                      Return
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
