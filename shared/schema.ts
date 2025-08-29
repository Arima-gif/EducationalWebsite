import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'instructor', 'support', 'student']);
export const statusEnum = pgEnum('status', ['active', 'inactive']);
export const courseStatusEnum = pgEnum('course_status', ['active', 'inactive', 'draft']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['active', 'completed', 'dropped']);

// Organizations table
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  managerId: text('manager_id'),
  status: statusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('student'),
  organizationId: text('organization_id'),
  status: statusEnum('status').notNull().default('active'),
  lastActive: timestamp('last_active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Courses table
export const courses = pgTable('courses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  instructorId: text('instructor_id'),
  organizationId: text('organization_id'),
  duration: integer('duration'),
  maxStudents: integer('max_students'),
  status: courseStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Enrollments table
export const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text('student_id').notNull(),
  courseId: text('course_id').notNull(),
  enrollmentDate: timestamp('enrollment_date').notNull().defaultNow(),
  status: enrollmentStatusEnum('status').notNull().default('active'),
  progress: integer('progress').default(0),
});

// Insert schemas - simplified approach to avoid compatibility issues
export const insertOrganizationSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  managerId: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const insertUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'instructor', 'support', 'student']).default('student'),
  organizationId: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const insertCourseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  instructorId: z.string().optional(),
  organizationId: z.string().optional(),
  duration: z.number().optional(),
  maxStudents: z.number().optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
});

export const insertEnrollmentSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  status: z.enum(['active', 'completed', 'dropped']).default('active'),
  progress: z.number().optional(),
});

// Types
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;