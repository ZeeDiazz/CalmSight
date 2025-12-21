export interface CheckInData {
    type: 'daily' | 'weekly';
    mood: string | null;
    worryTime: string | null;
    threatMonitoring: string | null;
    jobDemand: Record<string, string> | null;
    coping: Record<string, string> | null;
    symptoms: { symptoms: string[]; notes: string;} | null;
}

export interface ObjectiveHealthData {
    hrv?: { value: number; timestamp: string };
    sleep?: { duration: number; quality: number; deepSleep: number; timestamp: string };
    heartRate?: { resting: number; average: number; timestamp: string };
    activity?: { steps: number; activeMinutes: number; calories: number; timestamp: string };
    source: 'google_fit' | 'apple_health' | 'mock';
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
            maladaptiveCoping: number;
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

export class StressCalculator {

    static calculate(checkInData: CheckInData, healthData?: ObjectiveHealthData): StressCalculation {

        return {
            confidence: 0,
            dataQuality: undefined,
            insights: [],
            objectiveBreakdown: {activityScore: 0, heartRateScore: 0, hrvScore: 0, sleepScore: 0},
            objectiveScore: 0,
            problemA: {components: {jobDemands: 0, mood: 0, symptoms: 0}, score: 0, weight: 0},
            problemB: {
                components: {maladaptiveCoping: 0, threatMonitoring: 0, worryEnergy: 0, worryTime: 0},
                score: 0,
                weight: 0
            },
            riskLevel: undefined,
            stressScore: 0,
            subjectiveScore: 0
        };
    }

    private static calculateProblemA(data: CheckInData): {score: number; components: {mood: number; jobDemands: number; symptoms: number; };} {

        return {
            score: 0,
            components: {
                mood: 0,
                jobDemands: 0,
                symptoms: 0,
            },
        };
    }

    private static calculateProblemB(data: CheckInData): {
        score: number;
        components: {
            worryTime: number;
            threatMonitoring: number;
            maladaptiveCoping: number;
            worryEnergy: number;
        };
    } {

        return {
            score: 0,
            components: {
                worryTime: 0,
                threatMonitoring: 0,
                maladaptiveCoping: 0,
                worryEnergy: 0,
            },
        };
    }

    private static determineRiskLevel(score: number): 'Low' | 'Moderate' | 'High' {
        if (score >= 70) return 'High';
        if (score >= 40) return 'Moderate';
        return 'Low';
    }
}