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

---

## 📁 Folder Structure

```

frontend/
├── src/
│   ├── api/
│   │   └── api.js
│   ├── components/
│   │   ├── Header/
│   │   ├── Quiz/
│   │   ├── Result/
│   │   ├── Login/
│   │   ├── Register/
│   │   └── CertificateButton/
│   ├── context/
│   │   └── AuthContext.js
│   ├── App.js
│   ├── index.js
│   └── styles/
│       └── Login.css, Quiz.css, Result.css, etc.
├── public/
├── package.json
└── README.md

````

---

## 📖 Key Components

### ✅ **Login.js**
- Allows users to enter their email and password.
- Handles validation and displays error messages.
- Stores JWT on successful login.
- Navigates users to the home page.

### ✅ **Register.js**
- Allows new users to register.
- Redirects to login after successful registration.

### ✅ **Quiz.js**
- Displays quiz questions one at a time.
- Implements a timer to limit quiz duration.
- Submits answers and stores the result.

### ✅ **Result.js**
- Shows quiz results with score and pass/fail.
- Allows downloading the certificate.

### ✅ **CertificateButton.js**
- Sends data to the backend and downloads the certificate as a PDF file.

### ✅ **Header.js**
- Displays the company name, welcome message, and sign-out button.

---

## 🔑 Authentication Workflow

- On login, a JWT token is stored in localStorage.
- Protected routes check for the token and allow access.
- API requests attach the token in the `Authorization` header.
- Logout clears the token and redirects users to the login page.

---

## 📂 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vinnu382910/LMS-Micro-Certification-frontend.git
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm start
   ```

The frontend will run at [http://localhost:3000](http://localhost:3000) by default.

---

## ⚙ Environment Setup

Make sure the backend is running and accessible at the correct API URL (`https://lms-micro-certification-backend.onrender.com/api`). You can adjust the API base URL in `src/api/api.js` if necessary.

---

## 📦 Available Scripts

* `npm start` – Runs the app in development mode.
* `npm build` – Builds the app for production.
* `npm test` – Runs test cases if implemented.
* `npm eject` – Exposes configuration files (use with caution).

---

## 📢 Notes

* Ensure that the backend URL is correctly set in `api.js`.
* The JWT token must be stored securely (localStorage is used here for simplicity).
* CORS issues can arise if the backend URL is incorrect or not properly configured.
* Styles are maintained in individual CSS files for each component to keep them modular and clean.

---

## 💻 License

This project is open-source and free to use.

---

Happy learning, developing, and creating impactful web applications! 🚀✨
