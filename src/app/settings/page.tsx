
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
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
           <div className="text-center py-20 text-muted-foreground">
                <p>Settings will be available here.</p>
                <p className="text-sm">Feature coming soon.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
