import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const botResponses = [
  { keywords: ["hi", "hello", "hey"], response: "Hello! I am your AITS Rajampet ERP AI Assistant. How can I help you today?" },
  { keywords: ["attendance", "present", "absent"], response: "Your attendance is tracked automatically in the Attendance module. You must maintain at least 75% attendance to be eligible for final examinations." },
  { keywords: ["marks", "mid1", "mid2", "exam"], response: "You can view your Mid-1 and Mid-2 internal marks under the Marks section. Final semester results are published in the Results section." },
  { keywords: ["placement", "job", "drive", "wipro", "tcs"], response: "Active placement drives are listed in the Placement module. Eligible students can apply with a single click after uploading their resumes." },
  { keywords: ["library", "book", "fine"], response: "Books issued from the library have a 14-day borrowing period. Overdue books incur a fine of ₹2 per day." },
  { keywords: ["fee", "payment", "due"], response: "Fee payments can be managed through the administrative desk. Make sure to clear all semester dues before hall ticket generation." },
  { keywords: ["hod", "head", "department"], response: "HOD assignments are managed under the HOD Management section. HODs oversee departmental faculty and student approvals." },
  { keywords: ["chatbot", "assistant", "help"], response: "I can assist you with details regarding attendance, internal marks, placements, circulars, and library book issues." },
]

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 })

    const lowerMessage = message.toLowerCase()
    let responseText = "I'm sorry, I couldn't find a direct answer to that query. Please check the respective ERP module or contact the college administration office for more details."

    for (const item of botResponses) {
      if (item.keywords.some(k => lowerMessage.includes(k))) {
        responseText = item.response
        break
      }
    }

    return NextResponse.json({ reply: responseText })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
