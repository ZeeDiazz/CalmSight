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

export class StressCalculator {

    static calculate(checkInData: CheckInData, healthData?: ObjectiveHealthData): StressCalculation {

        const problemA = this.calculateProblemA(checkInData);

        const problemB = this.calculateProblemB(checkInData);

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
                score: Math.round(problemB.score),
                weight: 0.7, // 70% of subjective ⭐
                components: problemB.components,
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

    private static calculateProblemB(data: CheckInData): { score: number; components: { worryTime: number; threatMonitoring: number; harmfulCoping: number; worryEnergy: number; }; } {
        const worryTimeMap: Record<string, number> = {
            'minimal': 5,
            'moderate': 15,
            'significant': 25,
            'overwhelming': 30,
        };
        const worryTimeScore = worryTimeMap[data.worryTime || 'minimal'] || 5;

        const threatMap: Record<string, number> = {
            'minimal': 5,
            'moderate': 15,
            'significant': 25,
            'overwhelming': 30,
        };
        const threatScore = threatMap[data.threatMonitoring || 'minimal'] || 5;

        let copingScore = 0;
        if (data.coping) {
            const maladaptiveCoping = [
                'avoidedSituations',
                'avoidingThoughts',
                'alcoholPills',
                'soughtReassurance',
                'controlledMyEmotions',
                'monitorMySymptoms',
            ];

            const frequencyMap: Record<string, number> = {
                'Never': 0,
                'Rarely': 2,
                'Moderate': 5,
                'Often': 7,
                'Always': 10,
            };

            maladaptiveCoping.forEach(strategy => {
                const frequency = data.coping?.[strategy];
                if (frequency) {
                    copingScore += frequencyMap[frequency] || 0;
                }
            });
        }
        copingScore = Math.min(30, copingScore);

        const worryIntensity: Record<string, number> = {
            'minimal': 1,
            'moderate': 3,
            'significant': 5,
            'overwhelming': 7,
        };
        const intensity = worryIntensity[data.worryTime || 'minimal'] || 1;

        const timeDuration: Record<string, number> = {
            'minimal': 1,
            'moderate': 2,
            'significant': 3,
            'overwhelming': 4,
        };
        const duration = timeDuration[data.worryTime || 'minimal'] || 1;

        const worryEnergyScore = Math.min(10, intensity + duration);

        const totalScore = worryTimeScore + threatScore + copingScore + worryEnergyScore;

        return {
            score: Math.min(100, totalScore),
            components: {
                worryTime: worryTimeScore,
                threatMonitoring: threatScore,
                harmfulCoping: copingScore,
                worryEnergy: worryEnergyScore,
            },
        };
    }

    private static calculateObjectiveScore(data: ObjectiveHealthData): {
        score: number;
        breakdown: {
            hrvScore: number;
            sleepScore: number;
            heartRateScore: number;
            activityScore: number;
        };
    } {
        const hrvScore = this.calculateHRVScore(data.hrv);
        const sleepScore = this.calculateSleepScore(data.sleep);
        const heartRateScore = this.calculateHeartRateScore(data.heartRate);
        const activityScore = this.calculateActivityScore(data.activity);

        const weights = {hrv: 0.35, sleep: 0.35, heartRate: 0.20, activity: 0.10,};

        const score = (
            hrvScore * weights.hrv +
            sleepScore * weights.sleep +
            heartRateScore * weights.heartRate +
            activityScore * weights.activity
        );

        return {
            score: Math.min(100, score),
            breakdown: {
                hrvScore,
                sleepScore,
                heartRateScore,
                activityScore,
            },
        };
    }

    private static calculateHRVScore(hrv?: ObjectiveHealthData['hrv']): number {
        if (!hrv) return 50;
        if (hrv.value >= 80) return 10;
        if (hrv.value >= 60) return 25;
        if (hrv.value >= 40) return 50;
        if (hrv.value >= 20) return 75;
        return 90;
    }

    private static calculateSleepScore(sleep?: ObjectiveHealthData['sleep']): number {
        if (!sleep) return 50;
        let score = 0;

        if (sleep.duration < 5) score += 40;
        else if (sleep.duration < 6) score += 30;
        else if (sleep.duration < 7) score += 20;
        else if (sleep.duration <= 9) score += 5;
        else score += 15;

        const qualityStress = 100 - sleep.quality;
        score += qualityStress * 0.3;

        if (sleep.deepSleep < 30) score += 30;
        else if (sleep.deepSleep < 60) score += 20;
        else if (sleep.deepSleep < 90) score += 10;
        else score += 0;

        return Math.min(100, score);
    }

    private static calculateHeartRateScore(hr?: ObjectiveHealthData['heartRate']): number {
        if (!hr) return 50;
        let score = 0;

        if (hr.resting < 60) score += 5;
        else if (hr.resting < 70) score += 15;
        else if (hr.resting < 80) score += 35;
        else if (hr.resting < 90) score += 50;
        else score += 60;

        if (hr.average < 70) score += 5;
        else if (hr.average < 80) score += 15;
        else if (hr.average < 90) score += 25;
        else score += 40;

        return Math.min(100, score);
    }

    private static calculateActivityScore(activity?: ObjectiveHealthData['activity']): number {
        if (!activity) return 50;
        let score = 0;

        if (activity.steps < 2000) score += 30;
        else if (activity.steps < 5000) score += 15;
        else if (activity.steps <= 12000) score += 0;
        else if (activity.steps <= 20000) score += 10;
        else score += 20;

        if (activity.activeMinutes < 10) score += 30;
        else if (activity.activeMinutes < 30) score += 15;
        else if (activity.activeMinutes <= 90) score += 0;
        else if (activity.activeMinutes <= 150) score += 10;
        else score += 20;

        return Math.min(100, score);
    }

    private static determineRiskLevel(score: number): 'Low' | 'Moderate' | 'High' {
        if (score >= 70) return 'High';
        if (score >= 40) return 'Moderate';
        return 'Low';
    }
}