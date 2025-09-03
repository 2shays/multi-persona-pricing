
"use client";

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, LineChart, LoaderIcon, MarketAnalystIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const analysisSteps = [
    {
        name: 'Marketing Analyst',
        description: 'Identifying market trends, customer segments and price elasticity',
        icon: MarketAnalystIcon,
        colorClass: 'text-primary',
        progressRange: [0, 25],
    },
    {
        name: 'Value Engineer',
        description: 'Estimating ROI and researching competitor pricing data and positioning analysis',
        icon: LineChart,
        colorClass: 'text-secondary',
        progressRange: [25, 50],
    },
    {
        name: 'Customer Psychologist',
        description: 'Identifying market trends, customer segments and price elasticity',
        icon: User,
        colorClass: 'text-accent',
        progressRange: [50, 75],
    },
    {
        name: 'Compiling Multi-Personal Pricing Intelligence',
        description: 'Synthesizing recommendations from all AI personas',
        icon: LoaderIcon,
        colorClass: 'text-primary',
        progressRange: [75, 100],
    },
];


export function LoadingAnalysis() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 200); // ~20 seconds to reach 100%

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-card/80 rounded-2xl p-8 border border-border/50 w-full max-w-2xl mx-4 text-center shadow-2xl">
                <div className="flex justify-center items-center mb-6">
                    <LoaderIcon className="w-12 h-12 text-primary animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Pricing Strategy</h2>
                <p className="text-muted-foreground mb-8">
                    Our AI personas are working hard to provide you with the best pricing recommendations
                </p>

                <div className="text-left mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-muted-foreground">Analysis Progress</label>
                        <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-4 text-left">
                    {analysisSteps.map((step, index) => {
                        const [start, end] = step.progressRange;
                        const isActive = progress >= start && progress < end;
                        const isCompleted = progress >= end;
                        const Icon = step.icon;
                        return (
                            <div key={index} className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                                    isCompleted ? 'bg-success/20' : 'bg-muted/50'
                                )}>
                                    {isCompleted ? (
                                        <CheckCircle className="w-6 h-6 text-success" />
                                    ) : (
                                        <Icon className={cn(
                                            "w-6 h-6 transition-colors duration-300",
                                            isActive ? step.colorClass : 'text-muted-foreground/50'
                                        )} />
                                    )}
                                </div>
                                <div>
                                    <p className={cn(
                                        "font-semibold transition-colors duration-300",
                                        (isActive || isCompleted) ? 'text-foreground' : 'text-muted-foreground'
                                    )}>
                                        {step.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
