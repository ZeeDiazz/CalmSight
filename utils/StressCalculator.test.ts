import {StressCalculator} from '@/utils/StressCalculator';
import {CheckInData, HealthData, HealthDataSource} from '@/interfaces/Types';

const mockSource: HealthDataSource = 'mock';
const now = new Date().toISOString();
const today = new Date().toISOString().split('T')[0];

const mockEmptyCheckIn = (): CheckInData => ({
    type: 'daily',
    mood: null,
    worryTime: null,
    threatMonitoring: null,
    jobDemand: null,
    coping: null,
    symptoms: null,
});
const mockLowStressCheckIn = (): CheckInData => ({
    type: 'daily',
    mood: 'energized',
    worryTime: 'minimal',
    threatMonitoring: 'minimal',
    jobDemand: {
        workloadToday: 'Low',
        controlOverTasks: 'High',
        socialSupport: 'High',
    },
    coping: {
        avoidedSituations: 'Never',
        avoidingThoughts: 'Never',
        alcoholPills: 'Never',
        monitorMySymptoms: 'Never',
    },
    symptoms: {symptoms: [], notes: ''},
});
const mockModerateStressCheckIn = (): CheckInData => ({
    type: 'daily',
    mood: 'neutral',
    worryTime: 'moderate',
    threatMonitoring: 'moderate',
    jobDemand: {
        workloadToday: 'Moderate',
        controlOverTasks: 'Moderate',
        socialSupport: 'Moderate',
    },
    coping: {
        avoidedSituations: 'Rarely',
        avoidingThoughts: 'Moderate',
        alcoholPills: 'Never',
        monitorMySymptoms: 'Rarely',
    },
    symptoms: {symptoms: ['fatigue'], notes: ''},
});
const mockHighStressCheckIn = (): CheckInData => ({
    type: 'daily',
    mood: 'overwhelmed',
    worryTime: 'overwhelming',
    threatMonitoring: 'overwhelming',
    jobDemand: {
        workloadToday: 'Highest',
        controlOverTasks: 'Lowest',
        socialSupport: 'Lowest',
    },
    coping: {
        avoidedSituations: 'Always',
        avoidingThoughts: 'Always',
        alcoholPills: 'Often',
        monitorMySymptoms: 'Always',
    },
    symptoms: {
        symptoms: ['headache', 'fatigue', 'tension', 'insomnia', 'anxiety', 'irritability'],
        notes: 'Very stressed'
    },
});

const mockLowStressHealthData = (): HealthData => ({
    date: today,
    hrv: { interval: 85, shortTermHrv: 72, timestamp: now, source: mockSource },
    sleep: {
        startTime: now,
        endTime: now,
        stages: [],
        totalDurationHours: 8,
        timeAsleepHours: 7.5,
        timeAwakeMinutes: 30,
        deepSleepMinutes: 100,
        lightSleepMinutes: 200,
        remSleepMinutes: 110,
        sleepEfficiency: 90,
        source: mockSource,
    },
    heartRate: {
        restingBpm: 58,
        averageBpm: 65,
        minBpm: 52,
        maxBpm: 120,
        startTime: now,
        endTime: now,
        source: mockSource,
    },
    activity: {
        steps: 10000,
        activeMinutes: 60,
        activeCalories: 400,
        basalCalories: 1800,
        totalCalories: 2200,
        date: today,
        source: mockSource,
    },
    sources: [{ type: mockSource, name: 'Mock' }],
    lastUpdated: now,
    dataCompleteness: 'complete',
});
const mockModerateStressHealthData = (): HealthData => ({
    date: today,
    hrv: { interval: 50, shortTermHrv: 42, timestamp: now, source: mockSource },
    sleep: {
        startTime: now,
        endTime: now,
        stages: [],
        totalDurationHours: 6.5,
        timeAsleepHours: 5.5,
        timeAwakeMinutes: 60,
        deepSleepMinutes: 55,
        lightSleepMinutes: 180,
        remSleepMinutes: 75,
        sleepEfficiency: 70,
        source: mockSource,
    },
    heartRate: {
        restingBpm: 72,
        averageBpm: 78,
        minBpm: 62,
        maxBpm: 140,
        startTime: now,
        endTime: now,
        source: mockSource,
    },
    activity: {
        steps: 6000,
        activeMinutes: 35,
        activeCalories: 250,
        basalCalories: 1750,
        totalCalories: 2000,
        date: today,
        source: mockSource,
    },
    sources: [{ type: mockSource, name: 'Mock' }],
    lastUpdated: now,
    dataCompleteness: 'complete',
});
const mockHighStressHealthData = (): HealthData => ({
    date: today,
    hrv: { interval: 18, shortTermHrv: 15, timestamp: now, source: mockSource },
    sleep: {
        startTime: now,
        endTime: now,
        stages: [],
        totalDurationHours: 4.5,
        timeAsleepHours: 3.5,
        timeAwakeMinutes: 60,
        deepSleepMinutes: 20,
        lightSleepMinutes: 120,
        remSleepMinutes: 40,
        sleepEfficiency: 50,
        source: mockSource,
    },
    heartRate: {
        restingBpm: 95,
        averageBpm: 100,
        minBpm: 80,
        maxBpm: 160,
        startTime: now,
        endTime: now,
        source: mockSource,
    },
    activity: {
        steps: 1500,
        activeMinutes: 5,
        activeCalories: 100,
        basalCalories: 1700,
        totalCalories: 1800,
        date: today,
        source: mockSource,
    },
    sources: [{ type: mockSource, name: 'Mock' }],
    lastUpdated: now,
    dataCompleteness: 'complete',
});

describe('StressCalculator', () => {
    describe('Main Stress Calculator Method', () => {

        it('Calculates low stress for low stress data', () => {
            const result = StressCalculator.calculate(
                mockLowStressCheckIn(),
                mockLowStressHealthData()
            );
            expect(result.stressScore).toBeLessThan(40);
            expect(result.riskLevel).toBe('Low');
        });

        it('Calculates moderate stress for moderate data', () => {
            const result = StressCalculator.calculate(
                mockModerateStressCheckIn(),
                mockModerateStressHealthData()
            );
            expect(result.stressScore).toBeGreaterThanOrEqual(30);
            expect(result.stressScore).toBeLessThanOrEqual(70);
            expect(result.riskLevel).toBe('Moderate');
        });

        it('Calculates high stress for high stress data', () => {
            const result = StressCalculator.calculate(
                mockHighStressCheckIn(),
                mockHighStressHealthData()
            );

            expect(result.stressScore).toBeGreaterThan(60);
            expect(result.riskLevel).toBe('High');
        });

        it('Should have higher confidence with health data', () => {
            const withHealth = StressCalculator.calculate(
                mockModerateStressCheckIn(),
                mockModerateStressHealthData()
            );
            const withoutHealth = StressCalculator.calculate(
                mockModerateStressCheckIn()
            );

            expect(withHealth.confidence).toBe(95);
            expect(withoutHealth.confidence).toBe(70);
        });

        it('Should have better data quality with health data', () => {
            const withHealth = StressCalculator.calculate(
                mockModerateStressCheckIn(),
                mockModerateStressHealthData()
            );
            const withoutHealth = StressCalculator.calculate(
                mockModerateStressCheckIn()
            );

            expect(withHealth.dataQuality).toBe('excellent');
            expect(withoutHealth.dataQuality).toBe('good');
        });
    });
    describe('Subjective - Problem A & Problem B', () => {

        const baseCheckIn: CheckInData = {
            type: 'daily',
            mood: null,
            worryTime: null,
            threatMonitoring: null,
            jobDemand: null,
            coping: null,
            symptoms: null,
        };

        describe('Problem A - Mood', () => {
            it('Assigns correct score for overwhelmed mood', () => {
                const result = StressCalculator.calculate({
                    ...baseCheckIn,
                    mood: 'overwhelmed',
                });

                expect(result.problemA.components.mood).toBe(35);
            });

            it('Defaults to neutral mood when mood is null', () => {
                const result = StressCalculator.calculate(baseCheckIn);

                expect(result.problemA.components.mood).toBe(15);
            });
        });

        describe('Problem A - Job Demands Control', () => {
            it('Calculates workload, control and support correctly with max score at 35', () => {
                const result = StressCalculator.calculate({
                    ...baseCheckIn,
                    jobDemand: {
                        workloadToday: 'Highest',
                        controlOverTasks: 'Low',
                        socialSupport: 'Low',
                    },
                });

                expect(result.problemA.components.jobDemands).toBe(35);
            });
        });

        describe('Problem A - Symptoms', () => {
            it('Adds 5 points per symptom with max score at 30', () => {
                const result = StressCalculator.calculate({
                    ...baseCheckIn,
                    symptoms: {
                        symptoms: [
                            'exhaustion',
                            'irritability',
                            'focusIssues',
                            'headaches',
                            'sleepProblems',
                            'muscleTension',
                        ],
                        notes: '',
                    },
                });
                expect(result.problemA.components.symptoms).toBe(30);
            });
        });

        describe('Problem B - Worry Time & Threat Monitoring', () => {
            it('Maps worry time and threat monitoring correctly', () => {
                const result = StressCalculator.calculate({
                    ...baseCheckIn,
                    worryTime: 'significant',
                    threatMonitoring: 'overwhelming',
                });
                expect(result.problemB.components.worryTime).toBe(25);
                expect(result.problemB.components.threatMonitoring).toBe(30);
            });
        });

        describe('Problem B - harmful Coping', () => {
            it('Counts only harmful coping strategies with max score at 30', () => {
                const result = StressCalculator.calculate({
                    ...baseCheckIn,
                    coping: {
                        avoidedSituations: 'Always',
                        avoidingThoughts: 'Often',
                        alcoholPills: 'Moderate',
                        monitorMySymptoms: 'Always',

                        soughtReassurance: 'Always',
                        controlledMyEmotions: 'Always',
                    },
                });
                expect(result.problemB.components.harmfulCoping).toBe(30);
            });
        });

        describe('Problem B - Worry Energy', () => {
            it('Calculates worry energy from intensity and duration with max score at 10', () => {
                const result = StressCalculator.calculate({
                    ...baseCheckIn,
                    worryTime: 'overwhelming',
                });
                expect(result.problemB.components.worryEnergy).toBe(10);
            });
        });

        describe('Problem B outweighs Problem A', () => {
            it('Produces higher Problem B score when metacognitive load is high', () => {
                const result = StressCalculator.calculate({
                    ...baseCheckIn,
                    mood: 'neutral',
                    worryTime: 'overwhelming',
                    threatMonitoring: 'overwhelming',
                    coping: {
                        avoidedSituations: 'Always',
                        monitorMySymptoms: 'Always',
                    },
                });
                expect(result.problemB.score).toBeGreaterThan(result.problemA.score);
            });
        });
    });
    describe('Objective', () => {
        it('Returns 0 objective score when no health data provided', () => {
            const result = StressCalculator.calculate(mockModerateStressCheckIn());
            expect(result.objectiveScore).toBe(0);
        });

        it('Should calculate HRV score correctly', () => {
            const highHRV: HealthData = {...mockLowStressHealthData(), hrv: { interval: 85, timestamp: now, source: mockSource },};

            const lowHRV: HealthData = {...mockLowStressHealthData(), hrv: { interval: 15, timestamp: now, source: mockSource },};

            const highResult = StressCalculator.calculate(mockEmptyCheckIn(), highHRV);
            const lowResult = StressCalculator.calculate(mockEmptyCheckIn(), lowHRV);

            expect(highResult.objectiveBreakdown.hrvScore).toBeLessThan(lowResult.objectiveBreakdown.hrvScore);
        });

        it('Calculates sleep score based on duration, quality, and deep sleep', () => {
            const goodSleep: HealthData = {
                ...mockLowStressHealthData(),
                sleep: {
                    ...mockLowStressHealthData().sleep!,
                    totalDurationHours: 8,
                    sleepEfficiency: 90,
                    deepSleepMinutes: 100,
                },
            };

            const poorSleep: HealthData = {
                ...mockLowStressHealthData(),
                sleep: {
                    ...mockLowStressHealthData().sleep!,
                    totalDurationHours: 4,
                    sleepEfficiency: 40,
                    deepSleepMinutes: 15,
                },
            };

            const goodResult = StressCalculator.calculate(mockEmptyCheckIn(), goodSleep);
            const poorResult = StressCalculator.calculate(mockEmptyCheckIn(), poorSleep);

            expect(goodResult.objectiveBreakdown.sleepScore).toBeLessThan(poorResult.objectiveBreakdown.sleepScore);
        });

        it('Calculates activity score with optimal range', () => {
            const lowActivity: HealthData = {
                ...mockLowStressHealthData(),
                activity: {
                    ...mockLowStressHealthData().activity!,
                    steps: 1000,
                    activeMinutes: 5,
                    totalCalories: 1500
                }
            };

            const optimalActivity: HealthData = {
                ...mockLowStressHealthData(),
                activity: {
                    ...mockLowStressHealthData().activity!,
                    steps: 8000,
                    activeMinutes: 45,
                    totalCalories: 2300
                }
            };

            const highActivity: HealthData = {
                ...mockLowStressHealthData(),
                activity: {
                    ...mockLowStressHealthData().activity!,
                    steps: 25000,
                    activeMinutes: 200,
                    totalCalories: 4000
                }
            };

            const lowActivityResult = StressCalculator.calculate(mockEmptyCheckIn(), lowActivity);
            const optimalActivityResult = StressCalculator.calculate(mockEmptyCheckIn(), optimalActivity);
            const highActivityResult = StressCalculator.calculate(mockEmptyCheckIn(), highActivity);

            // OptimalActivity should have the least stress score
            expect(optimalActivityResult.objectiveBreakdown.activityScore).toBeLessThan(lowActivityResult.objectiveBreakdown.activityScore);
            expect(optimalActivityResult.objectiveBreakdown.activityScore).toBeLessThan(highActivityResult.objectiveBreakdown.activityScore);
        });
    });
});

