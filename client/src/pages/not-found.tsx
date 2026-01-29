import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-red-900/30">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold font-rune text-red-500">404 - Lost in the Void</h1>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            The scroll you are looking for has been destroyed or never existed. 
            Return to the guild hall before the darkness consumes you.
          </p>
          <a href="/" className="block mt-6 text-center text-primary hover:text-primary/80 hover:underline">
            Return Home
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
