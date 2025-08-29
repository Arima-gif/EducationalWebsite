import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import EnrollmentForm from "./enrollment-form";
import ConfirmationDialog from "@/components/common/confirmation-dialog";
import { Plus, Edit, X, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnrollmentTableProps {
  searchQuery: string;
}

export default function EnrollmentTable({ searchQuery }: EnrollmentTableProps) {
  const { enrollments, users, courses, organizations, deleteEnrollment } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredEnrollments = enrollments
    .filter(enrollment => {
      const student = users.find(u => u.id === enrollment.studentId);
      const course = courses.find(c => c.id === enrollment.courseId);
      
      const matchesSearch = student 
        ? `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
        : false;
      
      const matchesCourse = courseFilter === "all" || enrollment.courseId === courseFilter;
      const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
      
      return matchesSearch && matchesCourse && matchesStatus;
    })
    .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime());

  const handleDelete = (id: string) => {
    deleteEnrollment(id);
    setDeleteConfirm(null);
    toast({
      title: "Enrollment removed",
      description: "The student has been unenrolled from the course.",
    });
  };

  const handleEdit = (id: string) => {
    setEditingEnrollment(id);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEnrollment(null);
  };

  const exportData = () => {
    const data = filteredEnrollments.map(enrollment => {
      const student = users.find(u => u.id === enrollment.studentId);
      const course = courses.find(c => c.id === enrollment.courseId);
      const instructor = course ? users.find(u => u.id === course.instructorId) : null;
      const organization = course ? organizations.find(o => o.id === course.organizationId) : null;
      
      return {
        Student: student ? `${student.firstName} ${student.lastName}` : "Unknown",
        "Student Email": student?.email || "",
        Course: course?.title || "Unknown",
        Instructor: instructor ? `${instructor.firstName} ${instructor.lastName}` : "No instructor",
        Organization: organization?.name || "No organization",
        "Enrollment Date": new Date(enrollment.enrollmentDate).toLocaleDateString(),
        Status: enrollment.status,
        Progress: `${enrollment.progress || 0}%`,
      };
    });

    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Enrollments data has been exported to CSV.",
    });
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Enrollments</h2>
          <p className="text-muted-foreground">Manage student course enrollments</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} data-testid="add-enrollment">
          <Plus className="w-4 h-4 mr-2" />
          Add Enrollment
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Course:</label>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48" data-testid="course-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="secondary" onClick={exportData} data-testid="export-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Enrollments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Student</th>
                <th className="text-left p-4 font-medium text-foreground">Course</th>
                <th className="text-left p-4 font-medium text-foreground">Instructor</th>
                <th className="text-left p-4 font-medium text-foreground">Enrollment Date</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Progress</th>
                <th className="text-left p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    {searchQuery ? "No enrollments found matching your search." : "No enrollments yet. Create your first enrollment to get started."}
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => {
                  const student = users.find(u => u.id === enrollment.studentId);
                  const course = courses.find(c => c.id === enrollment.courseId);
                  const instructor = course ? users.find(u => u.id === course.instructorId) : null;
                  const organization = course ? organizations.find(o => o.id === course.organizationId) : null;

                  return (
                    <tr key={enrollment.id} className="hover:bg-secondary/30 transition-colors" data-testid={`enrollment-row-${enrollment.id}`}>
                      <td className="p-4">
                        {student ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {student.firstName[0]}{student.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown student</span>
                        )}
                      </td>
                      <td className="p-4">
                        {course ? (
                          <div>
                            <p className="font-medium text-foreground">{course.title}</p>
                            <p className="text-sm text-muted-foreground">{organization?.name || "No organization"}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown course</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-foreground">
                          {instructor ? `${instructor.firstName} ${instructor.lastName}` : "No instructor"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground">
                          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={`status-${enrollment.status}`}>
                          {enrollment.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Progress value={enrollment.progress || 0} className="w-24" />
                          <span className="text-sm text-muted-foreground">{enrollment.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(enrollment.id)}
                            data-testid={`edit-enrollment-${enrollment.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(enrollment.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`delete-enrollment-${enrollment.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`view-enrollment-${enrollment.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredEnrollments.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {filteredEnrollments.length} of {filteredEnrollments.length} results
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <EnrollmentForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        enrollmentId={editingEnrollment}
      />

      <ConfirmationDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Remove Enrollment"
        description="Are you sure you want to remove this enrollment? The student will be unenrolled from the course. This action cannot be undone."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}
