import { z } from 'zod';

// Payment form validation
export const paymentSchema = z.object({
  amount: z.number()
    .positive({ message: "Amount must be positive" })
    .min(1, { message: "Amount must be at least ₹1" })
    .max(1000000, { message: "Amount cannot exceed ₹10,00,000" }),
  paymentMethod: z.string().min(1, { message: "Please select a payment method" }),
  description: z.string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional()
});

// Payment request validation
export const paymentRequestSchema = z.object({
  amount: z.number()
    .positive({ message: "Amount must be positive" })
    .min(1, { message: "Amount must be at least ₹1" })
    .max(1000000, { message: "Amount cannot exceed ₹10,00,000" }),
  description: z.string()
    .min(1, { message: "Description is required" })
    .max(500, { message: "Description must be less than 500 characters" }),
  requesterEmail: z.string()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .optional()
    .or(z.literal('')),
  requesterPhone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })
    .optional()
    .or(z.literal(''))
});

// Razorpay settings validation
export const razorpaySettingsSchema = z.object({
  keyId: z.string()
    .min(10, { message: "API Key ID must be at least 10 characters" })
    .regex(/^rzp_(test|live)_[a-zA-Z0-9]+$/, { message: "Invalid Razorpay Key ID format" }),
  keySecret: z.string()
    .min(10, { message: "API Key Secret must be at least 10 characters" }),
  businessName: z.string()
    .max(100, { message: "Business name must be less than 100 characters" })
    .optional(),
  businessEmail: z.string()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .optional()
    .or(z.literal('')),
  businessPhone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })
    .optional()
    .or(z.literal('')),
  businessAddress: z.string()
    .max(500, { message: "Address must be less than 500 characters" })
    .optional()
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
export type PaymentRequestFormData = z.infer<typeof paymentRequestSchema>;
export type RazorpaySettingsFormData = z.infer<typeof razorpaySettingsSchema>;
