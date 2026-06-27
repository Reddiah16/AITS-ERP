"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Brain, Send, Bot, User, Sparkles, AlertCircle, Loader2, ArrowRight
} from "lucide-react"

interface Message {
  sender: "bot" | "user"
  text: string
  timestamp: Date
}

export function AiAssistantPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || "student"
  const userName = session?.user?.name || "User"
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: `Hello ${userName}! I am your AITS Rajampet ERP AI Assistant. I can help answer queries about your attendance requirements, marks, placement drives, library books, and catalog. What would you like to know?`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { sender: "user", text: userMsg, timestamp: new Date() }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { sender: "bot", text: data.reply, timestamp: new Date() }])
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I had trouble processing that query. Please try again.", timestamp: new Date() }])
      }
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "Network error. Please make sure your server is online.", timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQueries = [
    "What is the attendance limit?",
    "Where can I see my internal marks?",
    "Tell me about the TCS NQT placement drive",
    "What are the library book issue rules?"
  ]

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="size-6 text-[#1a3a6b]" /> AI Support Assistant
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Interactive AI Help Desk for AITS Rajampet Students & Faculty
          </p>
        </div>
        <Badge className="bg-[#1a3a6b]/10 text-[#1a3a6b] border-[#1a3a6b]/30 px-3 py-1 flex items-center gap-1">
          <Sparkles className="size-3.5" /> 24/7 AI Desk
        </Badge>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg, index) => {
          const isBot = msg.sender === "bot"
          return (
            <div key={index} className={`flex items-start gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isBot ? "bg-[#1a3a6b] text-white" : "bg-[#f5a623] text-white"}`}>
                {isBot ? <Bot className="size-4" /> : <User className="size-4" />}
              </div>
              <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm ${isBot ? "bg-white border border-gray-100 text-gray-900" : "bg-[#1a3a6b] text-white"}`}>
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                <p className={`text-[10px] mt-1.5 text-right ${isBot ? "text-gray-400" : "text-blue-200"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div className="max-w-[75%] p-3.5 rounded-2xl bg-white border border-gray-100 text-gray-400 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="py-2.5">
          <p className="text-xs text-gray-400 font-medium mb-2">Suggested queries:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map(query => (
              <button
                key={query}
                onClick={() => setInput(query)}
                className="text-xs bg-gray-100 text-gray-600 hover:bg-[#1a3a6b]/5 hover:text-[#1a3a6b] px-3 py-1.5 rounded-full border border-gray-200/50 transition-colors flex items-center gap-1"
              >
                {query} <ArrowRight className="size-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="pt-2">
        <div className="relative flex items-center">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about ERP, subjects, placements..."
            className="pr-12 h-11 border-gray-200 focus:border-[#1a3a6b] focus:ring-[#1a3a6b]/20 rounded-xl"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1.5 bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white rounded-lg size-8"
            disabled={!input.trim() || loading}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
