
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { Download, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Profit & Loss</TabsTrigger>
           <Link href="/reports/forecasting">
            <TabsTrigger value="forecasting">
                <TrendingUp className="mr-2 h-4 w-4" />
                Demand Forecasting
            </TabsTrigger>
          </Link>
          <TabsTrigger value="analytics" disabled>
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Sales Report
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Expense Report
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>
                Summary of revenues, costs, and expenses during the selected period.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="text-center py-20 text-muted-foreground">
                <p>Profit & Loss data will be displayed here.</p>
                <p className="text-sm">Feature coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
