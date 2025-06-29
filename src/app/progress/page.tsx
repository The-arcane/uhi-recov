import { Suspense } from 'react';
import ProgressPageClient from '@/components/feature/progress-page-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart3, Loader2 } from 'lucide-react';

function ProgressPageFallback() {
    return (
        <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <p>Loading progress report...</p>
        </CardContent>
    );
}

export default function ProgressPage() {
    return (
        <div className="flex flex-grow flex-col items-center justify-center">
            <div className="w-full max-w-2xl">
                <Card className="shadow-lg">
                    <CardHeader className="items-center text-center">
                        <BarChart3 className="w-16 h-16 mb-4 text-primary" />
                        <CardTitle className="text-3xl font-bold font-headline">Recovery Progress</CardTitle>
                        <CardDescription className="text-lg">
                            A summary of your recovery journey so far.
                        </CardDescription>
                    </CardHeader>
                    <Suspense fallback={<ProgressPageFallback />}>
                        <ProgressPageClient />
                    </Suspense>
                </Card>
            </div>
        </div>
    );
}
