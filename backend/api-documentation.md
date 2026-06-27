# AITS Rajampet ERP — API Endpoint Documentation

REST API documentation for Annamacharya Institute of Technology & Sciences (AITS), Rajampet College ERP server.

## Base URL
All API requests must be directed to:
```
http://localhost:5000/api
```

---

## 🔐 1. Authentication & Security Endpoints

### POST `/auth/register`
Self-registers a student or submits a faculty/HOD registration request pending approval.
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah@aits.ac.in",
    "password": "SecurePassword123",
    "role": "faculty",
    "employeeId": "EMP909",
    "departmentId": "dept-cse-id",
    "secretCode": "AITS_FAC_2024"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "Registration submitted successfully! Pending admin approval."
  }
  ```

### POST `/auth/login`
Authenticates a user session.
* **Request Body**:
  ```json
  {
    "identifier": "sarah@aits.ac.in",
    "password": "SecurePassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "usr-id-99",
      "name": "Sarah Connor",
      "email": "sarah@aits.ac.in",
      "role": "faculty"
    }
  }
  ```

### POST `/auth/refresh-token`
Generates a new access token using a valid refresh token.
* **Request Body**:
  ```json
  {
    "token": "eyJhbGciOi..."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "accessToken": "new-access-token-jwt"
  }
  ```

---

## 🎓 2. Student Management Endpoints (RBAC Mapped)

### GET `/students`
Retrieves list of registered students.
* **Headers**: `Authorization: Bearer <accessToken>`
* **Authorized Roles**: `super_admin`, `admin`, `hod`, `faculty`
* **Query Parameters**:
  * `departmentId` (filter by department)
  * `search` (filter by name/roll number)
* **Response (200 OK)**:
  ```json
  {
    "students": [
      {
        "id": "stud-id-1",
        "rollNumber": "22B21A0501",
        "user": {
          "name": "Arjun Patel",
          "email": "student1@aits.ac.in"
        },
        "department": {
          "name": "Computer Science & Engineering"
        }
      }
    ]
  }
  ```

### GET `/students/:id`
Retrieves individual student details.
* **Headers**: `Authorization: Bearer <accessToken>`
* **Authorized Roles**: `super_admin`, `admin`, `hod`, `faculty`, `student` (own profile)
* **Response (200 OK)**:
  ```json
  {
    "student": {
      "id": "stud-id-1",
      "rollNumber": "22B21A0501",
      "departmentId": "dept-cse-id",
      "semester": 5,
      "user": {
        "name": "Arjun Patel",
        "email": "student1@aits.ac.in"
      }
    }
  }
  ```
