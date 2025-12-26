import { CheckInData } from '@/interfaces/Types';

export interface ICheckInService {
    saveCheckIn(data: CheckInData): Promise<void>;
    getCheckInForDate(date: string): Promise<CheckInData | null>;
    getCheckInsForDateRange(startDate: string, endDate: string): Promise<CheckInData[]>;
    getLatestCheckIn(): Promise<CheckInData | null>;
    deleteCheckIn(date: string): Promise<boolean>;
    hasCheckedInToday(): Promise<boolean>;
}

export class MockCheckInService implements ICheckInService {

    async saveCheckIn(data: CheckInData): Promise<void> {
        console.log('MockCheckInService: saveCheckIn called', data);
    }

    async getCheckInForDate(date: string): Promise<CheckInData | null> {
        return this.generateMockCheckInForDate(date);
    }

    async getCheckInsForDateRange(startDate: string, endDate: string): Promise<CheckInData[]> {
        const checkIns: CheckInData[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const checkIn = this.generateMockCheckInForDate(dateStr);
            checkIns.push(checkIn);
        }

        return checkIns;
    }

    async getLatestCheckIn(): Promise<CheckInData | null> {
        const today = new Date().toISOString().split('T')[0];
        return this.generateMockCheckInForDate(today);
    }

    async deleteCheckIn(date: string): Promise<boolean> {
        console.log('MockCheckInService: deleteCheckIn called for', date);
        return true;
    }

    async hasCheckedInToday(): Promise<boolean> {
        return Math.random() > 0.3;
    }

    private generateMockCheckInForDate(date: string): CheckInData {
        const dayOfWeek = new Date(date).getDay();

        // Define stress patterns for each day of the week
        const stressPatterns: Record<number, Partial<CheckInData>> = {
            0: { mood: 'neutral', worryTime: 'moderate', threatMonitoring: 'minimal' },     // Sunday
            1: { mood: 'overwhelmed', worryTime: 'significant', threatMonitoring: 'significant' }, // Monday (worst)
            2: { mood: 'drained', worryTime: 'moderate', threatMonitoring: 'moderate' },    // Tuesday
            3: { mood: 'neutral', worryTime: 'moderate', threatMonitoring: 'minimal' },     // Wednesday
            4: { mood: 'neutral', worryTime: 'minimal', threatMonitoring: 'minimal' },      // Thursday
            5: { mood: 'energized', worryTime: 'minimal', threatMonitoring: 'minimal' },    // Friday (best)
            6: { mood: 'energized', worryTime: 'minimal', threatMonitoring: 'minimal' },    // Saturday
        };

        const pattern = stressPatterns[dayOfWeek] || stressPatterns[0];

        return {
            type: 'daily',
            mood: pattern.mood || 'neutral',
            worryTime: pattern.worryTime || 'moderate',
            threatMonitoring: pattern.threatMonitoring || 'minimal',
            jobDemand: {
                workloadToday: dayOfWeek === 1 ? 'High' : 'Moderate',
                controlOverTasks: dayOfWeek === 1 ? 'Low' : 'High',
                socialSupport: 'Moderate',
            },
            coping: {
                avoidedSituations: 'Rarely',
                avoidingThoughts: dayOfWeek === 1 ? 'Often' : 'Rarely',
                alcoholPills: 'Never',
                soughtReassurance: 'Rarely',
                controlledMyEmotions: 'Moderate',
                monitorMySymptoms: 'Rarely',
            },
            symptoms: {
                symptoms: dayOfWeek === 1 ? ['fatigue', 'tension'] : [],
                notes: '',
            },
        };
    }
}

// Singleton instances
export const mockCheckInService = new MockCheckInService();