import ConditionSelector from '@/components/feature/condition-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo } from 'lucide-react';

export default function SelectConditionPage() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-lg text-center">
          <CardHeader className="items-center">
            <ListTodo className="w-16 h-16 mb-4 text-primary" />
            <CardTitle className="text-3xl font-bold font-headline">Select Your Condition</CardTitle>
            <CardDescription className="text-lg">
              Choose your condition manually, or upload a prescription for our AI to find the right plan for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConditionSelector />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
