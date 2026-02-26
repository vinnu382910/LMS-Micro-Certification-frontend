# Micro-Certifications Backend

Secure Node.js + Express + MongoDB backend for quizzes, results, certificates, and authentication.

## Security Model
- HTTP-only cookie JWT auth (`token` cookie).
- Email verification uses 6-digit OTP (5-minute expiry).
- Password reset uses 6-digit OTP (5-minute expiry).
- OTP values are hashed with SHA-256 in DB.
- OTP resend cooldown: 60 seconds.
- OTP resend/request rate limit: 5 requests per hour.

## Email Provider (SMTP, No Domain Purchase)
This project now uses SMTP instead of Resend domain flow.
You can use Gmail + App Password.

## Environment Variables
Create `.env` in `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_APP_NAME=sbtexam
```

## Localhost Cookie Requirements
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- CORS credentials enabled
- Cookie in dev: `httpOnly: true`, `secure: false`, `sameSite: "lax"`
- Frontend Axios must use `withCredentials: true`

## Production Notes
For production (HTTPS):
- Set `NODE_ENV=production`
- Cookie: `secure: true`, `sameSite: "none"`, `httpOnly: true`
- Set `FRONTEND_URL` to exact deployed frontend URL
- Keep `withCredentials: true` on frontend

## Auth API Endpoints
### Public
- `POST /auth/register` -> sends verification OTP
- `POST /auth/login`
- `POST /auth/verify-email-otp`
- `POST /auth/resend-email-otp`
- `POST /auth/forgot-password` -> sends reset OTP
- `POST /auth/reset-password` -> `{ email, otp, password }`

### Protected
- `GET /auth/me`
- `POST /auth/logout`

## Run
```bash
npm install
npm run dev
```
