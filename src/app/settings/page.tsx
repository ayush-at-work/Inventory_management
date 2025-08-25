
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Settings, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is not an admin
    if (user && user.role !== 'Admin') {
      router.push('/');
    }
  }, [user, router]);
  
  const handleResetData = () => {
    // This is a simple but effective way to reset the app's state
    // In a real production app, you might want to remove keys individually
    localStorage.clear();
    window.location.reload();
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
          <ShieldAlert className="h-8 w-8 text-destructive" />
          <h2 className="text-3xl font-bold tracking-tight">Access Denied</h2>
        </div>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage your application preferences here.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center py-10 text-muted-foreground">
                <p>Settings will be available here.</p>
                <p className="text-sm">Feature coming soon.</p>
            </div>
        </CardContent>
      </Card>
      
       <Card className="max-w-2xl mx-auto mt-6 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Reset Application</CardTitle>
          <CardDescription>
            This is a dangerous action. Clicking this button will permanently delete all data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all inventory, transactions, users, and other data from your local storage. The application will then reload.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={handleResetData}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
