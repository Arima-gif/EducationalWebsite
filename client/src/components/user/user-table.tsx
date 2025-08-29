import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import UserForm from "./user-form";
import ConfirmationDialog from "@/components/common/confirmation-dialog";
import { Plus, Edit, Trash2, Eye, Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToPDF, exportToWord, exportToExcel, exportToCSV } from "@/utils/exportUtils";

interface UserTableProps {
  searchQuery: string;
}

export default function UserTable({ searchQuery }: UserTableProps) {
  const { users, organizations, deleteUser } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesOrg = organizationFilter === "all" || user.organizationId === organizationFilter;
      return matchesSearch && matchesRole && matchesOrg;
    })
    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

  const handleDelete = (id: string) => {
    deleteUser(id);
    setDeleteConfirm(null);
    toast({
      title: "User deleted",
      description: "The user and all their enrollments have been removed.",
    });
  };

  const handleEdit = (id: string) => {
    setEditingUser(id);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const prepareExportData = () => {
    return filteredUsers.map(user => {
      const organization = organizations.find(o => o.id === user.organizationId);
      return {
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        Role: user.role,
        Organization: organization?.name || "No organization",
        Phone: user.phone || "",
        Status: user.status,
        "Last Active": user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never",
        Created: new Date(user.createdAt).toLocaleDateString(),
      };
    });
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'word' | 'excel') => {
    const data = prepareExportData();
    const title = "Users Report";
    const filename = `users-${new Date().toISOString().split('T')[0]}`;

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
        description: `Users data has been exported to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTimeSinceLastActive = (lastActive: Date | null) => {
    if (!lastActive) return "Never";
    
    const now = new Date();
    const diff = now.getTime() - new Date(lastActive).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Users</h2>
          <p className="text-muted-foreground">Manage all users across organizations</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} data-testid="add-user">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Role:</label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40" data-testid="role-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="support">Support Engineer</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" data-testid="export-button">
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

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">User</th>
                <th className="text-left p-4 font-medium text-foreground">Role</th>
                <th className="text-left p-4 font-medium text-foreground">Organization</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Last Active</th>
                <th className="text-left p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {searchQuery ? "No users found matching your search." : "No users yet. Create your first user to get started."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const organization = organizations.find(o => o.id === user.organizationId);

                  return (
                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors" data-testid={`user-row-${user.id}`}>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`role-${user.role}`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground">
                          {organization?.name || "No organization"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={`status-${user.status}`}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground">
                          {getTimeSinceLastActive(user.lastActive)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user.id)}
                            data-testid={`edit-user-${user.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(user.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`delete-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`view-user-${user.id}`}>
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
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {filteredUsers.length} of {filteredUsers.length} results
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

      <UserForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        userId={editingUser}
      />

      <ConfirmationDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action will also remove all their enrollments. This action cannot be undone."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
