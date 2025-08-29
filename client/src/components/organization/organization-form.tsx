import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiData } from "@/contexts/api-data-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { organizationFormSchema } from "@/lib/validation";
import type { OrganizationFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface OrganizationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string | null;
}

export default function OrganizationForm({ open, onOpenChange, organizationId }: OrganizationFormProps) {
  const { organizations, users, createOrganization, updateOrganization, getUsersByRole } = useApiData();
  const { toast } = useToast();

  const managers = getUsersByRole('manager');
  const isEditing = !!organizationId;
  const organization = organizationId ? organizations.find(o => o.id === organizationId) : null;

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      status: "active",
      managerId: "",
    },
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        address: organization.address || "",
        phone: organization.phone || "",
        email: organization.email || "",
        status: organization.status,
        managerId: organization.managerId,
      });
    } else {
      form.reset({
        name: "",
        address: "",
        phone: "",
        email: "",
        status: "active",
        managerId: "",
      });
    }
  }, [organization, form]);

  const onSubmit = (data: InsertOrganization) => {
    try {
      if (isEditing && organizationId) {
        updateOrganization(organizationId, data);
        toast({
          title: "Organization updated",
          description: "The organization has been successfully updated.",
        });
      } else {
        createOrganization(data);
        toast({
          title: "Organization created",
          description: "The organization has been successfully created.",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="organization-form">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Organization" : "Add Organization"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-manager">
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {managers.length === 0 ? (
                          <SelectItem value="none" disabled>No managers available</SelectItem>
                        ) : (
                          managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.firstName} {manager.lastName}
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

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter organization address" {...field} value={field.value || ""} data-testid="input-address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} value={field.value || ""} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} value={field.value || ""} data-testid="input-email" />
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
                {isEditing ? "Update Organization" : "Add Organization"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
