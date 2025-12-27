import {CheckInData, HealthData} from '@/interfaces/Types'
import {objectiveProps, problemAProp, problemBProp, StressCalculation} from "@/interfaces/StressTypesProps";


export class StressCalculator {

    static calculate(checkInData: CheckInData, healthData?: HealthData): StressCalculation {

        const problemA = this.calculateProblemA(checkInData);
        const problemB = this.calculateProblemB(checkInData);

        // Weighted subjective score (Problem A = 30% & Problem B = 70%)
        const subjectiveScore = (problemB.score * 0.7) + (problemA.score * 0.3);

        const objectiveResult = healthData ? this.calculateObjectiveScore(healthData) : null;

        const hasObjective = objectiveResult !== null;

        let finalScore: number;
        let confidence: number;
        let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';

        if (hasObjective) {
            // Both Objective and subjective are weighted 50-50%
            finalScore = (subjectiveScore * 0.5) + (objectiveResult.score * 0.5);
            confidence = 95;
            dataQuality = 'excellent';
        } else {
            finalScore = subjectiveScore;
            confidence = 70;
            dataQuality = 'good';
        }

        const riskLevel = this.determineRiskLevel(finalScore);

        let insights= [''];
        if(objectiveResult !== null ){
         insights = this.generateMCTInsights(healthData, problemA, problemB, objectiveResult);
        }

        return {
            stressScore: Math.round(finalScore),
            subjectiveScore: Math.round(subjectiveScore),
            objectiveScore: Math.round(objectiveResult?.score || 0),
            problemA: {
                score: Math.round(problemA.score),
                weight: 0.3,
                components: problemA.components,
            },
            problemB: {
                score: Math.round(problemB.score),
                weight: 0.7,
                components: problemB.components,
            },
            objectiveBreakdown: objectiveResult?.breakdown || {
                hrvScore: 0,
                sleepScore: 0,
                heartRateScore: 0,
                activityScore: 0,
            },
            riskLevel: riskLevel,
            confidence: confidence,
            dataQuality: dataQuality,
            insights: insights,
        };
    }

    static calculateObjectiveOnly(healthData: HealthData): StressCalculation {
        const hasData = healthData.sleep || healthData.hrv || healthData.heartRate || healthData.activity;
        if (!hasData){
            return{
                stressScore: 0,
                    subjectiveScore: 0,
                objectiveScore: 0,
                problemA: {score: 0, weight: 0.3, components: {mood: 0, jobDemands: 0, symptoms: 0}},
                problemB: {
                    score: 0,
                        weight: 0.7,
                        components: {worryTime: 0, threatMonitoring: 0, harmfulCoping: 0, worryEnergy: 0}
                },
                objectiveBreakdown: {
                    hrvScore: 0,
                    sleepScore:0,
                    heartRateScore:0,
                    activityScore: 0
                },
                    riskLevel: 'Moderate',
                confidence: 0,
                dataQuality: 'poor',
                insights: ['No Data - add check-ins and objective data for better analysis'],
            };
        }
        const objective = this.calculateObjectiveScore(healthData);
        const finalScore = objective.score;

        return {
            stressScore: Math.round(finalScore),
            subjectiveScore: 0,
            objectiveScore: Math.round(objective.score),
            problemA: {score: 0, weight: 0.3, components: {mood: 0, jobDemands: 0, symptoms: 0}},
            problemB: {
                score: 0,
                weight: 0.7,
                components: {worryTime: 0, threatMonitoring: 0, harmfulCoping: 0, worryEnergy: 0}
            },
            objectiveBreakdown: objective.breakdown,
            riskLevel: this.determineRiskLevel(finalScore),
            confidence: 50,
            dataQuality: 'fair',
            insights: ['Objective data only – add check-ins for better accuracy'],
        };
    }

    private static calculateProblemA(data: CheckInData): problemAProp {
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

    private static calculateProblemB(data: CheckInData): problemBProp {
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

    private static calculateObjectiveScore(data: HealthData): objectiveProps{
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

    private static calculateHRVScore(hrv?: HealthData['hrv']): number {
        if (!hrv || hrv.interval <= 0) return 0;
        if (hrv.interval >= 80) return 10;
        if (hrv.interval >= 60) return 25;
        if (hrv.interval >= 40) return 50;
        if (hrv.interval >= 20) return 75;
        return 90;
    }

    private static calculateSleepScore(sleep?: HealthData['sleep']): number {
        if (!sleep || sleep.totalDurationHours <= 0) return 0;
        let score = 0;

        if (sleep.totalDurationHours < 5) score += 40;
        else if (sleep.totalDurationHours < 6) score += 30;
        else if (sleep.totalDurationHours < 7) score += 20;
        else if (sleep.totalDurationHours <= 9) score += 5;
        else score += 15;

        const qualityStress = 100 - sleep.sleepEfficiency;
        score += qualityStress * 0.3;

        if (sleep.deepSleepMinutes < 30) score += 30;
        else if (sleep.deepSleepMinutes < 60) score += 20;
        else if (sleep.deepSleepMinutes < 90) score += 10;
        else score += 0;

        return Math.min(100, score);
    }

    private static calculateHeartRateScore(hr?: HealthData['heartRate']): number {
        if (!hr || hr.restingBpm <= 0) return 0;
        let score = 0;

        if (hr.restingBpm < 60) score += 5;
        else if (hr.restingBpm < 70) score += 15;
        else if (hr.restingBpm < 80) score += 35;
        else if (hr.restingBpm < 90) score += 50;
        else score += 60;

        if (hr.averageBpm < 70) score += 5;
        else if (hr.averageBpm < 80) score += 15;
        else if (hr.averageBpm < 90) score += 25;
        else score += 40;

        return Math.min(100, score);
    }

    private static calculateActivityScore(activity?: HealthData['activity']): number {
        if (!activity || activity.steps <= 0) return 0;
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

    private static generateMCTInsights(
        health: HealthData | undefined,
        problemA: problemAProp,
        problemB: problemBProp,
        objective: objectiveProps
    ): string[] {
        const insights: string[] = [];

        if (health) {
            insights.push('Using subjective (MCT A/B) + objective (health) data');
        } else {
            insights.push('Connect health tracking to get personalized insights');
        }

        if (problemB.score > 60) {
            insights.push('High metacognitive activity detected. Focus on how you\'re thinking about your worries, not just the worries themselves');
        }
        if (problemB.components.worryTime > 20) {
            insights.push('You\'re spending significant time worrying. Try limiting worry sessions to 15-30 minutes per day with scheduled "worry time"');
        }
        if (problemB.components.threatMonitoring > 20) {
            insights.push('High threat monitoring. Practice acknowledging thoughts without getting pulled into them');
        }
        if (problemB.components.harmfulCoping > 20) {
            insights.push('Harmful coping detected - focus on changing responses rather than avoiding stressors');
        }

        if (problemA.components.jobDemands > 25) {
            insights.push('Work demands are notably high. Consider discussing workload distribution or priorities with your manager');
        }
        if (problemA.components.symptoms > 20) {
            insights.push('Multiple physical symptoms. If these persist, consulting with a healthcare provider is recommended');
        }

        if (problemB.score > problemA.score + 20) {
            insights.push('Your reaction to stress appears more intense than the stressors themselves.');
        } else if (problemA.score > problemB.score + 20) {
            insights.push('External pressures are high, but good metacognitive control');
        }

        if (objective?.breakdown.hrvScore > 60) {
            insights.push('Your heart rate variability suggests elevated stress levels. Your body is in stress mode, even if mind feels okay');
        }
        if (objective?.breakdown.sleepScore > 50) {
            insights.push('Sleep quality is affected, which impacts both mood and worry patterns. Improving sleep could help break this cycle');
        }
        if (health && objective?.breakdown.sleepScore > 50 && problemB.components.worryTime > 20) {
            insights.push('Poor sleep and excessive worrying are reinforcing each other. Prioritizing sleep hygiene could reduce worry time');
        }

        if (problemA.score < 40 && problemB.score > 60) {
            insights.push('The stressors you face are manageable, work on reducing metacognitive responses');
        }
        if (problemB.score < 30) {
            insights.push('You\'re managing worry and stress thoughts effectively. Keep up these healthy mental habits');
        }

        return insights;
    }
}