import type { Organization, User, Course, Enrollment } from "@/types";

export const sampleOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Tech Academy",
    address: "123 Innovation Drive, Tech City",
    phone: "+1-555-0123",
    email: "info@techacademy.com",
    managerId: "user-1",
    status: "active",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "org-2", 
    name: "Global Learning Institute",
    address: "456 Education Blvd, Learning Town",
    phone: "+1-555-0456",
    email: "contact@globallearning.org",
    managerId: "user-2",
    status: "active",
    createdAt: new Date("2024-02-10"),
  },
];

export const sampleUsers: User[] = [
  {
    id: "user-1",
    firstName: "John",
    lastName: "Manager",
    email: "john.manager@techacademy.com",
    phone: "+1-555-1111",
    role: "manager",
    organizationId: "org-1",
    status: "active",
    lastActive: new Date("2024-12-20"),
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "user-2",
    firstName: "Sarah",
    lastName: "Director",
    email: "sarah.director@globallearning.org",
    phone: "+1-555-2222",
    role: "manager",
    organizationId: "org-2", 
    status: "active",
    lastActive: new Date("2024-12-19"),
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "user-3",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@techacademy.com",
    phone: "+1-555-3333",
    role: "instructor",
    organizationId: "org-1",
    status: "active",
    lastActive: new Date("2024-12-20"),
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "user-4",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@student.edu",
    role: "student",
    organizationId: "org-1",
    status: "active",
    lastActive: new Date("2024-12-18"),
    createdAt: new Date("2024-09-01"),
  },
];

export const sampleCourses: Course[] = [
  {
    id: "course-1",
    title: "Introduction to React",
    description: "Learn the fundamentals of React.js and build modern web applications",
    instructorId: "user-3",
    organizationId: "org-1",
    duration: 8,
    maxStudents: 25,
    status: "active",
    createdAt: new Date("2024-08-15"),
  },
  {
    id: "course-2",
    title: "Advanced Database Design",
    description: "Master database architecture and SQL optimization techniques",
    instructorId: "user-3",
    organizationId: "org-1",
    duration: 12,
    maxStudents: 20,
    status: "active",
    createdAt: new Date("2024-09-01"),
  },
];

export const sampleEnrollments: Enrollment[] = [
  {
    id: "enrollment-1",
    studentId: "user-4",
    courseId: "course-1",
    enrollmentDate: new Date("2024-09-15"),
    status: "active",
    progress: 65,
  },
  {
    id: "enrollment-2",
    studentId: "user-4",
    courseId: "course-2",
    enrollmentDate: new Date("2024-10-01"),
    status: "active",
    progress: 30,
  },
];