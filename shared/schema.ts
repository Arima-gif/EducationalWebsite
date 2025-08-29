import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  status: text("status", { enum: ['active', 'inactive'] }).notNull().default('active'),
  managerId: varchar("manager_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role", { enum: ['admin', 'manager', 'instructor', 'support', 'student'] }).notNull(),
  organizationId: varchar("organization_id"),
  status: text("status", { enum: ['active', 'inactive'] }).notNull().default('active'),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  organizationId: varchar("organization_id").notNull(),
  instructorId: varchar("instructor_id").notNull(),
  duration: integer("duration"), // in weeks
  maxStudents: integer("max_students"),
  status: text("status", { enum: ['draft', 'active', 'inactive'] }).notNull().default('draft'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id").notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
  status: text("status", { enum: ['active', 'completed', 'dropped'] }).notNull().default('active'),
  progress: integer("progress").default(0), // percentage 0-100
});

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrollmentDate: true,
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

// Role and status enums for easier usage
export const UserRole = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  INSTRUCTOR: 'instructor' as const,
  SUPPORT: 'support' as const,
  STUDENT: 'student' as const,
};

export const Status = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
};

export const CourseStatus = {
  DRAFT: 'draft' as const,
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
};

export const EnrollmentStatus = {
  ACTIVE: 'active' as const,
  COMPLETED: 'completed' as const,
  DROPPED: 'dropped' as const,
};
