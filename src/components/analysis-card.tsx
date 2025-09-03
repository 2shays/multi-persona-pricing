import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AnalysisCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    data: {
        analysis: string;
        [key: string]: any;
    };
    priceKey: string;
    priceLabel: string;
    accentClass: string;
    subPriceKey?: string;
    subPriceLabel?: string;
}

export function AnalysisCard({
    icon,
    title,
    description,
    data,
    priceKey,
    priceLabel,
    accentClass,
    subPriceKey,
    subPriceLabel
}: AnalysisCardProps) {
    // A bit of a hack to replace the icon for the quantitative analyst
    // without having to pass a separate prop all the way down.
    const displayIcon = title === "Quantitative Analyst" ? <User /> : icon;

    return (
        <Card className="bg-card/50 flex flex-col border-border/60">
            <CardHeader>
                <div className="flex items-center mb-2 gap-3">
                    <div className={cn("w-8 h-8", accentClass)}>
                        {displayIcon}
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
                </div>
                 <CardDescription className="text-xs text-muted-foreground italic h-16">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow gap-4">
                <div className="bg-background p-3 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{priceLabel}:</p>
                    <p className={cn("text-lg font-bold", accentClass)}>{data[priceKey]}</p>
                    {subPriceKey && data[subPriceKey] && <p className="text-xs text-muted-foreground/70 mt-1">{subPriceLabel}: {data[subPriceKey]}</p>}
                </div>
                <p className="text-foreground/80 text-sm flex-grow">{data.analysis}</p>
            </CardContent>
        </Card>
    );
};
