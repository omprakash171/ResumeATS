# Building an AI-Powered Resume ATS Analyzer

## The Problem

Picture this — you've just graduated. Your resume lists 3 projects, 2 internships, and skills in React, Python, and SQL. You apply to 100 jobs. Silence. Meanwhile, your classmate with fewer projects gets 5 interview calls.

**What went wrong?**

A great resume ≠ A resume that gets read

Here's what most job seekers don't realize: a growing number of companies now use an **ATS (Applicant Tracking System)** — software that automatically scans, filters, and ranks resumes before a recruiter ever looks at them. If your resume doesn't have the right keywords in the right format, it gets filtered out — no matter how strong your profile is.

Think of ATS like an online exam portal that auto-evaluates your answer sheet. You might have written brilliant answers, but if the portal can't read your handwriting (format), it marks you zero. That's what ATS does to resumes it can't parse.

**Over 90% of Fortune 500 companies use ATS to screen resumes** — and increasingly, startups and mid-size companies are adopting them too.

## Traditional Solutions and Their Limitations

| Approach                       | Limitation                                     |
| ------------------------------ | ---------------------------------------------- |
| Manually tailoring each resume | Extremely time-consuming for every application |
| Using generic resume templates | May not match specific job keywords            |
| Asking friends to review       | They don't know how ATS algorithms work        |
| Paid resume review services    | Expensive and slow turnaround                  |

## The Solution: AI-Powered ATS Analyzers

A smart tool available 24/7 that:

- Parses your resume automatically
- Compares it against job descriptions
- Gives an ATS compatibility score
- Suggests specific improvements using AI

## Real World ATS Analyzer Platforms

- [Jobscan](https://www.jobscan.co)
- [Resume Worded](https://resumeworded.com)
- [SkillSyncer](https://skillsyncer.com)
- [Enhancv](https://enhancv.com/resources/resume-checker)
- [Kickresume](https://www.kickresume.com)
- [Novoresume](https://novoresume.com)
- [MyPerfectResume](https://www.myperfectresume.com/resume/ats-resume-checker)
- [ResuScan](https://www.resuscan.com)

## What We Will Build

### Our Resume ATS Analyzer

In this session, we'll build a full-stack application that:

- Lets users register and securely log in
- Uploads PDF resumes and extracts text
- Analyzes resumes using ATS keyword scoring and AI-powered suggestions from Gemini

## Key Features

| Feature               | Description                                                                            |
| --------------------- | -------------------------------------------------------------------------------------- |
| User Authentication   | Secure register and login with JWT tokens                                              |
| PDF Resume Parsing    | Extracts text from uploaded PDF files using pdfjs-dist                                 |
| ATS Score Calculation | Compares resume keywords against job description keywords                              |
| AI-Powered Analysis   | Uses Gemini AI for detailed suggestions, missing skills, and bullet point improvements |
| Protected Routes      | Only authenticated users can upload and analyze resumes                                |
| Full Integration      | Register → Login → Upload PDF → Get Score + AI Suggestions                             |

## Prerequisites

- VS Code
- Node.js
- MongoDB Atlas Account
- Google Gemini API Key

## Project Structure

```
project/
├── server/    # Backend application code
└── client/    # Frontend application code
```

## Functionalities to Implement

1. **Register & Login**: Users can create an account and log in to get a secure JWT token
2. **Upload Resume**: Upload a PDF resume and extract its text content
3. **Analyze Resume**: Get an ATS keyword score and receive AI-powered suggestions from Gemini

---

# Implementing Register & Login Functionality

## Steps to Implement

1. Creating the User Model
2. Building the Register and Login Endpoints
3. Sending the Registration Data from Frontend
4. Sending the Login Data from Frontend and Storing the Token

## Step 1: Creating the User Model

The server shell (server.js), dependencies (package.json), and environment config (.env) are already set up in the initial code. Let's start building the logic.

For users to register and log in, we first need a place to store their accounts — name, email, and password. The User model defines what a user document looks like in our MongoDB database.

### Backend Code (models/User.js)

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

export default mongoose.model("User", userSchema);
```

**Key points:**

- `unique: true` on email ensures no two users can register with the same email
- `mongoose.model("User", userSchema)` creates a collection called "users" in MongoDB

## Step 2: Building the Register and Login Endpoints

We need two API endpoints — one for creating accounts and one for authenticating users.

| HTTP Method | Route          | Purpose                      |
| ----------- | -------------- | ---------------------------- |
| POST        | /auth/register | Create a new user account    |
| POST        | /auth/login    | Authenticate and get a token |

### Backend Code (routes/authRoutes.js)

```javascript
import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
```

**Key points:**

- Express Router lets us group related routes together
- Both routes use POST because we are sending data (user credentials) to the server

### Connecting Auth Routes to the Server

Now that we have our auth routes, let's add them to server.js:

```javascript
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

// ... rest of server.js
```

We import our auth routes and mount them at `/auth`. Now `POST /auth/register` and `POST /auth/login` are accessible.

## The Register Controller

### Backend Code (controllers/authController.js)

```javascript
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
```

**Key points:**

- `User.create(req.body)` takes the name, email, and password from the request and creates a new document in MongoDB
- If the email already exists, it throws an error caught by the catch block

## Why Do We Need JWT for Login?

After a user logs in, how does the server know they're authenticated on future requests (like uploading a resume)? We can't ask them to log in every time.

**JWT (JSON Web Token)** solves this:

1. User logs in with email + password
2. Server verifies credentials and creates a signed token
3. Client stores the token and sends it with every future request
4. Server verifies the token — no need to check the database again

## The Login Controller

```javascript
export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || user.password !== req.body.password)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token });
};
```

**Key points:**

- `User.findOne()` searches MongoDB for a user with the matching email
- `jwt.sign()` creates a token containing the user's ID, signed with our secret key
- This token is what the frontend will store and send back with every request

## Step 3: Sending the Registration Data from Frontend

Now that our backend can register users, we need to build the frontend form. When the user fills in their details and clicks Register, we send that data to our `/auth/register` endpoint.

The styling for the Register component (index.css) is already implemented in the initial code. We only need to write the logic here.

### Frontend Code (components/Register/index.jsx)

```javascript
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={name}
          onChange={handleNameChange}
          disabled={loading}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          disabled={loading}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          disabled={loading}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
```

**Key points:**

- `useNavigate` lets us redirect the user after registration
- Each input field is tracked by its own state variable
- `event.preventDefault()` stops the form from reloading the page
- We send the user details as JSON to our `/auth/register` endpoint
- On success, we redirect to the login page after 2 seconds
- Each input is a controlled component — its value comes from state and updates via onChange
- `disabled={loading}` prevents double-submission while the request is in progress

## Step 4: Sending the Login Data from Frontend and Storing the Token

The login form is similar to register, but with one critical difference — we store the JWT token that comes back from the server. The styling (index.css) is already implemented — we focus on the logic.

### Frontend Code (components/Login/index.jsx)

```javascript
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Store the JWT token in localStorage
      localStorage.setItem("token", data.token);

      // Redirect to dashboard or home
      navigate("/your-resumes");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          disabled={loading}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          disabled={loading}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
```

**Key points:**

- The key line is `localStorage.setItem("token", data.token)`. This stores the JWT token in the browser so it persists across page refreshes
- On every future API call, we'll retrieve this token and send it in the Authorization header

### How localStorage Works

| Method                                 | Purpose                   |
| -------------------------------------- | ------------------------- |
| `localStorage.setItem("key", "value")` | Store data in the browser |
| `localStorage.getItem("key")`          | Retrieve stored data      |
| `localStorage.removeItem("key")`       | Remove stored data        |

Unlike `sessionStorage` (cleared when the tab closes), `localStorage` persists even after the browser is closed — which is why it's ideal for storing login tokens.

## Register & Login — Done!

### What We've Built So Far

✅ User model for storing accounts  
✅ Register endpoint that creates users  
✅ Login endpoint that returns JWT tokens  
✅ Frontend forms that send data and store the token

The routing (App.jsx), navigation (Navbar), landing page (Home), and contact page (Contact) are already implemented in the initial code.

---

# Implementing Upload Resume Functionality

## Steps to Implement

1. Setting Up File Upload Middleware
2. Creating the Resume Model
3. Parsing PDF and Extracting Text
4. Creating the Upload Endpoint
5. Protecting Routes So Only Logged-In Users Can Upload
6. Sending the File from Frontend

## Step 1: Setting Up File Upload Middleware

When a user uploads a PDF file, it doesn't arrive as JSON. It comes as `multipart/form-data` — a different format designed for file transfers. We need Multer, an Express middleware that handles this.

| Concept        | Explanation                                                   |
| -------------- | ------------------------------------------------------------- |
| Multer         | Express middleware for handling file uploads                  |
| Memory Storage | Stores the file in RAM as a Buffer instead of saving to disk  |
| req.file       | After Multer processes the upload, the file is available here |

### Backend Code (middleware/upload.js)

```javascript
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });
```

**Key points:**

- `memoryStorage()` keeps the uploaded file in memory as a Buffer
- This is perfect for our use case — we just need to read the PDF text, not save the file permanently

## Step 2: Creating the Resume Model

We need to store resume data — the extracted text, ATS score, and AI suggestions — linked to the user who uploaded it.

### Backend Code (models/Resume.js)

```javascript
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  text: String,
  atsScore: Number,
  suggestions: Array,
});

export default mongoose.model("Resume", resumeSchema);
```

**Key points:**

- `userId` links each resume to the user who uploaded it
- The `text` field stores the extracted PDF content
- `suggestions` holds the AI analysis results we'll generate later

## Step 3: Parsing PDF and Extracting Text

This is the core challenge of the upload step. PDF files store text in a complex binary format — you can't just read them like a .txt file. We need pdfjs-dist (Mozilla's PDF.js library) to understand the PDF structure and pull out the readable text.

### The Conversion Pipeline

```
Uploaded PDF → Multer Buffer → Uint8Array → pdfjs-dist → Extracted Text
```

### Why Convert Buffer to Uint8Array?

Multer gives us a Node.js Buffer, but pdfjs-dist expects a Uint8Array. Both hold the same raw bytes — they're just different container types. Think of it like pouring water from a bottle into a glass — same water, different container.

### Backend Code (utils/resumeParser.js)

```javascript
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function parseResume(fileBuffer) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("Received empty buffer");
    }

    // Buffer → Uint8Array conversion
    const uint8Array = new Uint8Array(
      fileBuffer.buffer,
      fileBuffer.byteOffset,
      fileBuffer.byteLength,
    );

    // Load the PDF
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let extractedText = "";

    // Loop through every page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract text from items
      const pageText = textContent.items.map((item) => item.str).join(" ");

      extractedText += pageText + " ";
    }

    return extractedText.trim();
  } catch (err) {
    throw new Error(`PDF Parsing Error: ${err.message}`);
  }
}
```

**Key points:**

- `getDocument()` loads the PDF from binary data
- We loop through every page using `pdf.numPages`
- Extract text items with `getTextContent()`
- Join them with spaces
- Each `item.str` is a small text fragment — words, phrases, or characters that together form the full resume text

## Step 4: Creating the Upload Endpoint

Now we wire it all together — receive the file, convert it, parse it, and return the extracted text.

### Backend Code (controllers/resumeController.js)

```javascript
import { parseResume } from "../utils/resumeParser.js";
import Resume from "../models/Resume.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Parse the PDF
    const extractedText = await parseResume(req.file.buffer);

    if (!extractedText) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    // Save to database
    const resume = await Resume.create({
      userId: req.user.id,
      text: extractedText,
    });

    // Return preview and full text
    res.json({
      success: true,
      preview: extractedText.substring(0, 500),
      text: extractedText,
      resumeId: resume._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

**Key points:**

- `req.file.buffer` contains the uploaded PDF as raw bytes (provided by Multer's memory storage)
- The response includes a 500-character preview and the full extracted text
- This text will be sent to the analyze endpoint next

## Step 5: Protecting Routes So Only Logged-In Users Can Upload

Remember the JWT token we stored during login? Now we need to verify it. Every request to upload or analyze a resume must prove the user is authenticated.

```
Request with Token → Auth Middleware → Verify → Route Handler
Request without Token → Auth Middleware → 401 Unauthorized
```

### Backend Code (middleware/authMiddleware.js)

```javascript
import jwt from "jsonwebtoken";

export default function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

**Key points:**

- The Authorization header contains "Bearer <token>"
- We split by space and take index [1] to get just the token
- `jwt.verify()` checks if the token is valid
- If yes, `next()` passes control to the route handler
- If not, the request is rejected with 401

### Wiring Up the Routes

Middleware runs left to right — first verify the token, then process the file, then handle the business logic.

### Backend Code (routes/resumeRoutes.js)

```javascript
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { uploadResume } from "../controllers/resumeController.js";

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);

export default router;
```

**Key points:**

- `upload.single("resume")` tells Multer to expect a single file with the field name "resume"
- This must match what the frontend sends
- We'll add the `/analyze` route here later when we build the analyze functionality

### Connecting Resume Routes to the Server

Update server.js to include the resume routes:

```javascript
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);

// Connect to MongoDB and start server...
```

Now both `/auth` and `/resume` routes are connected. The server can handle user registration, login, and resume uploads.

On the frontend side, the ProtectedRoute component is already implemented in the initial code — it checks localStorage for a token and redirects to /login if not found.

## Step 6: Sending the File from Frontend

Here's where the Upload and Analyze steps happen in the browser. When the user selects a PDF and clicks "Upload & Analyze", we send the file to the backend. The styling for the YourResumes page, including the modal and buttons, is already implemented in the initial code.

### Why Can't We Use JSON for File Uploads?

| JSON (text data) | FormData (file uploads) |
| ---------------- | ----------------------- | --------------------------------------- |
| Content-Type     | application/json        | multipart/form-data (set automatically) |
| File support     | No                      | Yes                                     |
| Usage            | JSON.stringify({...})   | formData.append("key", file)            |

**Important:** When using FormData, do NOT manually set the Content-Type header. The browser sets it automatically with the correct boundary string.

### Frontend Code (components/YourResumes/index.jsx)

```javascript
import React, { useState } from "react";
import "./index.css";

const YourResumes = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // STEP 1: Upload Resume
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const token = localStorage.getItem("token");

      const uploadResponse = await fetch(
        "http://localhost:5000/resume/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setError(uploadData.error || "Upload failed");
        return;
      }

      // STEP 2: Analyze Resume (after successful upload)
      const rawData = {
        resumeText: uploadData.text,
        jobDescription:
          "Junior Full Stack Developer. We are looking for a motivated entry-level Full Stack Developer to join our engineering team. You will work on building and maintaining web applications using modern technologies. Requirements: Bachelor's degree in Computer Science or related field. Proficiency in HTML, CSS, JavaScript, and React. Experience with Node.js, Express, and REST APIs. Familiarity with MongoDB or any NoSQL database. Understanding of Git and version control. Strong problem-solving skills and attention to detail. Good communication and teamwork abilities. Nice to Have: Experience with TypeScript, Redux, or Next.js. Exposure to cloud platforms like AWS or Azure. Knowledge of CI/CD pipelines and Docker. Responsibilities: Develop and maintain responsive web applications. Build RESTful APIs and integrate with frontend components. Write clean, maintainable, and well-documented code. Collaborate with designers, product managers, and senior developers. Participate in code reviews and contribute to team best practices. Debug and resolve technical issues across the full stack.",
      };

      const analyzeResponse = await fetch(
        "http://localhost:5000/resume/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(rawData),
        },
      );

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        setError(analyzeData.error || "Analysis failed");
        return;
      }

      setAnalysisResult(analyzeData);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-container">
      <h2>Upload Your Resume</h2>

      <input type="file" accept=".pdf" onChange={handleFileChange} />

      <button onClick={handleUploadAndAnalyze} disabled={loading}>
        {loading ? "Processing..." : "Upload & Analyze"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {analysisResult && (
        <button onClick={() => setShowModal(true)}>View Report</button>
      )}

      {/* Analysis Modal */}
      {showModal && analysisResult?.success && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>ATS Resume Analysis Report</h2>

            {(() => {
              const report =
                analysisResult.suggestions?.analysis ??
                analysisResult.suggestions ??
                analysisResult;

              return (
                <>
                  <div className="modal-section">
                    <h3>ATS Compatibility Score</h3>
                    <p className="score">{report.atsScore || 0}%</p>
                  </div>

                  {report.missingSkills && (
                    <div className="modal-section">
                      <h3>Missing Skills</h3>
                      <ul>
                        {Array.isArray(report.missingSkills) ? (
                          report.missingSkills.map((skill, idx) => (
                            <li key={idx}>{skill}</li>
                          ))
                        ) : (
                          <li>{report.missingSkills}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {report.optimizationTips && (
                    <div className="modal-section">
                      <h3>Optimization Tips</h3>
                      <ul>
                        {Array.isArray(report.optimizationTips) ? (
                          report.optimizationTips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))
                        ) : (
                          <li>{report.optimizationTips}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {report.bulletPointImprovements && (
                    <div className="modal-section">
                      <h3>Bullet Point Improvements</h3>
                      <ul>
                        {Array.isArray(report.bulletPointImprovements) ? (
                          report.bulletPointImprovements.map((bullet, idx) => (
                            <li key={idx}>{bullet}</li>
                          ))
                        ) : (
                          <li>{report.bulletPointImprovements}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()}

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourResumes;
```

**Key points:**

- `formData.append("resume", selectedFile)` adds the file with the key "resume" — this must match `upload.single("resume")` in our backend route
- The Authorization header sends our JWT token so the auth middleware can verify us
- Notice the switch from FormData to JSON — we're sending text now, not a file
- `setShowModal(true)` opens the results modal automatically after analysis completes

---

# Implementing Analyze Resume Functionality

## Steps to Implement

1. Extracting Keywords from Text
2. Calculating the ATS Score
3. Getting AI-Powered Analysis from Gemini
4. Creating the Analyze Endpoint
5. Connecting the Frontend to the Analyze API
6. Displaying the Analysis Report in a Modal

## Step 1: Extracting Keywords from Text

ATS systems work by scanning resumes for specific keywords that match the job description. So the first thing we need is a way to pull out meaningful words from both the resume and the job description.

We use a regular expression (regex) to find all words with 3 or more letters:

| Pattern | Meaning                                |
| ------- | -------------------------------------- |
| \b      | Word boundary — match whole words only |
| [a-z]   | Any lowercase letter                   |
| {3,}    | 3 or more characters                   |
| g       | Global — find all matches              |

### Backend Code (utils/keywordExtractor.js)

```javascript
export const extractKeywords = (text) => {
  return text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
};
```

**Key points:**

- Converts text to lowercase and extracts all words with 3+ letters
- The `|| []` ensures we return an empty array if no matches are found, preventing errors downstream

## Step 2: Calculating the ATS Score

Now that we can extract keywords, we need to answer: "What percentage of the job description keywords appear in the resume?"

$$\text{ATS Score} = \frac{\text{Matching Keywords}}{\text{Total Unique JD Keywords}} \times 100$$

### Backend Code (utils/atsScore.js)

```javascript
export const calculateATSScore = (jdKeywords, resumeKeywords) => {
  const uniqueJD = [...new Set(jdKeywords)];

  const matches = uniqueJD.filter((k) => resumeKeywords.includes(k));

  return Math.round((matches.length / uniqueJD.length) * 100);
};
```

**Key points:**

- `new Set()` removes duplicate keywords so each word is counted only once
- We filter to find which JD keywords also appear in the resume, then calculate the percentage

### Example

| JD Keywords (unique) | Resume Keywords               | Match? |
| -------------------- | ----------------------------- | ------ |
| react                | react, javascript, node       | Yes    |
| python               | react, javascript, node       | No     |
| javascript           | react, javascript, node       | Yes    |
| **Result**           | **2 matches / 3 total = 67%** |        |

## Step 3: Getting AI-Powered Analysis from Gemini

The keyword score gives us a number, but we need more — which skills are missing? How can the resume be improved? What are the best bullet point rewrites? For this, we use Google's Gemini AI.

| Concept     | Explanation                                                   |
| ----------- | ------------------------------------------------------------- |
| Gemini      | Google's large language model for AI text generation          |
| REST API    | We call Gemini via HTTP POST — no SDK needed                  |
| Temperature | Controls randomness — 0.2 means focused, consistent responses |

### Building the Prompt

We need to tell the AI exactly what format to return, so our frontend can reliably display the results:

### Backend Code (utils/aiAnalyzer.js — prompt)

```javascript
const buildPrompt = (
  resumeText,
  jobDescription,
) => `You are an ATS resume analyzer.
Return STRICT JSON only.
Do not wrap in markdown.
Do not include backticks.
Do not include explanations.
Use this exact schema:
{
  "analysis": {
    "atsScore": <number 0-100>,
    "missingSkills": [<list of missing skills>],
    "optimizationTips": [<list of tips>],
    "bulletPointImprovements": [<list of improved bullets>]
  }
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;
```

**Key points:**

- The prompt gives the AI a strict JSON schema to follow
- This ensures the response is always parseable by our frontend
- `${resumeText}` and `${jobDescription}` inject the actual content using template literals

### Calling the Gemini API

### Backend Code (utils/aiAnalyzer.js)

````javascript
import dotenv from "dotenv";

dotenv.config();

export const analyzeWithGemini = async (resumeText, jobDescription) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is undefined");
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildPrompt(resumeText, jobDescription),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
        params: new URLSearchParams({
          key: process.env.GEMINI_API_KEY,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse response
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Empty Gemini response");
    }

    // Try parsing
    try {
      const parsed = JSON.parse(
        rawText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim(),
      );
      return parsed;
    } catch (parseErr) {
      return { error: rawText };
    }
  } catch (err) {
    throw new Error(`Gemini Analysis Error: ${err.message}`);
  }
};

const buildPrompt = (
  resumeText,
  jobDescription,
) => `You are an ATS resume analyzer.
Return STRICT JSON only.
Do not wrap in markdown.
Do not include backticks.
Do not include explanations.
Use this exact schema:
{
  "analysis": {
    "atsScore": <number 0-100>,
    "missingSkills": [<list of missing skills>],
    "optimizationTips": [<list of tips>],
    "bulletPointImprovements": [<list of improved bullets>]
  }
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;
````

**Key points:**

- We call Gemini's REST endpoint with our prompt wrapped in the `contents[0].parts[0].text` structure
- The `?.` (optional chaining) safely navigates the nested response — if any level is missing, it returns undefined instead of crashing
- Sometimes the AI wraps its JSON response in markdown code blocks like ` ```json ... ``` `
- We strip those before parsing

### Note on buildPrompt and analyzeWithGemini

The `buildPrompt` function and `analyzeWithGemini` function both go in the same file — `utils/aiAnalyzer.js`. Place `buildPrompt` below `analyzeWithGemini` since it's a helper function used by the main export.

## Step 4: Creating the Analyze Endpoint

Now we need to add the `analyzeResume` function to our existing `resumeController.js`. First, update the imports at the top of the file to include the new utilities we just built:

### Updating Imports (controllers/resumeController.js)

```javascript
import { parseResume } from "../utils/resumeParser.js";
import { extractKeywords } from "../utils/keywordExtractor.js";
import { calculateATSScore } from "../utils/atsScore.js";
import { analyzeWithGemini } from "../utils/aiAnalyzer.js";
import Resume from "../models/Resume.js";

export const uploadResume = async (req, res) => {
  // ... existing code ...
};
```

We add three new imports — the keyword extractor, ATS score calculator, and Gemini analyzer. The `uploadResume` function we built earlier stays as is.

### Adding the Analyze Function (controllers/resumeController.js)

```javascript
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: "Missing resumeText or jobDescription",
      });
    }

    // Keyword extraction
    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);

    // Calculate ATS score
    const atsScore = calculateATSScore(jdKeywords, resumeKeywords);

    // Get AI analysis
    const aiSuggestions = await analyzeWithGemini(resumeText, jobDescription);

    res.json({
      success: true,
      atsScore,
      suggestions: aiSuggestions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

**Key points:**

- Three utilities run in sequence: extract keywords from both documents, calculate the ATS score, then call Gemini AI for detailed analysis
- The response combines the numerical score with AI-powered suggestions

### Adding the Analyze Route (routes/resumeRoutes.js)

Update `resumeRoutes.js` to include the new analyze endpoint:

```javascript
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import {
  uploadResume,
  analyzeResume,
} from "../controllers/resumeController.js";

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);
router.post("/analyze", authMiddleware, analyzeResume);

export default router;
```

**Key points:**

- We add `analyzeResume` to the import
- Create a new POST route at `/analyze`
- This route only needs `authMiddleware` (no Multer) because it receives JSON text, not a file

## Step 5: Connecting the Frontend to the Analyze API

After the upload step returns the extracted text, we immediately send it for analysis. This is the second half of `handleUploadAndAnalyze`:

This is already covered in Step 6 of the Upload Resume section above.

## Step 6: Displaying the Analysis Report in a Modal

After the analysis completes, we need to show the user their results — compatibility score, missing skills, optimization tips, and bullet point improvements. We display all of this in a modal overlay.

This is already covered in Step 6 of the Upload Resume section above in the complete `YourResumes` component code.

### Why the Report Variable?

```javascript
const report =
  analysisResult.suggestions?.analysis ??
  analysisResult.suggestions ??
  analysisResult;
```

The Gemini AI response can vary — sometimes the analysis is nested under `suggestions.analysis`, sometimes directly under `suggestions`. This chain of `??` (nullish coalescing) tries each level and uses the first one that exists, so the modal works regardless of response structure.

---

# Summary

## Functionalities Completed

✅ **Register & Login**: Users can create an account and log in to receive a secure JWT token  
✅ **Upload Resume**: Upload a PDF resume, extract text using pdfjs-dist, and return the parsed content  
✅ **Analyze Resume**: Calculate ATS keyword score and get AI-powered suggestions from Gemini

## Architecture Overview

```
Frontend (React + Vite)              Backend (Express + MongoDB)
┌─────────────────────┐              ┌─────────────────────────┐
│ Register Form       │──POST──────→ │ /auth/register          │
│ Login Form          │──POST──────→ │ /auth/login → JWT       │
│ Upload Resume       │──POST+File─→ │ /resume/upload → Parse  │
│ View Analysis       │──POST+JSON─→ │ /resume/analyze → AI    │
└─────────────────────┘              └─────────────────────────┘
                                              │
                                     ┌────────┴────────┐
                                     │ MongoDB Atlas    │
                                     │ (Users, Resumes) │
                                     └──────────────────┘
```

## Try It Yourself

- Add a Job Description textarea to the frontend so users can paste their target job description before analysis (currently it uses a placeholder string)
- Save analysis results to MongoDB using the Resume model, so users can view their past analyses
- Add a Logout button to the Navbar that removes the token from localStorage and redirects to the login page

---

# Setup & Installation Guide

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recommended)
- **Git** - [Download](https://git-scm.com/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/AI_RESUME_ATS_ANALYZER.git
cd AI_RESUME_ATS_ANALYZER/initial_code
```

## Step 2: Setup Environment Variables

### Backend Setup

1. Navigate to the `server` folder:

   ```bash
   cd server
   ```

2. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ATS_ANALYZER
   JWT_SECRET=your-super-secret-key-here-min-32-characters
   GEMINI_API_KEY=your-google-gemini-api-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   PORT=5000
   ```

### Getting Your Credentials

**MongoDB Atlas:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string and add to `MONGODB_URI`

**Gemini API Key:**

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key for your project

**Gmail App Password:**

1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Find "App passwords" and generate one
4. Use this password in `EMAIL_PASSWORD`

## Step 3: Install Backend Dependencies

```bash
npm install
```

## Step 4: Start the Backend Server

```bash
npm run start
```

You should see:

```
MongoDB connected
Server running on port 5000
```

## Step 5: Setup Frontend (New Terminal)

Open a **new terminal** and navigate to the client folder:

```bash
cd ../client
```

### Install Frontend Dependencies

```bash
npm install
```

## Step 6: Start the Frontend Development Server

```bash
npm run dev
```

You should see:

```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

## Step 7: Open the Application

Open your browser and go to:

```
http://localhost:5173
```

## 🎉 You're All Set!

### Test the Application

1. **Register** - Create a new account with your email
2. **Login** - Sign in with your credentials
3. **Upload Resume** - Choose a PDF file and paste a job description
4. **Analyze** - Get your ATS score and AI suggestions
5. **View Results** - Check the detailed analysis report

## Troubleshooting

| Issue                       | Solution                                                    |
| --------------------------- | ----------------------------------------------------------- |
| "MongoDB connection failed" | Check your `MONGODB_URI` in `.env`                          |
| "Cannot find module"        | Run `npm install` in both `server` and `client` folders     |
| "Invalid token"             | Clear browser cache/localStorage and log in again           |
| "Email not sending"         | Verify Gmail app password and 2FA is enabled                |
| "Port 5000 already in use"  | Change `PORT` in `.env` or kill the process using that port |

## Project Structure

```
AI_RESUME_ATS_ANALYZER/initial_code/
├── server/
│   ├── controllers/        # API logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & upload handlers
│   ├── utils/             # Helper functions
│   ├── .env               # Environment variables (DO NOT COMMIT)
│   ├── .env.example       # Template for .env
│   ├── package.json
│   └── server.js          # Main server file
│
├── client/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore             # Git ignore file
└── README.md              # This file
```

## Features Implemented

✅ User authentication with JWT  
✅ PDF resume parsing  
✅ ATS keyword matching  
✅ AI-powered analysis with Gemini  
✅ Job description matching  
✅ Analysis result persistence  
✅ Secure logout functionality  
✅ Beautiful modern UI with Glassmorphism  
✅ Contact form with email notifications

## API Endpoints

### Authentication

- `POST /auth/register` - Create a new account
- `POST /auth/login` - Login and get JWT token

### Resume

- `POST /resume/upload` - Upload and parse PDF resume
- `POST /resume/analyze` - Analyze resume against job description
- `POST /resume/save` - Save analysis results

### Contact

- `POST /contact/send` - Send contact message via email
- `GET /contact/all` - Get all contact messages (admin)

## Technologies Used

**Frontend:**

- React 18
- Vite
- React Router
- Fetch API

**Backend:**

- Node.js
- Express
- MongoDB
- JWT
- Nodemailer
- Google Gemini API

---

**Happy coding! 🚀**
