import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useData } from "@/contexts/data-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { insertCourseSchema, type InsertCourse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string | null;
}

export default function CourseForm({ open, onOpenChange, courseId }: CourseFormProps) {
  const { courses, organizations, users, createCourse, updateCourse, getUsersByRole } = useData();
  const { toast } = useToast();

  const instructors = getUsersByRole('instructor');
  const isEditing = !!courseId;
  const course = courseId ? courses.find(c => c.id === courseId) : null;

  const form = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      organizationId: "",
      instructorId: "",
      duration: undefined,
      maxStudents: undefined,
      status: "draft",
    },
  });

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description || "",
        organizationId: course.organizationId,
        instructorId: course.instructorId,
        duration: course.duration || undefined,
        maxStudents: course.maxStudents || undefined,
        status: course.status,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        organizationId: "",
        instructorId: "",
        duration: undefined,
        maxStudents: undefined,
        status: "draft",
      });
    }
  }, [course, form]);

  const onSubmit = (data: InsertCourse) => {
    try {
      if (isEditing && courseId) {
        updateCourse(courseId, data);
        toast({
          title: "Course updated",
          description: "The course has been successfully updated.",
        });
      } else {
        createCourse(data);
        toast({
          title: "Course created",
          description: "The course has been successfully created.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedOrganization = form.watch("organizationId");
  const availableInstructors = selectedOrganization
    ? instructors.filter(instructor => instructor.organizationId === selectedOrganization)
    : instructors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="course-form">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Course" : "Add Course"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course title" {...field} data-testid="input-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter course description" {...field} value={field.value || ""} data-testid="input-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-organization">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.length === 0 ? (
                          <SelectItem value="none" disabled>No organizations available</SelectItem>
                        ) : (
                          organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-instructor">
                          <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableInstructors.length === 0 ? (
                          <SelectItem value="none" disabled>
                            {selectedOrganization ? "No instructors in selected organization" : "Select organization first"}
                          </SelectItem>
                        ) : (
                          availableInstructors.map((instructor) => (
                            <SelectItem key={instructor.id} value={instructor.id}>
                              {instructor.firstName} {instructor.lastName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (weeks)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter duration"
                        min="1"
                        max="52"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Students</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter max students"
                        min="1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-max-students"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="cancel-button">
                Cancel
              </Button>
              <Button type="submit" data-testid="submit-button">
                {isEditing ? "Update Course" : "Add Course"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
