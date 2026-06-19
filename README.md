# 🎫 HelpDesk Lite

An enterprise-grade, full-stack IT Support Ticketing System designed for high-efficiency issue resolution. Built with the MERN stack, this platform features role-based access control, secure cloud-based file attachments, concurrency-safe ticket management, and deep AI integrations powered by the Gemini API.

---

## ✨ Core Features

### 🤖 AI Integrations (Powered by Gemini API)
* **Smart Categorization & Prioritization:** AI automatically analyzes ticket titles and descriptions upon submission to instantly route issues to the correct category and assign priority levels (`low`, `medium`, `high`).
* **Agent Suggested Replies:** Support agents can generate context-aware draft replies. The AI analyzes the ticket's history, title, and description to generate a professional, accurate response.
* **Global FAQ Chatbot:** A persistent, pre-programmed knowledge-base chatbot available on all screens to deflect common IT queries (VPN, Wi-Fi, Password Resets) before a ticket is created.

### ✉️ Automated Email Notifications (Resend API)
*Bypasses standard cloud-host SMTP port restrictions using HTTP-based email delivery.*
* **Status Updates:** Automatically emails the end-user when an agent updates their ticket status (e.g., prompting them to review a `resolved` ticket).
* **New Comment Alerts:** Dispatches email alerts to the end-user containing the agent's message whenever a reply is posted.
* **Secure Password Reset:** Handles secure token generation and sends a 10-minute expiry reset link to users.

### 🛡️ Role-Based Access Control (RBAC) & Security
* **JWT Authentication:** Secure login using encrypted JSON Web Tokens.
* **Three-Tier Architecture:** * `End-User`: Can submit, view, and manage their own tickets.
  * `Support-Agent`: Can view unassigned pools, claim tickets, and manage their workload.
  * `Admin`: Full system access, including analytics, user role management, and category configuration.

### 👨‍💻 Advanced Agent & Admin Tools
* **Concurrency-Safe Ticket Claiming:** Engineered with strict database-level locking to prevent race conditions where two agents attempt to claim the same unassigned ticket simultaneously.
* **Admin Analytics Dashboard:** High-level metrics tracking total ticket volume, open/resolved ratios, and a visual 7-day trend chart.
* **Cloudinary File Pipeline:** Engineered a robust `multipart/form-data` pipeline using Multer and Cloudinary for seamless, secure attachment handling (images and PDFs) on ticket submissions.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Axios, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Integrations:** * **Google Gemini API** (LLM & Context Processing)
  * **Resend API** (Transactional Emails)
  * **Cloudinary** (Cloud Media Management)

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/HelpdeskLite.git](https://github.com/yourusername/HelpdeskLite.git)
cd HelpdeskLite

2. Install Dependencies 
# Install backend dependencies (uses legacy-peer-deps to prevent package conflicts)
cd backend
npm install --legacy-peer-deps

# Install frontend dependencies
cd ../frontend
npm install

3. Environment Variables
Create a .env file in the backend directory:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Third-Party APIs
RESEND_API_KEY=your_resend_key
GEMINI_API_KEY=your_gemini_api_key

4. Run the Application
Run the client and server concurrently across two terminal windows:

Terminal 1 (Backend):
cd backend
node server.js

Terminal 2 (Frontend):
cd frontend
npm run dev

🏗️ Deployment Architecture
Backend: Hosted on Render.

Frontend: Hosted on Vercel.

Database: Hosted on MongoDB Atlas.

Designed and engineered by Vedant Singh.