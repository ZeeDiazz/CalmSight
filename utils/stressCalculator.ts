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

        const problemA = this.calculateProblemA(checkInData);

        return {
            confidence: 0,
            dataQuality: 'excellent',
            insights: [],
            objectiveBreakdown: {activityScore: 0, heartRateScore: 0, hrvScore: 0, sleepScore: 0},
            objectiveScore: 0,
            problemA: {
                score: Math.round(problemA.score),
                weight: 0.3,
                components: problemA.components,
            },
            problemB: {
                score: 0,
                weight: 0,
                components: {maladaptiveCoping: 0, threatMonitoring: 0, worryEnergy: 0, worryTime: 0}
            },
            riskLevel: 'Low',
            stressScore: 0,
            subjectiveScore: 0
        };
    }

    private static calculateProblemA(data: CheckInData): {score: number; components: {mood: number; jobDemands: number; symptoms: number;};} {
        const moodMap: Record<string, number> = {
            'overwhelmed': 35,
            'drained': 25,
            'neutral': 15,
            'energized': 5,
        };
        const moodScore = moodMap[data.mood || 'neutral'] || 15;


        let jobDemandsScore = 0;
        if (data.jobDemand) {
            const demandMap: Record<string, number> = {
                'Lowest': 0, 'Low': 5, 'Moderate': 10, 'High': 15, 'Highest': 20,
            };
            jobDemandsScore += demandMap[data.jobDemand['workloadToday']] || 0;
            const control = demandMap[data.jobDemand['controlOverTasks']] || 10;
            jobDemandsScore += (20 - control);
            const support = demandMap[data.jobDemand['socialSupport']] || 10;
            jobDemandsScore += (20 - support);
        }
        jobDemandsScore = Math.min(35, jobDemandsScore);

        let symptomsScore = 0;
        if (data.symptoms?.symptoms) {
            symptomsScore = Math.min(30, data.symptoms.symptoms.length * 5);
        }

        // Total Problem A
        const totalScore = moodScore + jobDemandsScore + symptomsScore;

        return {
            score: Math.min(100, totalScore),
            components: {
                mood: moodScore,
                jobDemands: jobDemandsScore,
                symptoms: symptomsScore,
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