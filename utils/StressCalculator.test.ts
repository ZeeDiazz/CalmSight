import { StressCalculator, CheckInData} from '@/utils/stressCalculator';


describe('Stress Calculator - Problem A & Problem B', () => {

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
