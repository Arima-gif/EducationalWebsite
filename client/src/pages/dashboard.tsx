import { useState } from "react";
import { useData } from "@/contexts/data-context";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/common/stats-card";
import OrganizationTable from "@/components/organization/organization-table";
import UserTable from "@/components/user/user-table";
import CourseGrid from "@/components/course/course-grid";
import EnrollmentTable from "@/components/enrollment/enrollment-table";
import { Building, Users, BookOpen, GraduationCap } from "lucide-react";

type Section = 'dashboard' | 'organizations' | 'users' | 'courses' | 'enrollments';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [searchQuery, setSearchQuery] = useState("");
  const { organizations, users, courses, enrollments } = useData();

  const stats = {
    organizations: organizations.length,
    users: users.length,
    courses: courses.filter(c => c.status === 'active').length,
    enrollments: enrollments.filter(e => e.status === 'active').length,
  };

  const recentOrganizations = organizations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const popularCourses = courses
    .map(course => ({
      ...course,
      enrollmentCount: enrollments.filter(e => e.courseId === course.id).length
    }))
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 3);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Organizations"
                value={stats.organizations}
                icon={Building}
                change="+2.5%"
                changeText="vs last month"
                color="blue"
                data-testid="stats-organizations"
              />
              <StatsCard
                title="Total Users"
                value={stats.users}
                icon={Users}
                change="+8.1%"
                changeText="vs last month"
                color="green"
                data-testid="stats-users"
              />
              <StatsCard
                title="Active Courses"
                value={stats.courses}
                icon={BookOpen}
                change="+12.3%"
                changeText="vs last month"
                color="yellow"
                data-testid="stats-courses"
              />
              <StatsCard
                title="Total Enrollments"
                value={stats.enrollments}
                icon={GraduationCap}
                change="+15.2%"
                changeText="vs last month"
                color="purple"
                data-testid="stats-enrollments"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Organizations</h3>
                <div className="space-y-4" data-testid="recent-organizations">
                  {recentOrganizations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No organizations yet</p>
                  ) : (
                    recentOrganizations.map((org) => {
                      const manager = users.find(u => u.id === org.managerId);
                      return (
                        <div key={org.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                              <Building className="text-primary-foreground w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{org.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {manager ? `${manager.firstName} ${manager.lastName} - Manager` : 'No manager assigned'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(org.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Popular Courses</h3>
                <div className="space-y-4" data-testid="popular-courses">
                  {popularCourses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No courses yet</p>
                  ) : (
                    popularCourses.map((course) => {
                      const instructor = users.find(u => u.id === course.instructorId);
                      return (
                        <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="text-white w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{course.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {course.enrollmentCount} students enrolled
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {instructor ? `${instructor.firstName} ${instructor.lastName}` : 'No instructor'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'organizations':
        return <OrganizationTable searchQuery={searchQuery} />;
      case 'users':
        return <UserTable searchQuery={searchQuery} />;
      case 'courses':
        return <CourseGrid searchQuery={searchQuery} />;
      case 'enrollments':
        return <EnrollmentTable searchQuery={searchQuery} />;
      default:
        return null;
    }
  };

  const getSectionTitle = (section: Section) => {
    const titles = {
      dashboard: 'Dashboard',
      organizations: 'Organizations',
      users: 'Users',
      courses: 'Courses',
      enrollments: 'Enrollments',
    };
    return titles[section];
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getSectionTitle(activeSection)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
