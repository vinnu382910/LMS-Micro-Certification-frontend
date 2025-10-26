# 📚 LMS Micro Certification Frontend

This is the **LMS Micro Certification Frontend**, built with **React.js**, to provide a seamless user experience for learners to register, login, attempt quizzes, view results, and download certificates. It interacts with the backend API to fetch quiz data, authenticate users, and manage quiz results.

---

## 🔗 Useful Links

- ✅ **Frontend GitHub Repository:** [LMS Micro Certification Frontend](https://github.com/vinnu382910/LMS-Micro-Certification-frontend)
- ✅ **Deployed Frontend:** [https://lms-micro-certification-frontend.vercel.app/](https://lms-micro-certification-frontend.vercel.app/)
- ✅ **Backend GitHub Repository:** [LMS Micro Certification Backend](https://github.com/vinnu382910/LMS-Micro-Certification-backend)
- ✅ **Deployed Backend:** [https://lms-micro-certification-backend.onrender.com](https://lms-micro-certification-backend.onrender.com)

---

## 🚀 Features

- ✅ User registration and login with validation
- ✅ JWT-based authentication to secure routes
- ✅ Quiz interface with timer, question navigation, and answer submission
- ✅ Display quiz results and pass/fail status
- ✅ Downloadable PDF certificates upon completion
- ✅ Responsive design with user-friendly UI
- ✅ Error handling for backend and frontend validation

---

## 📦 Technologies and Libraries Used

- ✅ **React.js** – Frontend library for building the UI
- ✅ **React Router DOM** – For routing and navigation between pages
- ✅ **Axios** – For making API requests to the backend
- ✅ **React Context API** – For managing global authentication state
- ✅ **JWT (JSON Web Token)** – Used to secure API requests
- ✅ **React Toastify** – For displaying notifications (optional enhancement)
- ✅ **CSS Modules** – For styling components with scoped styles
- ✅ **Vercel** – Deployment platform for the frontend
- ✅ **Render/Heroku/MongoDB Atlas** – Used for the backend and database services



## ⚙️ Project Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/micro-certifications-frontend.git
cd micro-certifications-frontend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory with:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

> ⚠️ Use your deployed backend URL in production.

### 4️⃣ Start the development server

```bash
npm start
```

The app will run at:

```
http://localhost:3000
```

---

## 🧩 Folder Structure

```
frontend/
│
├── src/
│   ├── api/
│   │   └── api.js                # Axios instance for API calls
│   │
│   ├── auth/
│   │   ├── AuthContext.js        # Handles global user authentication
│   │   ├── ProtectedRoute.js     # Restricts access to authenticated users
│   │
│   ├── components/
│   │   ├── Navbar/               # Reusable navbar
│   │   ├── QuizCard/             # Quiz display component
│   │   ├── CertificatePreview/   # Certificate section
│   │   └── Shared/Loader/        # Loading spinner
│   │
│   ├── pages/
│   │   ├── Auth/                 # Login & Register pages
│   │   ├── Dashboard/            # List of quizzes
│   │   ├── Quiz/                 # Start quiz, render questions, submit
│   │   ├── Results/              # Results and passed certifications
│   │   └── NotFound/             # 404 Page
│   │
│   ├── styles/                   # CSS files for styling
│   ├── App.js                    # Main routing file
│   ├── index.js                  # Entry point
│
│
├── package.json
├── .env
└── README.md
```

---

## 🧠 Key Features

### 🔐 Authentication

* Secure **Login** and **Register** forms
* JWT-based auth with `AuthContext`
* Token stored and verified for protected routes

### 🧭 Quiz Module

* Fetches quiz list using `GET /quiz/list`
* Filters by **Level**, **Technology**, and **Search** keyword
* Each quiz shows description, duration, and pass marks

### 🧩 Exam Flow

1. **Start Exam** → Creates a new `examSessionId`
2. **Fetch Questions** → Render dynamically
3. **Submit Answers** → Shows score, correct & wrong answers
4. **Result Saved** → Stored in backend (Results collection)

### 🧾 Certificates

* Available for passed quizzes
* Calls `/certificate/download` to generate PDF
* Shows “Download Certificate” button only if `pass = true`

### 📊 Results Tracking

* Displays all user quiz attempts with filters
* Pagination for large data
* Visual badges for “Passed” or “Failed”
* Quick certificate download from results screen

---

## 🔗 Backend Integration (API Endpoints)

The frontend communicates with the backend APIs defined in the **Micro-Certifications Backend**:

| Feature              | Endpoint                | Method | Protected |
| -------------------- | ----------------------- | ------ | --------- |
| Register             | `/auth/register`        | POST   | ❌         |
| Login                | `/auth/login`           | POST   | ❌         |
| Quiz List            | `/quiz/list`            | GET    | ❌         |
| Start Exam           | `/quiz/start/:quizId`   | POST   | ✅         |
| Get Questions        | `/quiz/:quizId`         | GET    | ✅         |
| Submit Quiz          | `/quiz/submit`          | POST   | ✅         |
| Passed Results       | `/user/passed-results`  | GET    | ✅         |
| Download Certificate | `/certificate/download` | POST   | ✅         |

---

## 🧠 Auth Flow (React Context)

1. `AuthContext` provides `user`, `login()`, `logout()` globally.
2. After successful login, JWT token is stored in memory or local/session storage.
3. `ProtectedRoute` ensures only authenticated users access quiz or results pages.
4. When the token expires, user is auto-logged out.

---

## 🌈 Notifications System

All notifications (login success, quiz submit, certificate download, errors, etc.)
use **React Toastify**, ensuring non-blocking and elegant feedback.

> 🧩 Tip: To avoid duplicate notifications, make sure the ToastContainer is used only **once** in `App.js`.

---

## 🧰 Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm start`     | Runs the app in development mode |
| `npm run build` | Builds the app for production    |
| `npm test`      | Runs test cases                  |
| `npm run lint`  | Lints the code for consistency   |

---

## 🖼️ UI Overview

**Pages:**

* **Home / Dashboard:** Displays all available quizzes
* **Quiz Start Page:** Shows instructions and “Start Quiz” button
* **Quiz Page:** Timed quiz interface
* **Result Page:** Displays marks, correct/wrong answers
* **Certificates Page:** Download earned certificates

**Sample Flow:**

```
Login → Dashboard → Start Quiz → Attempt → Submit → View Results → Download Certificate
```

---

## 📦 Deployment

You can deploy the frontend on:

* **Vercel**
* **Netlify**
* **Render**

Make sure to update your `.env` API base URL:

```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com
```

---

## 🧑‍💻 Author

👤 **Vinay Kalva**
Full Stack Developer | Cybersecurity Enthusiast

📧 [vinaykalva712@gmail.com](mailto:vinaykalva712@gmail.com)
🌐 GitHub: [vinaykalva712](https://github.com/vinaykalva712)

---

## 🏁 Conclusion

This frontend is tightly integrated with the **Micro-Certifications Backend**, providing a smooth, end-to-end certification experience — from login, exam, result tracking, to professional certificate generation.

---
