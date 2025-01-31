import { createTransport } from "nodemailer";
import { config } from "../config";

const transporter = createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
  });
};
