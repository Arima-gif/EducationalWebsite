import { useState } from "react";
import { useApiData } from "@/contexts/api-data-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CourseForm from "./course-form";
import ConfirmationDialog from "@/components/common/confirmation-dialog";
import { Plus, Edit, Trash2, Users, Download, BookOpen, Code, TrendingUp, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToPDF, exportToWord, exportToExcel, exportToCSV } from "@/utils/exportUtils";

interface CourseGridProps {
  searchQuery: string;
}

export default function CourseGrid({ searchQuery }: CourseGridProps) {
  const { courses, users, organizations, deleteCourse, getEnrollmentsByCourse } = useApiData();
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

  const prepareExportData = () => {
    return filteredCourses.map(course => {
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
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'word' | 'excel') => {
    const data = prepareExportData();
    const title = "Courses Report";
    const filename = `courses-${new Date().toISOString().split('T')[0]}`;

    try {
      switch (format) {
        case 'csv':
          exportToCSV(data, filename);
          break;
        case 'pdf':
          exportToPDF(data, title, filename);
          break;
        case 'word':
          await exportToWord(data, title, filename);
          break;
        case 'excel':
          exportToExcel(data, title, filename);
          break;
      }

      toast({
        title: "Export completed",
        description: `Courses data has been exported to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Courses</h2>
          <p className="text-muted-foreground/80 text-lg mt-1">Manage all courses across organizations</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)} 
          data-testid="add-course"
          className="btn-gradient hover:shadow-lg transform transition-all duration-300 hover:scale-105 px-6 py-3 text-base font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card p-6 border-border/30">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-foreground">Organization:</label>
            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="w-52 input-focus rounded-xl" data-testid="organization-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-foreground">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 input-focus rounded-xl" data-testid="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                data-testid="export-button"
                className="rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 px-5 py-2.5 font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="w-4 h-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('word')}>
                <FileText className="w-4 h-4 mr-2" />
                Export Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="glass-card p-12 border-border/30">
          <div className="text-center text-muted-foreground/80 text-lg">
            {searchQuery ? "No courses found matching your search." : "No courses yet. Create your first course to get started."}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => {
            const instructor = users.find(u => u.id === course.instructorId);
            const organization = organizations.find(o => o.id === course.organizationId);
            const enrollments = getEnrollmentsByCourse(course.id);

            return (
              <Card key={course.id} className="glass-card overflow-hidden card-hover border-border/30 group" data-testid={`course-card-${course.id}`}>
                <div className={`h-52 bg-gradient-to-br ${getCourseGradient(index)} flex items-center justify-center text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/20 transition-all duration-300" />
                  <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    {getCourseIcon(course.title)}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className={`status-${course.status} px-3 py-1.5 rounded-xl font-medium text-xs backdrop-blur-sm`}>
                      {course.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-2">{course.title}</h3>
                    {course.description && (
                      <p className="text-muted-foreground/80 text-sm line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground/70 text-sm">Instructor</span>
                      <span className="text-foreground font-medium text-sm">
                        {instructor ? `${instructor.firstName} ${instructor.lastName}` : "Not assigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground/70 text-sm">Organization</span>
                      <span className="text-foreground text-sm truncate max-w-32">
                        {organization?.name || "Not assigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground/70 text-sm">Students</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{enrollments.length}</span>
                        </div>
                      </div>
                    </div>
                    {course.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground/70 text-sm">Duration</span>
                        <span className="text-foreground text-sm font-medium">{course.duration} weeks</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(course.id)}
                        title="Edit Course"
                        data-testid={`edit-course-${course.id}`}
                        className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Enrollments"
                        data-testid={`view-enrollments-${course.id}`}
                        className="h-9 w-9 rounded-xl hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400 transition-all duration-200 hover:scale-105"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(course.id)}
                        className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all duration-200 hover:scale-105"
                        title="Delete Course"
                        data-testid={`delete-course-${course.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-primary/80 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/10 transition-all duration-200"
                    >
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
