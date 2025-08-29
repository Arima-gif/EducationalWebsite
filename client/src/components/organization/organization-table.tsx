import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import OrganizationForm from "./organization-form";
import ConfirmationDialog from "@/components/common/confirmation-dialog";
import { Plus, Edit, Trash2, Eye, Download, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrganizationTableProps {
  searchQuery: string;
}

export default function OrganizationTable({ searchQuery }: OrganizationTableProps) {
  const { organizations, users, deleteOrganization, getCoursesByOrganization, getUsersByOrganization } = useData();
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

  const exportData = () => {
    const data = filteredOrganizations.map(org => {
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

    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "organizations.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Organizations data has been exported to CSV.",
    });
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Organizations</h2>
          <p className="text-muted-foreground">Manage all organizations in the system</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} data-testid="add-organization">
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
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
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Sort by:</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="sort-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="secondary" onClick={exportData} data-testid="export-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Organizations Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Organization</th>
                <th className="text-left p-4 font-medium text-foreground">Manager</th>
                <th className="text-left p-4 font-medium text-foreground">Courses</th>
                <th className="text-left p-4 font-medium text-foreground">Users</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
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
                    <tr key={org.id} className="hover:bg-secondary/30 transition-colors" data-testid={`org-row-${org.id}`}>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Building className="text-primary-foreground w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{org.name}</p>
                            <p className="text-sm text-muted-foreground">{org.address || 'No address'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {manager ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {manager.firstName[0]}{manager.lastName[0]}
                              </span>
                            </div>
                            <span className="text-foreground">{manager.firstName} {manager.lastName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No manager assigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-foreground font-medium">{courseCount}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground font-medium">{userCount}</span>
                      </td>
                      <td className="p-4">
                        <Badge className={`status-${org.status}`}>
                          {org.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(org.id)}
                            data-testid={`edit-org-${org.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(org.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`delete-org-${org.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`view-org-${org.id}`}>
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
