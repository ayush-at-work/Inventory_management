
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <User className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Company Profile</h2>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Update your company's details. This information will be used on invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="company logo" />
                    <AvatarFallback>SF</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <Button variant="outline">Upload Company Logo</Button>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB.</p>
                </div>
            </div>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="ScrapFlow Inc." />
            </div>
             <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input id="gstNumber" defaultValue="07ABCDE1234F1Z5" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="address">Company Address</Label>
              <Textarea id="address" defaultValue="123 Scrap Yard, Metal City, 110011" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" defaultValue="Admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input id="email" type="email" defaultValue="admin@scrapflow.com" />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
