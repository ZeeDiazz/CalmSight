import {StressCalculator} from '@/utils/StressCalculator';
import {CheckInData, ObjectiveHealthData} from '@/interfaces/DataTypes';

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

const mockLowStressHealthData = (): ObjectiveHealthData => ({
    hrv: {value: 85, timestamp: new Date().toISOString()},
    sleep: {duration: 8, quality: 90, deepSleep: 100, timestamp: new Date().toISOString()},
    heartRate: {resting: 58, average: 65, timestamp: new Date().toISOString()},
    activity: {steps: 10000, activeMinutes: 60, calories: 2500, timestamp: new Date().toISOString()},
    source: 'mock',
});

const mockHighStressHealthData = (): ObjectiveHealthData => ({
    hrv: {value: 18, timestamp: new Date().toISOString()},
    sleep: {duration: 4.5, quality: 50, deepSleep: 20, timestamp: new Date().toISOString()},
    heartRate: {resting: 95, average: 100, timestamp: new Date().toISOString()},
    activity: {steps: 1500, activeMinutes: 5, calories: 1800, timestamp: new Date().toISOString()},
    source: 'mock',
});

const mockModerateStressHealthData = (): ObjectiveHealthData => ({
    hrv: {value: 50, timestamp: new Date().toISOString()},
    sleep: {duration: 6.5, quality: 70, deepSleep: 55, timestamp: new Date().toISOString()},
    heartRate: {resting: 72, average: 78, timestamp: new Date().toISOString()},
    activity: {steps: 6000, activeMinutes: 35, calories: 2200, timestamp: new Date().toISOString()},
    source: 'mock',
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

        it('Calculates HRV score correctly', () => {
            //Low Stress
            const highHRV: ObjectiveHealthData = {
                hrv: { value: 85, timestamp: new Date().toISOString() },
                source: 'mock',
            };

            //High Stress
            const lowHRV: ObjectiveHealthData = {
                hrv: { value: 15, timestamp: new Date().toISOString() },
                source: 'mock',
            };

            const highResult = StressCalculator.calculate(mockEmptyCheckIn(), highHRV);
            const lowResult = StressCalculator.calculate(mockEmptyCheckIn(), lowHRV);

            expect(highResult.objectiveBreakdown.hrvScore).toBeLessThan(lowResult.objectiveBreakdown.hrvScore);
        });

        it('Calculates sleep score based on duration, quality, and deep sleep', () => {
            const goodSleep: ObjectiveHealthData = {
                sleep: { duration: 8, quality: 90, deepSleep: 100, timestamp: new Date().toISOString() },
                source: 'mock',
            };

            const poorSleep: ObjectiveHealthData = {
                sleep: { duration: 4, quality: 40, deepSleep: 15, timestamp: new Date().toISOString() },
                source: 'mock',
            };

            const goodResult = StressCalculator.calculate(mockEmptyCheckIn(), goodSleep);
            const poorResult = StressCalculator.calculate(mockEmptyCheckIn(), poorSleep);

            expect(goodResult.objectiveBreakdown.sleepScore).toBeLessThan(poorResult.objectiveBreakdown.sleepScore);
        });

        it('Calculates activity score with optimal range', () => {
            const lowActivity: ObjectiveHealthData = {
                activity: { steps: 1000, activeMinutes: 5, calories: 1500, timestamp: new Date().toISOString() },
                source: 'mock',
            };

            const optimalActivity: ObjectiveHealthData = {
                activity: { steps: 8000, activeMinutes: 45, calories: 2300, timestamp: new Date().toISOString() },
                source: 'mock',
            };

            const highActivity: ObjectiveHealthData = {
                activity: { steps: 25000, activeMinutes: 200, calories: 4000, timestamp: new Date().toISOString() },
                source: 'mock',
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

