import { z } from "zod"

// Workspace member schema
const memberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  role: z.enum(["admin", "basic_member"], {
    errorMap: () => ({ message: "Role must be either admin or basic_member" }),
  }),
})

// Main workspace creation schema
export const workspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(256, "Workspace name must be less than 256 characters")
    .refine(
      (name) => !/<|>/.test(name),
      "Workspace name cannot contain HTML tags",
    ),

  adminEmail: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Admin email is required"),

  adminName: z
    .string()
    .max(100, "Name must be less than 100 characters")
    .optional(),

  members: z
    .array(memberSchema)
    .optional()
    .default([])
    .refine((members) => {
      if (!members || members.length === 0) return true
      const emails = members.map((m) => m.email.toLowerCase())
      return new Set(emails).size === emails.length
    }, "Duplicate email addresses are not allowed"),

  pageData: z.any().optional(),
})

// Type inference
export type WorkspaceFormData = z.infer<typeof workspaceSchema>

// Helper function to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50)
}

// Validation for file uploads (handled separately from main schema)
export const logoFileSchema = z.object({
  size: z.number().max(10 * 1024 * 1024, "File size must be less than 10MB"),
  type: z
    .string()
    .refine(
      (type) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type),
      "File must be a valid image (JPEG, PNG, GIF, or WebP)",
    ),
})

export type LogoFile = z.infer<typeof logoFileSchema>
