
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, DatabaseZap, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { useGst } from '@/context/gst-context';
// Import other contexts as needed, e.g., useInventory, useExpenses, etc.

type ImportType = 'gst-inward' | 'gst-outward' | 'cash-inward' | 'cash-outward' | 'expenses';

export default function ImportPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { addInwardGood, addOutwardGood } = useGst();
    // Add other context hooks here

    const [importType, setImportType] = useState<ImportType | ''>('');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'Admin') {
            router.push('/');
        }
    }, [user, router]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };
    
    const downloadTemplate = () => {
        let headers = '';
        let filename = `${importType}_template.csv`;

        switch(importType) {
            case 'gst-inward':
                headers = 'Invoice Number,Date,Name,GST Number,Place Of Supply,Material,HSN Code,Weight,Taxable Amount,CGST,SGST,IGST,Tax Percentage,Tax Amount,TCS,Invoice Value';
                break;
            // Add other cases here for different import types
            default:
                toast({
                    variant: 'destructive',
                    title: 'Select a data type',
                    description: 'Please select a data type to download its template.',
                });
                return;
        }
        
        const csvContent = "data:text/csv;charset=utf-8," + headers;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = () => {
        if (!file || !importType) {
            toast({
                variant: 'destructive',
                title: 'Missing information',
                description: 'Please select a data type and a CSV file to import.',
            });
            return;
        }

        setIsProcessing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    processData(results.data);
                    toast({
                        title: 'Import Successful',
                        description: `${results.data.length} records have been imported.`,
                    });
                } catch (error: any) {
                    toast({
                        variant: 'destructive',
                        title: 'Import Failed',
                        description: error.message || 'An unknown error occurred during processing.',
                    });
                } finally {
                    setIsProcessing(false);
                    setFile(null);
                }
            },
            error: (error: any) => {
                toast({
                    variant: 'destructive',
                    title: 'File Read Error',
                    description: error.message,
                });
                setIsProcessing(false);
            },
        });
    };

    const processData = (data: any[]) => {
        // This is a simplified processor. A real implementation would have much more robust validation.
        switch(importType) {
            case 'gst-inward':
                data.forEach(row => {
                    const taxableAmount = Number(row['Taxable Amount']);
                    const cgst = Number(row['CGST']);
                    const sgst = Number(row['SGST']);
                    const igst = Number(row['IGST']);
                    const taxType = (cgst > 0 || sgst > 0) ? 'inter-state' : 'intra-state';

                    addInwardGood({
                        invoiceNumber: row['Invoice Number'],
                        date: row['Date'],
                        supplier: row['Name'],
                        gstNumber: row['GST Number'],
                        placeOfSupply: row['Place Of Supply'],
                        materialType: row['Material'],
                        hsnCode: row['HSN Code'],
                        weight: Number(row['Weight']),
                        taxableAmount: taxableAmount,
                        taxType: taxType,
                        cgst: cgst,
                        sgst: sgst,
                        igst: igst,
                        taxAmount: Number(row['Tax Amount']),
                        tcs: Number(row['TCS']),
                        totalInvoiceValue: Number(row['Invoice Value']),
                    });
                });
                break;
            // Add other cases here
            default:
                throw new Error("Invalid import type specified.");
        }
    }


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
                <DatabaseZap className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Data Import</h2>
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Upload Your Data</CardTitle>
                    <CardDescription>
                        Import data from a CSV file. Make sure the file format matches the required template.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="import-type">1. Select Data Type to Import</Label>
                        <Select value={importType} onValueChange={(v) => setImportType(v as ImportType)}>
                            <SelectTrigger id="import-type">
                                <SelectValue placeholder="Select a data type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gst-inward">GST Purchases (Inward)</SelectItem>
                                <SelectItem value="gst-outward">GST Sales (Outward)</SelectItem>
                                <SelectItem value="cash-inward">Cash Purchases</SelectItem>
                                <SelectItem value="cash-outward">Cash Sales</SelectItem>
                                <SelectItem value="expenses">General Expenses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                         <Label>2. Download Template</Label>
                         <Button variant="outline" className="w-full" onClick={downloadTemplate} disabled={!importType}>
                             <Download className="mr-2 h-4 w-4"/>
                             Download {importType ? importType.replace('-', ' ') : ''} Template
                         </Button>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">3. Choose CSV File</Label>
                        <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} />
                    </div>
                    
                    <Button onClick={handleImport} disabled={!file || !importType || isProcessing} className="w-full">
                        <Upload className="mr-2 h-4 w-4"/>
                        {isProcessing ? 'Processing...' : 'Import Data'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
