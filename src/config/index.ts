export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiry: "24h",
  emailVerificationExpiry: 24 * 60 * 60 * 1000,
  passwordResetExpiry: 1 * 60 * 60 * 1000,
  email: {
    from: process.env.EMAIL_FROM || "noreply@example.com",
    host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.EMAIL_PORT || "2525"),
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
};
