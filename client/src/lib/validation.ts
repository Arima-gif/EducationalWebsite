import { z } from "zod";

// Organization validation schema
export const organizationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  managerId: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

// User validation schema
export const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "instructor", "support", "student"]),
  organizationId: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

// Course validation schema
export const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  instructorId: z.string().optional(),
  organizationId: z.string().optional(),
  duration: z.number().min(1).optional(),
  maxStudents: z.number().min(1).optional(),
  status: z.enum(["active", "inactive", "draft"]),
});

// Enrollment validation schema
export const enrollmentFormSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  courseId: z.string().min(1, "Course is required"),
  status: z.enum(["active", "completed", "dropped"]),
  progress: z.number().min(0).max(100).optional(),
});