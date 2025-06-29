import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-lg text-center">
          <CardHeader className="items-center">
            <HeartPulse className="w-16 h-16 mb-4 text-primary" />
            <CardTitle className="text-3xl font-bold font-headline">Recovery Planner</CardTitle>
            <CardDescription className="text-lg">
              Your personalized guide to a smooth and steady recovery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Let's take the first step together on your path to wellness.</p>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/select-condition">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
