export interface problemAProp {
    score: number;
    components: {
        mood: number;
        jobDemands: number;
        symptoms: number;
    }
}
export interface problemBProp {
    score: number;
    components: {
        worryTime: number;
        threatMonitoring: number;
        harmfulCoping: number;
        worryEnergy: number;
    }
}

export interface objectiveProps {
    score: number;
    breakdown: {
        hrvScore: number;
        sleepScore: number;
        heartRateScore: number;
        activityScore: number;
    }
}

export interface StressCalculation {
    stressScore: number;
    subjectiveScore: number;
    objectiveScore: number;

    problemA: {
        score: number;
        weight: number;
        components: {
            mood: number;
            jobDemands: number;
            symptoms: number;
        };
    };
    problemB: {
        score: number;
        weight: number;
        components: {
            worryTime: number;
            threatMonitoring: number;
            harmfulCoping: number;
            worryEnergy: number;
        };
    };

    objectiveBreakdown: {
        hrvScore: number;
        sleepScore: number;
        heartRateScore: number;
        activityScore: number;
    };

    riskLevel: 'Low' | 'Moderate' | 'High';
    confidence: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    insights: string[];
}
