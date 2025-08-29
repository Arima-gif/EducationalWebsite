import { useState } from "react";
import { useData } from "@/contexts/data-context";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import OrganizationTable from "@/components/organization/organization-table";
import UserTable from "@/components/user/user-table";
import CourseGrid from "@/components/course/course-grid";
import EnrollmentTable from "@/components/enrollment/enrollment-table";

type Section = 'organizations' | 'users' | 'courses' | 'enrollments';

interface DashboardProps {
  defaultSection?: Section;
}

export default function Dashboard({ defaultSection = 'organizations' }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>(defaultSection);
  const [searchQuery, setSearchQuery] = useState("");

  const renderContent = () => {
    switch (activeSection) {
      case 'organizations':
        return <OrganizationTable searchQuery={searchQuery} />;
      case 'users':
        return <UserTable searchQuery={searchQuery} />;
      case 'courses':
        return <CourseGrid searchQuery={searchQuery} />;
      case 'enrollments':
        return <EnrollmentTable searchQuery={searchQuery} />;
      default:
        return <OrganizationTable searchQuery={searchQuery} />;
    }
  };

  const getSectionTitle = (section: Section) => {
    const titles = {
      organizations: 'Organizations',
      users: 'Users',
      courses: 'Courses',
      enrollments: 'Enrollments',
    };
    return titles[section];
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={(section) => setActiveSection(section as Section)} />
      
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
