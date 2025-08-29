import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useData } from "@/contexts/data-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { insertEnrollmentSchema, type InsertEnrollment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EnrollmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId?: string | null;
}

export default function EnrollmentForm({ open, onOpenChange, enrollmentId }: EnrollmentFormProps) {
  const { enrollments, users, courses, createEnrollment, updateEnrollment, getUsersByRole } = useData();
  const { toast } = useToast();

  const students = getUsersByRole('student');
  const isEditing = !!enrollmentId;
  const enrollment = enrollmentId ? enrollments.find(e => e.id === enrollmentId) : null;

  const form = useForm<InsertEnrollment>({
    resolver: zodResolver(insertEnrollmentSchema),
    defaultValues: {
      studentId: "",
      courseId: "",
      status: "active",
      progress: 0,
    },
  });

  useEffect(() => {
    if (enrollment) {
      form.reset({
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        status: enrollment.status,
        progress: enrollment.progress || 0,
      });
    } else {
      form.reset({
        studentId: "",
        courseId: "",
        status: "active",
        progress: 0,
      });
    }
  }, [enrollment, form]);

  const onSubmit = (data: InsertEnrollment) => {
    try {
      // Check if student is already enrolled in the course (only for new enrollments)
      if (!isEditing) {
        const existingEnrollment = enrollments.find(
          e => e.studentId === data.studentId && e.courseId === data.courseId
        );
        if (existingEnrollment) {
          toast({
            title: "Student already enrolled",
            description: "This student is already enrolled in the selected course.",
            variant: "destructive",
          });
          return;
        }
      }

      if (isEditing && enrollmentId) {
        updateEnrollment(enrollmentId, data);
        toast({
          title: "Enrollment updated",
          description: "The enrollment has been successfully updated.",
        });
      } else {
        createEnrollment(data);
        toast({
          title: "Enrollment created",
          description: "The student has been successfully enrolled in the course.",
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

  const activeCourses = courses.filter(course => course.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="enrollment-form">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Enrollment" : "Add Enrollment"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-student">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.length === 0 ? (
                        <SelectItem value="none" disabled>No students available</SelectItem>
                      ) : (
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} ({student.email})
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
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-course">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeCourses.length === 0 ? (
                        <SelectItem value="none" disabled>No active courses available</SelectItem>
                      ) : (
                        activeCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter progress percentage"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      data-testid="input-progress"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="cancel-button">
                Cancel
              </Button>
              <Button type="submit" data-testid="submit-button">
                {isEditing ? "Update Enrollment" : "Add Enrollment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
