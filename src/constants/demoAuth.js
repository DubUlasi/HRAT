// Shared fixed demo verification code — this mock app has no real SMS/email/authenticator-app
// delivery, so every one-time-code flow (Forgot Password, enabling Two-Factor Authentication)
// uses this same fixed code instead of each inventing its own, same spirit as mockUsers' shared
// DEMO_PASSWORD.
export const DEMO_OTP = '000000';
