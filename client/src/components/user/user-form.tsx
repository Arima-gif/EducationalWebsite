import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiData } from "@/contexts/api-data-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { userFormSchema } from "@/lib/validation";
import type { UserFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
}

export default function UserForm({ open, onOpenChange, userId }: UserFormProps) {
  const { users, organizations, createUser, updateUser } = useApiData();
  const { toast } = useToast();

  const isEditing = !!userId;
  const user = userId ? users.find(u => u.id === userId) : null;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "student",
      organizationId: "none",
      status: "active",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        organizationId: user.organizationId || "none",
        status: user.status,
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "student",
        organizationId: "none",
        status: "active",
      });
    }
  }, [user, form]);

  const onSubmit = (data: InsertUser) => {
    try {
      // Convert "none" back to empty string for organizationId
      const processedData = {
        ...data,
        organizationId: data.organizationId === "none" ? "" : data.organizationId
      };
      
      if (isEditing && userId) {
        updateUser(userId, processedData);
        toast({
          title: "User updated",
          description: "The user has been successfully updated.",
        });
      } else {
        createUser(processedData);
        toast({
          title: "User created",
          description: "The user has been successfully created.",
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-border/30" data-testid="user-form">
        <DialogHeader className="pb-6 border-b border-border/30">
          <DialogTitle className="text-2xl font-bold gradient-text">
            {isEditing ? "Edit User" : "Add User"}
          </DialogTitle>
          <p className="text-muted-foreground/80 text-sm mt-2">
            {isEditing ? "Update user information and settings" : "Create a new user account with role and organization assignment"}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">First Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter first name" 
                        {...field} 
                        data-testid="input-first-name"
                        className="input-focus rounded-xl py-3 px-4 text-base border-border/50 bg-background/50 backdrop-blur-sm" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">Last Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter last name" 
                        {...field} 
                        data-testid="input-last-name"
                        className="input-focus rounded-xl py-3 px-4 text-base border-border/50 bg-background/50 backdrop-blur-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">Email Address *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      {...field} 
                      data-testid="input-email"
                      className="input-focus rounded-xl py-3 px-4 text-base border-border/50 bg-background/50 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">User Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          data-testid="select-role"
                          className="input-focus rounded-xl py-3 px-4 text-base border-border/50 bg-background/50 backdrop-blur-sm"
                        >
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">🛡️ Administrator</SelectItem>
                        <SelectItem value="manager">👔 Manager</SelectItem>
                        <SelectItem value="instructor">🎓 Instructor</SelectItem>
                        <SelectItem value="support">🔧 Support Engineer</SelectItem>
                        <SelectItem value="student">👨‍🎓 Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">Organization</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger 
                          data-testid="select-organization"
                          className="input-focus rounded-xl py-3 px-4 text-base border-border/50 bg-background/50 backdrop-blur-sm"
                        >
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">🏢 No organization</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            🏬 {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="Enter phone number" 
                        {...field} 
                        value={field.value || ""} 
                        data-testid="input-phone"
                        className="input-focus rounded-xl py-3 px-4 text-base border-border/50 bg-background/50 backdrop-blur-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">Account Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          data-testid="select-status"
                          className="input-focus rounded-xl py-3 px-4 text-base border-border/50 bg-background/50 backdrop-blur-sm"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">✅ Active</SelectItem>
                        <SelectItem value="inactive">❌ Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-8 border-t border-border/30">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                data-testid="cancel-button"
                className="px-6 py-3 rounded-xl font-medium text-base hover:bg-accent/50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                data-testid="submit-button"
                className="btn-gradient px-8 py-3 rounded-xl font-medium text-base hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                {isEditing ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
