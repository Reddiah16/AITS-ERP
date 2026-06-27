import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding AITS Rajampet ERP database...")

  // ── 1. Departments ──────────────────────────────────────────────
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: "CSE" },
      update: {},
      create: { name: "Computer Science & Engineering", code: "CSE", description: "Department of Computer Science & Engineering", isActive: true },
    }),
    prisma.department.upsert({
      where: { code: "AIML" },
      update: {},
      create: { name: "AI & Machine Learning", code: "AIML", description: "Department of Artificial Intelligence & Machine Learning", isActive: true },
    }),
    prisma.department.upsert({
      where: { code: "ECE" },
      update: {},
      create: { name: "Electronics & Communication Engineering", code: "ECE", description: "Department of Electronics & Communication Engineering", isActive: true },
    }),
    prisma.department.upsert({
      where: { code: "EEE" },
      update: {},
      create: { name: "Electrical & Electronics Engineering", code: "EEE", description: "Department of Electrical & Electronics Engineering", isActive: true },
    }),
    prisma.department.upsert({
      where: { code: "MECH" },
      update: {},
      create: { name: "Mechanical Engineering", code: "MECH", description: "Department of Mechanical Engineering", isActive: true },
    }),
    prisma.department.upsert({
      where: { code: "CIVIL" },
      update: {},
      create: { name: "Civil Engineering", code: "CIVIL", description: "Department of Civil Engineering", isActive: true },
    }),
  ])
  console.log(`✅ ${departments.length} departments seeded`)

  const [cseDept, aimlDept, eceDept, eeeDept, mechDept, civilDept] = departments

  // ── 2. Programs ──────────────────────────────────────────────────
  const programs = await Promise.all([
    prisma.program.upsert({ where: { id: "prog-btech-cse" }, update: {}, create: { id: "prog-btech-cse", name: "B.Tech Computer Science", code: "BTECH-CSE", duration: 4, departmentId: cseDept.id } }),
    prisma.program.upsert({ where: { id: "prog-btech-aiml" }, update: {}, create: { id: "prog-btech-aiml", name: "B.Tech AI & ML", code: "BTECH-AIML", duration: 4, departmentId: aimlDept.id } }),
    prisma.program.upsert({ where: { id: "prog-btech-ece" }, update: {}, create: { id: "prog-btech-ece", name: "B.Tech Electronics & Communication", code: "BTECH-ECE", duration: 4, departmentId: eceDept.id } }),
    prisma.program.upsert({ where: { id: "prog-btech-eee" }, update: {}, create: { id: "prog-btech-eee", name: "B.Tech Electrical & Electronics", code: "BTECH-EEE", duration: 4, departmentId: eeeDept.id } }),
    prisma.program.upsert({ where: { id: "prog-btech-mech" }, update: {}, create: { id: "prog-btech-mech", name: "B.Tech Mechanical Engineering", code: "BTECH-MECH", duration: 4, departmentId: mechDept.id } }),
    prisma.program.upsert({ where: { id: "prog-btech-civil" }, update: {}, create: { id: "prog-btech-civil", name: "B.Tech Civil Engineering", code: "BTECH-CIVIL", duration: 4, departmentId: civilDept.id } }),
  ])
  console.log(`✅ ${programs.length} programs seeded`)

  // ── 3. Super Admin ───────────────────────────────────────────────
  const superAdminPassword = await bcrypt.hash("SuperAdmin@123", 12)
  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@aits.ac.in" },
    update: {},
    create: {
      username: "superadmin",
      email: "superadmin@aits.ac.in",
      password: superAdminPassword,
      name: "Super Administrator",
      role: "super_admin",
      isActive: true,
      isApproved: true,
    },
  })
  console.log("✅ Super Admin seeded")

  // ── 4. Admin ─────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@aits.ac.in" },
    update: {},
    create: {
      username: "admin",
      email: "admin@aits.ac.in",
      password: adminPassword,
      name: "College Administrator",
      role: "admin",
      isActive: true,
      isApproved: true,
    },
  })
  console.log("✅ Admin seeded")

  // ── 5. Faculty / HODs ────────────────────────────────────────────
  const facultyAccounts = [
    { username: "dr.sharma", email: "dr.sharma@aits.ac.in", name: "Dr. Rajesh Sharma", empId: "EMP001", dept: cseDept, designation: "Professor & HOD", specialization: "Data Structures & Algorithms", qual: "Ph.D CSE", exp: 15, isHod: true },
    { username: "dr.reddy", email: "dr.reddy@aits.ac.in", name: "Dr. Priya Reddy", empId: "EMP002", dept: aimlDept, designation: "Professor & HOD", specialization: "Machine Learning", qual: "Ph.D AI", exp: 12, isHod: true },
    { username: "dr.kumar", email: "dr.kumar@aits.ac.in", name: "Dr. Suresh Kumar", empId: "EMP003", dept: eceDept, designation: "Professor & HOD", specialization: "VLSI Design", qual: "Ph.D ECE", exp: 18, isHod: true },
    { username: "prof.anand", email: "prof.anand@aits.ac.in", name: "Prof. Anand Varma", empId: "EMP004", dept: cseDept, designation: "Associate Professor", specialization: "Operating Systems", qual: "M.Tech CSE", exp: 8, isHod: false },
    { username: "prof.lakshmi", email: "prof.lakshmi@aits.ac.in", name: "Prof. Lakshmi Devi", empId: "EMP005", dept: aimlDept, designation: "Assistant Professor", specialization: "Deep Learning", qual: "M.Tech AI", exp: 5, isHod: false },
    { username: "prof.ravi", email: "prof.ravi@aits.ac.in", name: "Prof. Ravi Teja", empId: "EMP006", dept: eceDept, designation: "Assistant Professor", specialization: "Embedded Systems", qual: "M.Tech ECE", exp: 6, isHod: false },
  ]

  const facultyMap: Record<string, any> = {}
  for (const f of facultyAccounts) {
    const pwd = await bcrypt.hash("Faculty@123", 12)
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: {
        username: f.username,
        email: f.email,
        password: pwd,
        name: f.name,
        role: f.isHod ? "hod" : "faculty",
        employeeId: f.empId,
        isActive: true,
        isApproved: true,
      },
    })
    const faculty = await prisma.faculty.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeId: f.empId,
        departmentId: f.dept.id,
        designation: f.designation,
        specialization: f.specialization,
        qualification: f.qual,
        experience: f.exp,
        gender: "Male",
        status: "active",
      },
    })
    facultyMap[f.username] = { user, faculty }
  }
  console.log("✅ Faculty & HODs seeded")

  // Assign HODs to departments
  await prisma.department.update({ where: { id: cseDept.id }, data: { hodId: facultyMap["dr.sharma"].faculty.id } })
  await prisma.department.update({ where: { id: aimlDept.id }, data: { hodId: facultyMap["dr.reddy"].faculty.id } })
  await prisma.department.update({ where: { id: eceDept.id }, data: { hodId: facultyMap["dr.kumar"].faculty.id } })
  console.log("✅ HODs assigned to departments")

  // ── 6. Subjects ──────────────────────────────────────────────────
  const subjects = await Promise.all([
    // CSE Subjects
    prisma.subject.upsert({ where: { code: "CSE301" }, update: {}, create: { name: "Data Structures & Algorithms", code: "CSE301", credits: 4, semester: 3, departmentId: cseDept.id, facultyId: facultyMap["dr.sharma"].faculty.id } }),
    prisma.subject.upsert({ where: { code: "CSE302" }, update: {}, create: { name: "Operating Systems", code: "CSE302", credits: 3, semester: 3, departmentId: cseDept.id, facultyId: facultyMap["prof.anand"].faculty.id } }),
    prisma.subject.upsert({ where: { code: "CSE303" }, update: {}, create: { name: "Database Management Systems", code: "CSE303", credits: 4, semester: 3, departmentId: cseDept.id, facultyId: facultyMap["dr.sharma"].faculty.id } }),
    prisma.subject.upsert({ where: { code: "CSE401" }, update: {}, create: { name: "Computer Networks", code: "CSE401", credits: 3, semester: 4, departmentId: cseDept.id, facultyId: facultyMap["prof.anand"].faculty.id } }),
    // AIML Subjects
    prisma.subject.upsert({ where: { code: "AIML301" }, update: {}, create: { name: "Machine Learning", code: "AIML301", credits: 4, semester: 3, departmentId: aimlDept.id, facultyId: facultyMap["dr.reddy"].faculty.id } }),
    prisma.subject.upsert({ where: { code: "AIML302" }, update: {}, create: { name: "Deep Learning", code: "AIML302", credits: 3, semester: 3, departmentId: aimlDept.id, facultyId: facultyMap["prof.lakshmi"].faculty.id } }),
    prisma.subject.upsert({ where: { code: "AIML303" }, update: {}, create: { name: "Natural Language Processing", code: "AIML303", credits: 3, semester: 4, departmentId: aimlDept.id, facultyId: facultyMap["dr.reddy"].faculty.id } }),
    // ECE Subjects
    prisma.subject.upsert({ where: { code: "ECE301" }, update: {}, create: { name: "VLSI Design", code: "ECE301", credits: 4, semester: 3, departmentId: eceDept.id, facultyId: facultyMap["dr.kumar"].faculty.id } }),
    prisma.subject.upsert({ where: { code: "ECE302" }, update: {}, create: { name: "Embedded Systems", code: "ECE302", credits: 3, semester: 3, departmentId: eceDept.id, facultyId: facultyMap["prof.ravi"].faculty.id } }),
  ])
  console.log(`✅ ${subjects.length} subjects seeded`)

  // ── 7. Students ──────────────────────────────────────────────────
  const studentAccounts = [
    { username: "22B21A0501", email: "student1@aits.ac.in", name: "Arjun Patel", roll: "22B21A0501", enroll: "220501", dept: cseDept, prog: programs[0], sem: 5, year: 3, section: "A", batch: "2022-2026", gender: "Male" },
    { username: "22B21A0502", email: "student2@aits.ac.in", name: "Priya Sharma", roll: "22B21A0502", enroll: "220502", dept: cseDept, prog: programs[0], sem: 5, year: 3, section: "A", batch: "2022-2026", gender: "Female" },
    { username: "22B21A0503", email: "student3@aits.ac.in", name: "Rohit Verma", roll: "22B21A0503", enroll: "220503", dept: cseDept, prog: programs[0], sem: 5, year: 3, section: "B", batch: "2022-2026", gender: "Male" },
    { username: "22B21A4901", email: "aiml1@aits.ac.in", name: "Sai Krishna", roll: "22B21A4901", enroll: "224901", dept: aimlDept, prog: programs[1], sem: 5, year: 3, section: "A", batch: "2022-2026", gender: "Male" },
    { username: "22B21A4902", email: "aiml2@aits.ac.in", name: "Divya Lakshmi", roll: "22B21A4902", enroll: "224902", dept: aimlDept, prog: programs[1], sem: 5, year: 3, section: "A", batch: "2022-2026", gender: "Female" },
    { username: "23B21A0401", email: "ece1@aits.ac.in", name: "Venkat Rao", roll: "23B21A0401", enroll: "230401", dept: eceDept, prog: programs[2], sem: 3, year: 2, section: "A", batch: "2023-2027", gender: "Male" },
  ]

  const studentMap: Record<string, any> = {}
  for (const s of studentAccounts) {
    const pwd = await bcrypt.hash("Student@123", 12)
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        username: s.username,
        email: s.email,
        password: pwd,
        name: s.name,
        role: "student",
        rollNumber: s.roll,
        isActive: true,
        isApproved: true,
      },
    })
    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        rollNumber: s.roll,
        enrollmentNo: s.enroll,
        departmentId: s.dept.id,
        programId: s.prog.id,
        semester: s.sem,
        year: s.year,
        section: s.section,
        batch: s.batch,
        gender: s.gender,
        status: "active",
      },
    })
    studentMap[s.roll] = { user, student }
  }
  console.log("✅ Students seeded")

  // ── 8. Sample Attendance ─────────────────────────────────────────
  const cse301 = subjects.find(s => s.code === "CSE301")!
  const cse302 = subjects.find(s => s.code === "CSE302")!
  const aiml301 = subjects.find(s => s.code === "AIML301")!

  const today = new Date()
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - i - 1)
    return d
  })

  for (const date of dates) {
    for (const roll of ["22B21A0501", "22B21A0502", "22B21A0503"]) {
      const student = studentMap[roll]?.student
      if (!student) continue
      const status = Math.random() > 0.2 ? "present" : "absent"
      try {
        await prisma.attendance.create({
          data: { studentId: student.id, subjectId: cse301.id, date, status, markedById: facultyMap["dr.sharma"].faculty.id },
        })
      } catch { /* skip duplicates */ }
      try {
        await prisma.attendance.create({
          data: { studentId: student.id, subjectId: cse302.id, date, status: "present", markedById: facultyMap["prof.anand"].faculty.id },
        })
      } catch { /* skip duplicates */ }
    }
    for (const roll of ["22B21A4901", "22B21A4902"]) {
      const student = studentMap[roll]?.student
      if (!student) continue
      try {
        await prisma.attendance.create({
          data: { studentId: student.id, subjectId: aiml301.id, date, status: "present", markedById: facultyMap["dr.reddy"].faculty.id },
        })
      } catch { /* skip duplicates */ }
    }
  }
  console.log("✅ Sample attendance seeded")

  // ── 9. Internal Marks ────────────────────────────────────────────
  for (const roll of ["22B21A0501", "22B21A0502", "22B21A0503"]) {
    const student = studentMap[roll]?.student
    if (!student) continue
    try {
      await prisma.internalMark.create({ data: { studentId: student.id, subjectId: cse301.id, examType: "mid1", marks: Math.floor(Math.random() * 10) + 20, maxMarks: 30, enteredById: facultyMap["dr.sharma"].faculty.id } })
      await prisma.internalMark.create({ data: { studentId: student.id, subjectId: cse302.id, examType: "mid1", marks: Math.floor(Math.random() * 10) + 18, maxMarks: 30, enteredById: facultyMap["prof.anand"].faculty.id } })
    } catch { /* skip */ }
  }
  console.log("✅ Sample marks seeded")

  // ── 10. Circulars ────────────────────────────────────────────────
  const circularData = [
    { title: "Mid Semester Examination Schedule", content: "The mid semester examinations for all departments will be held from 15th July to 22nd July 2024. Students are advised to prepare accordingly. Hall tickets will be issued 3 days before the examination.", type: "exam", targetRole: "student" as string | null, issuedById: adminUser.id },
    { title: "Faculty Development Programme", content: "A Faculty Development Programme on 'AI and Machine Learning in Education' will be conducted from 20th to 24th July 2024. All faculty members are encouraged to participate.", type: "academic", targetRole: "faculty" as string | null, issuedById: adminUser.id },
    { title: "Annual Sports Day", content: "The Annual Sports Day will be held on 5th August 2024. Students interested in participating should register with their respective Physical Director by 28th July 2024.", type: "event", targetRole: null, issuedById: adminUser.id },
    { title: "HOD Meeting", content: "All Heads of Departments are requested to attend the meeting scheduled on 18th July 2024 at 10:00 AM in the Conference Hall to discuss the upcoming semester curriculum.", type: "general", targetRole: "hod" as string | null, issuedById: superAdminUser.id },
    { title: "Placement Drive - TCS NQT", content: "TCS is conducting its National Qualifier Test on 25th July 2024. All eligible 3rd year students (CGPA >= 6.5) should register on TCS NextStep portal by 20th July 2024.", type: "placement", targetRole: "student" as string | null, issuedById: adminUser.id },
  ]
  for (const c of circularData) {
    try { await prisma.circular.create({ data: c }) } catch { /* skip duplicates */ }
  }
  console.log("✅ Circulars seeded")

  // ── 11. Notifications ────────────────────────────────────────────
  const notifData = [
    { title: "Welcome to AITS ERP", message: "Welcome to the AITS Rajampet ERP System. This platform centralizes all academic and administrative activities.", type: "info", targetRole: null as string | null, createdById: adminUser.id },
    { title: "Attendance Alert", message: "Students with attendance below 75% will not be eligible to appear in the semester examinations.", type: "warning", targetRole: "student" as string | null, createdById: adminUser.id },
    { title: "Result Published", message: "Results for 4th Semester have been published. Students can check their results in the Examination module.", type: "info", targetRole: "student" as string | null, createdById: adminUser.id },
  ]
  for (const n of notifData) {
    try { await prisma.notification.create({ data: n }) } catch { /* skip */ }
  }
  console.log("✅ Notifications seeded")

  // ── 12. Companies & Placement Drives ────────────────────────────
  const tcs = await prisma.company.create({ data: { name: "TCS (Tata Consultancy Services)", industry: "IT Services", website: "https://www.tcs.com", isActive: true } })
  const infosys = await prisma.company.create({ data: { name: "Infosys", industry: "IT Services", website: "https://www.infosys.com", isActive: true } })
  const wipro = await prisma.company.create({ data: { name: "Wipro Technologies", industry: "IT Services", website: "https://www.wipro.com", isActive: true } })

  await prisma.placementDrive.createMany({
    data: [
      { companyId: tcs.id, title: "TCS NQT 2024", description: "TCS National Qualifier Test for campus recruitment", driveDate: new Date("2024-07-25"), registrationDeadline: new Date("2024-07-20"), eligibility: "CGPA >= 6.5, No active backlogs", ctcOffered: "3.6 LPA", location: "Online", status: "upcoming" },
      { companyId: infosys.id, title: "Infosys InfyTQ 2024", description: "Infosys campus recruitment drive", driveDate: new Date("2024-08-10"), registrationDeadline: new Date("2024-08-05"), eligibility: "CGPA >= 7.0, No backlogs", ctcOffered: "4.5 LPA", location: "Hyderabad", status: "upcoming" },
      { companyId: wipro.id, title: "Wipro Elite NLTH", description: "Wipro National Level Talent Hunt", driveDate: new Date("2024-06-20"), eligibility: "CGPA >= 6.0", ctcOffered: "3.5 LPA", location: "Online", status: "completed" },
    ],
  })
  console.log("✅ Companies & placement drives seeded")

  // ── 13. Library Books ────────────────────────────────────────────
  const bookData = [
    { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", publisher: "MIT Press", category: "Computer Science", quantity: 5, available: 3 },
    { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", isbn: "978-0134610993", publisher: "Pearson", category: "AI/ML", quantity: 4, available: 4 },
    { title: "Operating System Concepts", author: "Abraham Silberschatz", isbn: "978-1119800361", publisher: "Wiley", category: "Computer Science", quantity: 6, available: 5 },
    { title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "978-0078022159", publisher: "McGraw Hill", category: "Databases", quantity: 4, available: 2 },
    { title: "Deep Learning", author: "Ian Goodfellow", isbn: "978-0262035613", publisher: "MIT Press", category: "AI/ML", quantity: 3, available: 3 },
    { title: "Engineering Mathematics", author: "B.S. Grewal", isbn: "978-8121903486", publisher: "Khanna Publishers", category: "Mathematics", quantity: 10, available: 8 },
  ]
  for (const b of bookData) {
    try { await prisma.libraryBook.create({ data: b }) } catch { /* skip duplicates */ }
  }
  console.log("✅ Library books seeded")

  // ── 14. Gallery Images ───────────────────────────────────────────
  const galleryData = [
    { title: "AITS Campus Main Building", description: "The iconic main building of AITS Rajampet", imageUrl: "/gallery/campus1.jpg", category: "campus", uploadedById: adminUser.id },
    { title: "CSE Department Lab", description: "State-of-the-art computer lab", imageUrl: "/gallery/cse-lab.jpg", category: "department", departmentId: cseDept.id, uploadedById: adminUser.id },
    { title: "Annual Day 2024", description: "Students performing at Annual Day celebrations", imageUrl: "/gallery/annual-day.jpg", category: "events", uploadedById: adminUser.id },
    { title: "Sports Day 2024", description: "Students participating in athletics", imageUrl: "/gallery/sports.jpg", category: "sports", uploadedById: adminUser.id },
  ]
  for (const g of galleryData) {
    try { await prisma.galleryImage.create({ data: g }) } catch { /* skip duplicates */ }
  }
  console.log("✅ Gallery images seeded")

  // ── 15. Site Settings ────────────────────────────────────────────
  const settings = [
    { key: "college_name", value: "Annamacharya Institute of Technology & Sciences" },
    { key: "college_short_name", value: "AITS Rajampet" },
    { key: "college_address", value: "Rajampet, Kadapa District, Andhra Pradesh - 516126" },
    { key: "college_phone", value: "+91-8562-222999" },
    { key: "college_email", value: "info@aits.ac.in" },
    { key: "college_website", value: "https://www.aits.ac.in" },
    { key: "college_established", value: "2001" },
    { key: "college_affiliation", value: "JNTU Anantapur" },
    { key: "college_accreditation", value: "NAAC A+ Grade" },
    { key: "current_academic_year", value: "2024-25" },
    { key: "current_semester", value: "Odd Semester (Jul-Nov 2024)" },
    { key: "primary_color", value: "#1a3a6b" },
    { key: "secondary_color", value: "#f5a623" },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s })
  }
  console.log("✅ Site settings seeded")

  // ── 16. AI Analytics Seeding ─────────────────────────────────────
  for (const roll of Object.keys(studentMap)) {
    const student = studentMap[roll].student
    await prisma.studentPrediction.create({
      data: {
        studentId: student.id,
        performanceStatus: Math.random() > 0.3 ? "Excellent" : "Risk",
        failureRiskPercent: Math.random() > 0.7 ? 65.4 : 12.5,
        gpaForecast: parseFloat((Math.random() * 3 + 7).toFixed(2)),
        gpaSemester: student.semester + 1,
      }
    })

    await prisma.placementPrediction.create({
      data: {
        studentId: student.id,
        probabilityPercent: Math.random() > 0.4 ? 85.0 : 42.0,
        recommendedSkills: "React, Node.js, Python, AWS Cloud Practitioner",
        recommendedResumes: "Add more projects on React/Next.js and mention your Python AI/ML certifications.",
      }
    })

    await prisma.attendanceAnalytic.create({
      data: {
        studentId: student.id,
        trend: Math.random() > 0.5 ? "Improving" : "Declining",
        predictedAttendance: parseFloat((Math.random() * 20 + 75).toFixed(2)),
      }
    })
  }
  console.log("✅ AI predictions seeded")


  console.log("\n🎉 AITS Rajampet ERP database seeded successfully!\n")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("📋 Default Credentials:")
  console.log("   Super Admin : superadmin@aits.ac.in / SuperAdmin@123")
  console.log("   Admin       : admin@aits.ac.in / Admin@123")
  console.log("   HOD (CSE)   : dr.sharma@aits.ac.in / Faculty@123")
  console.log("   HOD (AIML)  : dr.reddy@aits.ac.in / Faculty@123")
  console.log("   Faculty     : prof.anand@aits.ac.in / Faculty@123")
  console.log("   Student     : 22B21A0501@aits.ac.in / Student@123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
