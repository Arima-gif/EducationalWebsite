import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Organization, User, Course, Enrollment, OrganizationFormData, UserFormData, CourseFormData, EnrollmentFormData } from "@/types";

interface ApiDataContextType {
  organizations: Organization[];
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  
  // Loading states
  isLoading: boolean;
  
  // Organization operations
  createOrganization: (data: OrganizationFormData) => Promise<void>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  
  // User operations
  createUser: (data: UserFormData) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Course operations
  createCourse: (data: CourseFormData) => Promise<void>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  
  // Enrollment operations
  createEnrollment: (data: EnrollmentFormData) => Promise<void>;
  updateEnrollment: (id: string, data: Partial<Enrollment>) => Promise<void>;
  deleteEnrollment: (id: string) => Promise<void>;
  
  // Helper functions
  getUsersByRole: (role: string) => User[];
  getCoursesByOrganization: (organizationId: string) => Course[];
  getEnrollmentsByCourse: (courseId: string) => Enrollment[];
  getUsersByOrganization: (organizationId: string) => User[];
}

const ApiDataContext = createContext<ApiDataContextType | undefined>(undefined);

export function useApiData() {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error("useApiData must be used within an ApiDataProvider");
  }
  return context;
}

export function ApiDataProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch all data with React Query
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  // Loading state
  const isLoading = false; // React Query handles loading states individually

  // Organization mutations
  const createOrgMutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const response = await apiRequest("POST", "/api/organizations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
    },
  });

  const updateOrgMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Organization> }) => {
      const response = await apiRequest("PUT", `/api/organizations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
    },
  });

  const deleteOrgMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/organizations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
    },
  });

  // User mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  // Course mutations
  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await apiRequest("POST", "/api/courses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Course> }) => {
      const response = await apiRequest("PUT", `/api/courses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
  });

  // Enrollment mutations
  const createEnrollmentMutation = useMutation({
    mutationFn: async (data: EnrollmentFormData) => {
      const response = await apiRequest("POST", "/api/enrollments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Enrollment> }) => {
      const response = await apiRequest("PUT", `/api/enrollments/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
  });

  const deleteEnrollmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/enrollments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
  });

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

  const value: ApiDataContextType = {
    organizations,
    users,
    courses,
    enrollments,
    isLoading,

    // Organization operations
    createOrganization: async (data: OrganizationFormData) => {
      await createOrgMutation.mutateAsync(data);
    },
    updateOrganization: async (id: string, data: Partial<Organization>) => {
      await updateOrgMutation.mutateAsync({ id, data });
    },
    deleteOrganization: async (id: string) => {
      await deleteOrgMutation.mutateAsync(id);
    },

    // User operations
    createUser: async (data: UserFormData) => {
      await createUserMutation.mutateAsync(data);
    },
    updateUser: async (id: string, data: Partial<User>) => {
      await updateUserMutation.mutateAsync({ id, data });
    },
    deleteUser: async (id: string) => {
      await deleteUserMutation.mutateAsync(id);
    },

    // Course operations
    createCourse: async (data: CourseFormData) => {
      await createCourseMutation.mutateAsync(data);
    },
    updateCourse: async (id: string, data: Partial<Course>) => {
      await updateCourseMutation.mutateAsync({ id, data });
    },
    deleteCourse: async (id: string) => {
      await deleteCourseMutation.mutateAsync(id);
    },

    // Enrollment operations
    createEnrollment: async (data: EnrollmentFormData) => {
      await createEnrollmentMutation.mutateAsync(data);
    },
    updateEnrollment: async (id: string, data: Partial<Enrollment>) => {
      await updateEnrollmentMutation.mutateAsync({ id, data });
    },
    deleteEnrollment: async (id: string) => {
      await deleteEnrollmentMutation.mutateAsync(id);
    },

    // Helper functions
    getUsersByRole,
    getCoursesByOrganization,
    getEnrollmentsByCourse,
    getUsersByOrganization,
  };

  return (
    <ApiDataContext.Provider value={value}>
      {children}
    </ApiDataContext.Provider>
  );
}