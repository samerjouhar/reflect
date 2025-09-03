import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck, Sparkles, Lock, Unlock } from "lucide-react";


export function Header({ locked, onLockToggle }: { locked: boolean; onLockToggle: () => void }) {
    return (
    <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
    <Sparkles className="w-6 h-6"/>
    <h1 className="text-2xl font-bold">Reflect — Private Journal</h1>
    <Badge variant="secondary" className="ml-2">On-device</Badge>
    </div>
    <div className="flex items-center gap-3">
    <TooltipProvider>
    <Tooltip>
    <TooltipTrigger asChild>
    <div className="flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4"/> No cloud, no tracking</div>
    </TooltipTrigger>
    <TooltipContent>Everything stays in your browser. You control your key.</TooltipContent>
    </Tooltip>
    </TooltipProvider>
    <Button variant="outline" onClick={onLockToggle}>
    {locked ? <Lock className="w-4 h-4 mr-2"/> : <Unlock className="w-4 h-4 mr-2"/>}
    {locked ? "Unlock" : "Lock"}
    </Button>
    </div>
    </div>
    );
}