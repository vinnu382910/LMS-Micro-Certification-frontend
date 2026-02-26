# LMS Micro Certification Frontend

React frontend for quiz platform with secure cookie auth and OTP-based account security.

## Auth Changes
- JWT is no longer stored in localStorage/sessionStorage.
- Backend sets HTTP-only cookie on login.
- Frontend session state is fetched using `GET /auth/me`.
- Email verification uses OTP (not verification link).
- Password reset uses OTP (not reset link token).

## Auth Routes
- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/reset-password`

## Environment
Create `.env` in `frontend/`:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

## Localhost Requirements
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Axios uses `withCredentials: true`
- Backend CORS credentials must be enabled

## Production Requirements
If frontend/backend are on different domains:
- Backend cookie must be `sameSite: "none"` and `secure: true`
- Frontend keeps `withCredentials: true`
- Deploy over HTTPS

## OTP Flow
1. Register -> OTP sent to email.
2. Verify OTP at `/verify-email`.
3. Login.
4. Forgot password -> reset OTP sent.
5. Reset password via OTP.

## Run
```bash
npm install
npm start
```
