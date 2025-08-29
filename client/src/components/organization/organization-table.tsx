import { useState } from "react";
import { useApiData } from "@/contexts/api-data-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import OrganizationForm from "./organization-form";
import ConfirmationDialog from "@/components/common/confirmation-dialog";
import { Plus, Edit, Trash2, Eye, Download, Building, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF, exportToWord, exportToExcel, exportToCSV } from "@/utils/exportUtils";

interface OrganizationTableProps {
  searchQuery: string;
}

export default function OrganizationTable({ searchQuery }: OrganizationTableProps) {
  const { organizations, users, deleteOrganization, getCoursesByOrganization, getUsersByOrganization } = useApiData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const { toast } = useToast();

  const filteredOrganizations = organizations
    .filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           org.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           org.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || org.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "manager":
          const managerA = users.find(u => u.id === a.managerId);
          const managerB = users.find(u => u.id === b.managerId);
          const nameA = managerA ? `${managerA.firstName} ${managerA.lastName}` : "";
          const nameB = managerB ? `${managerB.firstName} ${managerB.lastName}` : "";
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

  const handleDelete = (id: string) => {
    deleteOrganization(id);
    setDeleteConfirm(null);
    toast({
      title: "Organization deleted",
      description: "The organization and all its related data have been removed.",
    });
  };

  const handleEdit = (id: string) => {
    setEditingOrganization(id);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingOrganization(null);
  };

  const prepareExportData = () => {
    return filteredOrganizations.map(org => {
      const manager = users.find(u => u.id === org.managerId);
      return {
        Name: org.name,
        Manager: manager ? `${manager.firstName} ${manager.lastName}` : "No manager",
        Address: org.address || "",
        Phone: org.phone || "",
        Email: org.email || "",
        Status: org.status,
        Courses: getCoursesByOrganization(org.id).length,
        Users: getUsersByOrganization(org.id).length,
        Created: new Date(org.createdAt).toLocaleDateString(),
      };
    });
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'word' | 'excel') => {
    const data = prepareExportData();
    const title = "Organizations Report";
    const filename = `organizations-${new Date().toISOString().split('T')[0]}`;

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
        description: `Organizations data has been exported to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Organizations</h2>
          <p className="text-muted-foreground/80 text-lg mt-1">Manage all organizations in the system</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)} 
          data-testid="add-organization"
          className="btn-gradient hover:shadow-lg transform transition-all duration-300 hover:scale-105 px-6 py-3 text-base font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card p-6 border-border/30">
        <div className="flex flex-wrap items-center gap-6">
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
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-foreground">Sort by:</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 input-focus rounded-xl" data-testid="sort-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
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

      {/* Organizations Table */}
      <Card className="glass-card overflow-hidden border-border/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-secondary/80 to-secondary/60 backdrop-blur-sm">
              <tr>
                <th className="text-left p-6 font-semibold text-foreground text-sm uppercase tracking-wide">Organization</th>
                <th className="text-left p-6 font-semibold text-foreground text-sm uppercase tracking-wide">Manager</th>
                <th className="text-left p-6 font-semibold text-foreground text-sm uppercase tracking-wide">Courses</th>
                <th className="text-left p-6 font-semibold text-foreground text-sm uppercase tracking-wide">Users</th>
                <th className="text-left p-6 font-semibold text-foreground text-sm uppercase tracking-wide">Status</th>
                <th className="text-left p-6 font-semibold text-foreground text-sm uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {searchQuery ? "No organizations found matching your search." : "No organizations yet. Create your first organization to get started."}
                  </td>
                </tr>
              ) : (
                filteredOrganizations.map((org) => {
                  const manager = users.find(u => u.id === org.managerId);
                  const courseCount = getCoursesByOrganization(org.id).length;
                  const userCount = getUsersByOrganization(org.id).length;

                  return (
                    <tr key={org.id} className="table-row-hover group" data-testid={`org-row-${org.id}`}>
                      <td className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 btn-gradient rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                            <Building className="text-primary-foreground w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-base group-hover:text-primary transition-colors duration-200">{org.name}</p>
                            <p className="text-sm text-muted-foreground/80">{org.address || 'No address provided'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        {manager ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                              <span className="text-white text-sm font-semibold">
                                {manager.firstName[0]}{manager.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <span className="text-foreground font-medium">{manager.firstName} {manager.lastName}</span>
                              <p className="text-xs text-muted-foreground/60">Manager</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/70 italic">No manager assigned</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{courseCount}</span>
                          </div>
                          <span className="text-xs text-muted-foreground/60">courses</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{userCount}</span>
                          </div>
                          <span className="text-xs text-muted-foreground/60">users</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge className={`status-${org.status} px-3 py-1.5 rounded-xl font-medium text-xs`}>
                          {org.status}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(org.id)}
                            data-testid={`edit-org-${org.id}`}
                            className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(org.id)}
                            className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all duration-200 hover:scale-105"
                            data-testid={`delete-org-${org.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            data-testid={`view-org-${org.id}`}
                            className="h-9 w-9 rounded-xl hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400 transition-all duration-200 hover:scale-105"
                          >
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
        {filteredOrganizations.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {filteredOrganizations.length} of {filteredOrganizations.length} results
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

      <OrganizationForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        organizationId={editingOrganization}
      />

      <ConfirmationDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This action will also remove all related users, courses, and enrollments. This action cannot be undone."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
