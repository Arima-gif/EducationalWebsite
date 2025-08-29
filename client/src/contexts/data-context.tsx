import React, { createContext, useContext, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import type { Organization, User, Course, Enrollment, OrganizationFormData, UserFormData, CourseFormData, EnrollmentFormData } from "@/types";

interface DataContextType {
  organizations: Organization[];
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  
  // Organization operations
  createOrganization: (data: OrganizationFormData) => void;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  
  // User operations
  createUser: (data: UserFormData) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Course operations
  createCourse: (data: CourseFormData) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Enrollment operations
  createEnrollment: (data: EnrollmentFormData) => void;
  updateEnrollment: (id: string, data: Partial<Enrollment>) => void;
  deleteEnrollment: (id: string) => void;
  
  // Helper functions
  getUsersByRole: (role: string) => User[];
  getCoursesByOrganization: (organizationId: string) => Course[];
  getEnrollmentsByCourse: (courseId: string) => Enrollment[];
  getUsersByOrganization: (organizationId: string) => User[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Load data from localStorage on initialization
  useEffect(() => {
    const savedOrganizations = localStorage.getItem("organizations");
    const savedUsers = localStorage.getItem("users");
    const savedCourses = localStorage.getItem("courses");
    const savedEnrollments = localStorage.getItem("enrollments");

    if (savedOrganizations) {
      setOrganizations(JSON.parse(savedOrganizations));
    } else {
      // Load sample data if no saved data exists
      import("@/data/sampleData").then(({ sampleOrganizations }) => {
        setOrganizations(sampleOrganizations);
      });
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      import("@/data/sampleData").then(({ sampleUsers }) => {
        setUsers(sampleUsers);
      });
    }

    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      import("@/data/sampleData").then(({ sampleCourses }) => {
        setCourses(sampleCourses);
      });
    }

    if (savedEnrollments) {
      setEnrollments(JSON.parse(savedEnrollments));
    } else {
      import("@/data/sampleData").then(({ sampleEnrollments }) => {
        setEnrollments(sampleEnrollments);
      });
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("organizations", JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("enrollments", JSON.stringify(enrollments));
  }, [enrollments]);

  // Organization operations
  const createOrganization = (data: OrganizationFormData) => {
    const newOrganization: Organization = {
      ...data,
      id: nanoid(),
      createdAt: new Date(),
      address: data.address || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
    };
    setOrganizations(prev => [...prev, newOrganization]);
  };

  const updateOrganization = (id: string, data: Partial<Organization>) => {
    setOrganizations(prev => prev.map(org => 
      org.id === id ? { ...org, ...data } : org
    ));
  };

  const deleteOrganization = (id: string) => {
    setOrganizations(prev => prev.filter(org => org.id !== id));
    // Also delete related users and courses
    setUsers(prev => prev.filter(user => user.organizationId !== id));
    setCourses(prev => prev.filter(course => course.organizationId !== id));
  };

  // User operations
  const createUser = (data: UserFormData) => {
    const newUser: User = {
      ...data,
      id: nanoid(),
      createdAt: new Date(),
      lastActive: new Date(),
      phone: data.phone || undefined,
      organizationId: data.organizationId || undefined,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...data } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // Also delete related enrollments
    setEnrollments(prev => prev.filter(enrollment => enrollment.studentId !== id));
  };

  // Course operations
  const createCourse = (data: CourseFormData) => {
    const newCourse: Course = {
      ...data,
      id: nanoid(),
      createdAt: new Date(),
      description: data.description || undefined,
      duration: data.duration || undefined,
      maxStudents: data.maxStudents || undefined,
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses(prev => prev.map(course => 
      course.id === id ? { ...course, ...data } : course
    ));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
    // Also delete related enrollments
    setEnrollments(prev => prev.filter(enrollment => enrollment.courseId !== id));
  };

  // Enrollment operations
  const createEnrollment = (data: EnrollmentFormData) => {
    const newEnrollment: Enrollment = {
      ...data,
      id: nanoid(),
      enrollmentDate: new Date(),
      progress: data.progress || undefined,
    };
    setEnrollments(prev => [...prev, newEnrollment]);
  };

  const updateEnrollment = (id: string, data: Partial<Enrollment>) => {
    setEnrollments(prev => prev.map(enrollment => 
      enrollment.id === id ? { ...enrollment, ...data } : enrollment
    ));
  };

  const deleteEnrollment = (id: string) => {
    setEnrollments(prev => prev.filter(enrollment => enrollment.id !== id));
  };

  // Helper functions
  const getUsersByRole = (role: string) => {
    return users.filter(user => user.role === role);
  };

  const getCoursesByOrganization = (organizationId: string) => {
    return courses.filter(course => course.organizationId === organizationId);
  };

  const getEnrollmentsByCourse = (courseId: string) => {
    return enrollments.filter(enrollment => enrollment.courseId === courseId);
  };

  const getUsersByOrganization = (organizationId: string) => {
    return users.filter(user => user.organizationId === organizationId);
  };

  const value: DataContextType = {
    organizations,
    users,
    courses,
    enrollments,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    createUser,
    updateUser,
    deleteUser,
    createCourse,
    updateCourse,
    deleteCourse,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    getUsersByRole,
    getCoursesByOrganization,
    getEnrollmentsByCourse,
    getUsersByOrganization,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
