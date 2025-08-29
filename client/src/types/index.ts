// Types for the frontend-only application

export interface Organization {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'instructor' | 'support' | 'student';
  organizationId?: string;
  status: 'active' | 'inactive';
  lastActive?: Date;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  instructorId?: string;
  organizationId?: string;
  duration?: number;
  maxStudents?: number;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'dropped';
  progress?: number;
}

// Form data types
export type OrganizationFormData = Omit<Organization, 'id' | 'createdAt'>;
export type UserFormData = Omit<User, 'id' | 'createdAt'>;
export type CourseFormData = Omit<Course, 'id' | 'createdAt'>;
export type EnrollmentFormData = Omit<Enrollment, 'id' | 'enrollmentDate'>;