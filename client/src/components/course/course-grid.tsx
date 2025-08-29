import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CourseForm from "./course-form";
import ConfirmationDialog from "@/components/common/confirmation-dialog";
import { Plus, Edit, Trash2, Users, Download, BookOpen, Code, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseGridProps {
  searchQuery: string;
}

export default function CourseGrid({ searchQuery }: CourseGridProps) {
  const { courses, users, organizations, deleteCourse, getEnrollmentsByCourse } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOrg = organizationFilter === "all" || course.organizationId === organizationFilter;
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      return matchesSearch && matchesOrg && matchesStatus;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleDelete = (id: string) => {
    deleteCourse(id);
    setDeleteConfirm(null);
    toast({
      title: "Course deleted",
      description: "The course and all its enrollments have been removed.",
    });
  };

  const handleEdit = (id: string) => {
    setEditingCourse(id);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  const exportData = () => {
    const data = filteredCourses.map(course => {
      const instructor = users.find(u => u.id === course.instructorId);
      const organization = organizations.find(o => o.id === course.organizationId);
      const enrollments = getEnrollmentsByCourse(course.id);
      
      return {
        Title: course.title,
        Description: course.description || "",
        Instructor: instructor ? `${instructor.firstName} ${instructor.lastName}` : "No instructor",
        Organization: organization?.name || "No organization",
        Duration: course.duration ? `${course.duration} weeks` : "",
        "Max Students": course.maxStudents || "",
        "Current Enrollments": enrollments.length,
        Status: course.status,
        Created: new Date(course.createdAt).toLocaleDateString(),
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
    a.download = "courses.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Courses data has been exported to CSV.",
    });
  };

  const getCourseIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('database') || lowerTitle.includes('sql')) {
      return <BookOpen className="text-4xl" />;
    }
    if (lowerTitle.includes('web') || lowerTitle.includes('development') || lowerTitle.includes('programming')) {
      return <Code className="text-4xl" />;
    }
    if (lowerTitle.includes('data') || lowerTitle.includes('analysis') || lowerTitle.includes('analytics')) {
      return <TrendingUp className="text-4xl" />;
    }
    return <BookOpen className="text-4xl" />;
  };

  const getCourseGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-yellow-500 to-yellow-600",
      "from-red-500 to-red-600",
      "from-indigo-500 to-indigo-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Courses</h2>
          <p className="text-muted-foreground">Manage all courses across organizations</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} data-testid="add-course">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Organization:</label>
            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="w-48" data-testid="organization-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="secondary" onClick={exportData} data-testid="export-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            {searchQuery ? "No courses found matching your search." : "No courses yet. Create your first course to get started."}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const instructor = users.find(u => u.id === course.instructorId);
            const organization = organizations.find(o => o.id === course.organizationId);
            const enrollments = getEnrollmentsByCourse(course.id);

            return (
              <Card key={course.id} className="overflow-hidden hover-scale" data-testid={`course-card-${course.id}`}>
                <div className={`h-48 bg-gradient-to-br ${getCourseGradient(index)} flex items-center justify-center text-white`}>
                  {getCourseIcon(course.title)}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-foreground truncate">{course.title}</h3>
                    <Badge className={`status-${course.status}`}>
                      {course.status}
                    </Badge>
                  </div>
                  
                  {course.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground w-20">Instructor:</span>
                      <span className="text-foreground font-medium">
                        {instructor ? `${instructor.firstName} ${instructor.lastName}` : "No instructor"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground w-20">Organization:</span>
                      <span className="text-foreground">
                        {organization?.name || "No organization"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground w-20">Enrolled:</span>
                      <span className="text-foreground font-medium">
                        {enrollments.length} student{enrollments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {course.duration && (
                      <div className="flex items-center text-sm">
                        <span className="text-muted-foreground w-20">Duration:</span>
                        <span className="text-foreground">{course.duration} weeks</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(course.id)}
                        title="Edit"
                        data-testid={`edit-course-${course.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Enrollments"
                        data-testid={`view-enrollments-${course.id}`}
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(course.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                        data-testid={`delete-course-${course.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-sm font-medium">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CourseForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        courseId={editingCourse}
      />

      <ConfirmationDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action will also remove all enrollments for this course. This action cannot be undone."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
