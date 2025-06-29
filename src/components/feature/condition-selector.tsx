
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CONDITIONS, RECOVERY_PLANS } from '@/lib/data';
import { ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { analyzePrescription, type AnalyzePrescriptionOutput } from '@/ai/flows/analyze-prescription-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Helper function to read file as Data URL
const toDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


export default function ConditionSelector() {
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePrescriptionOutput | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleManualSelect = (value: string) => {
    setSelectedCondition(value);
    // Clear other input methods
    setSelectedFile(null);
    setAnalysisResult(null);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/msword';
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
        if (!(isImage || isPdf || isDoc || isDocx)) {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload an image, PDF, or Word document.',
            });
            return;
        }

        setSelectedFile(file);
        // Clear other input methods
        setSelectedCondition('');
        setAnalysisResult(null);
    }
  }

  const handleNavigate = () => {
    if (selectedCondition) {
      router.push(`/plan/${selectedCondition}`);
    }
  };

  const handleDocumentAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
        const prescriptionDataUri = await toDataURL(selectedFile);
        const result = await analyzePrescription({ prescriptionDataUri });
        setAnalysisResult(result);
        setSelectedCondition(result.conditionKey);
        toast({
            title: 'Analysis Complete!',
            description: `We've selected a recovery plan for you.`,
        });
    } catch (error) {
        console.error("Failed to analyze prescription:", error);
        toast({
            variant: "destructive",
            title: "Oh no! Something went wrong.",
            description: "We couldn't analyze the document. Please try a clearer file or select a condition manually.",
        });
    } finally {
        setIsAnalyzing(false);
    }
  }

  const manualConditions = CONDITIONS.filter(c => c.value !== 'other');

  return (
    <div className="flex flex-col gap-6 pt-4">
        <div className="space-y-2">
            <Label htmlFor="condition-select" className="text-lg font-medium text-left">Select Manually</Label>
            <Select onValueChange={handleManualSelect} value={selectedCondition}>
                <SelectTrigger id="condition-select" className="h-12 text-base">
                    <SelectValue placeholder="Choose a condition..." />
                </SelectTrigger>
                <SelectContent>
                    {manualConditions.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value} className="text-base cursor-pointer">
                            {cond.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-primary" /> Analyze with AI</h4>
            <p className="text-sm text-muted-foreground">Upload a prescription and our AI will find the right plan for you.</p>
            <div className="flex gap-2">
                <Input type="file" accept="image/*,application/pdf,.doc,.docx" onChange={handleFileChange} className="flex-1 h-12 text-base cursor-pointer" />
            </div>
            <Button
                size="lg"
                onClick={handleDocumentAnalysis}
                disabled={!selectedFile || isAnalyzing}
                className="w-full font-semibold"
            >
                {isAnalyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : <>Analyze Prescription</>}
            </Button>
        </div>
      </div>
      
      {analysisResult && (
          <Alert className="bg-primary/20 border-primary/50 animate-in fade-in-50">
             <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="font-headline">AI Analysis Result</AlertTitle>
            <AlertDescription className="text-primary-foreground/90">
              {analysisResult.reasoning} We've selected '{RECOVERY_PLANS[analysisResult.conditionKey]?.name}' for you.
            </AlertDescription>
          </Alert>
        )}
      
      <Separator />

      <Button
        size="lg"
        onClick={handleNavigate}
        disabled={!selectedCondition}
        className="font-semibold mt-4"
      >
        View My Plan
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
