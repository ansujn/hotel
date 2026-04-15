import { z } from "zod";

export const otpSendSchema = z.object({
  phone: z.string().regex(/^\+\d{10,15}$/, "E.164 phone required"),
});
export type OtpSendInput = z.infer<typeof otpSendSchema>;

export const otpVerifySchema = z.object({
  phone: z.string().regex(/^\+\d{10,15}$/),
  code: z.string().min(4).max(8),
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
