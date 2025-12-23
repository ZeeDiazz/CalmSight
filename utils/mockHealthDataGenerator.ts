import {PermissionStatus,IHealthDataService, HealthData, SleepSession, SleepStageRecord, HeartRateRecord, HrvRecord, ActivityRecord, HealthDataSource} from '@/interfaces/Types';

export class MockHealthDataService implements IHealthDataService {
    private mockSource: HealthDataSource = 'mock';

    // Mock is always available
    async isAvailable(): Promise<boolean> {
        return true;
    }
    async requestPermissions(): Promise<boolean> {
        return true;
    }
    async getPermissionStatus(): Promise<PermissionStatus> {
        return {
            sleep: 'granted',
            heartRate: 'granted',
            hrv: 'granted',
            steps: 'granted',
            activity: 'granted',
        };
    }

    async getLatestHealthData(): Promise<HealthData> {
        return this.generateHealthData('moderate');
    }

    async getHealthDataForDate(date: string): Promise<HealthData> {
        return this.generateHealthData('moderate', date);
    }

    async getHealthDataRange(startDate: string, endDate: string): Promise<HealthData[]> {
        const data: HealthData[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            data.push(this.generateHealthData('moderate', dateStr));
        }

        return data;
    }

    async getLatestSleep(): Promise<SleepSession | null> {
        const data = await this.getLatestHealthData();
        return data.sleep;
    }

    async getLatestHeartRate(): Promise<HeartRateRecord | null> {
        const data = await this.getLatestHealthData();
        return data.heartRate;
    }

    async getLatestHrv(): Promise<HrvRecord | null> {
        const data = await this.getLatestHealthData();
        return data.hrv;
    }

    async getTodayActivity(): Promise<ActivityRecord | null> {
        const data = await this.getLatestHealthData();
        return data.activity;
    }

    generateHealthData(stressLevel: 'low' | 'moderate' | 'high', date?: string): HealthData {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        const dayOfWeek = new Date(targetDate).getDay();
        const hourOfDay = new Date().getHours();

        const weekdayMultiplier = this.getWeekdayMultiplier(dayOfWeek);
        const timeMultiplier = this.getTimeMultiplier(hourOfDay);

        return {
            date: targetDate,
            sleep: this.generateSleepSession(stressLevel, targetDate, weekdayMultiplier),
            heartRate: this.generateHeartRateRecord(stressLevel, timeMultiplier),
            hrv: this.generateHrvRecord(stressLevel, weekdayMultiplier),
            activity: this.generateActivityRecord(stressLevel, targetDate, weekdayMultiplier),
            sources: [{
                type: this.mockSource,
                name: 'Mock Data (Development)',
                lastSyncTime: now,
            }],
            lastUpdated: now,
            dataCompleteness: 'complete',
        };
    }

    generateCorrelatedHealthData(
        mood: 'overwhelmed' | 'drained' | 'neutral' | 'energized',
        worryLevel: 'minimal' | 'moderate' | 'significant' | 'overwhelming'
    ): HealthData {
        let stressLevel: 'low' | 'moderate' | 'high';

        if (mood === 'overwhelmed' || worryLevel === 'overwhelming') {
            stressLevel = 'high';
        } else if (mood === 'drained' || worryLevel === 'significant') {
            stressLevel = 'moderate';
        } else if (mood === 'energized' && worryLevel === 'minimal') {
            stressLevel = 'low';
        } else {
            stressLevel = 'moderate';
        }

        return this.generateHealthData(stressLevel);
    }

    private generateSleepSession(stressLevel: 'low' | 'moderate' | 'high', date: string, weekdayMultiplier: number): SleepSession {
        const baseParams = {
            low: {duration: 8.0, efficiency: 88, deepPct: 0.20, remPct: 0.22},
            moderate: {duration: 6.8, efficiency: 75, deepPct: 0.15, remPct: 0.18},
            high: {duration: 5.5, efficiency: 60, deepPct: 0.10, remPct: 0.12},
        }[stressLevel];

        const duration = this.addVariation(baseParams.duration * weekdayMultiplier, 0.5);
        const efficiency = this.addVariation(baseParams.efficiency * weekdayMultiplier, 5);

        const totalMinutes = duration * 60;
        const timeAsleep = totalMinutes * (efficiency / 100);
        const deepMinutes = timeAsleep * this.addVariation(baseParams.deepPct, 0.03);
        const remMinutes = timeAsleep * this.addVariation(baseParams.remPct, 0.03);
        const lightMinutes = timeAsleep - deepMinutes - remMinutes;
        const awakeMinutes = totalMinutes - timeAsleep;

        const sleepDate = new Date(date);
        sleepDate.setDate(sleepDate.getDate() - 1);
        sleepDate.setHours(22 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        const wakeDate = new Date(sleepDate.getTime() + totalMinutes * 60 * 1000);

        const stages = this.generateSleepStages(sleepDate, duration);

        return {
            startTime: sleepDate.toISOString(),
            endTime: wakeDate.toISOString(),
            stages,
            totalDurationHours: Math.max(3, Math.min(11, Number(duration.toFixed(1)))),
            timeAsleepHours: Number((timeAsleep / 60).toFixed(1)),
            timeAwakeMinutes: Math.round(awakeMinutes),
            deepSleepMinutes: Math.round(deepMinutes),
            lightSleepMinutes: Math.round(lightMinutes),
            remSleepMinutes: Math.round(remMinutes),
            sleepEfficiency: Math.max(40, Math.min(98, Math.round(efficiency))),
            source: this.mockSource,
        };
    }

    private generateSleepStages(startTime: Date, durationHours: number): SleepStageRecord[] {
        const stages: SleepStageRecord[] = [];
        let currentTime = new Date(startTime);

        // Sleep cycles: Light → Deep → Light → REM (repeat ~4-6 times)
        // Each cycle is roughly 90 minutes
        const numCycles = Math.floor(durationHours * 60 / 90);

        for (let cycle = 0; cycle < numCycles; cycle++) {
            const isFirstHalf = cycle < numCycles / 2;

            // Light sleep
            const lightDuration = 15 + Math.random() * 15;
            stages.push(this.createStageRecord('light', currentTime, lightDuration));
            currentTime = new Date(currentTime.getTime() + lightDuration * 60 * 1000);

            // Deep sleep (more in first half)
            if (isFirstHalf || Math.random() > 0.5) {
                const deepDuration = isFirstHalf ? 20 + Math.random() * 20 : 10 + Math.random() * 10;
                stages.push(this.createStageRecord('deep', currentTime, deepDuration));
                currentTime = new Date(currentTime.getTime() + deepDuration * 60 * 1000);
            }

            // Light sleep transition
            const transitionLight = 10 + Math.random() * 10;
            stages.push(this.createStageRecord('light', currentTime, transitionLight));
            currentTime = new Date(currentTime.getTime() + transitionLight * 60 * 1000);

            // REM sleep (more in second half)
            const remDuration = isFirstHalf ? 10 + Math.random() * 10 : 20 + Math.random() * 20;
            stages.push(this.createStageRecord('rem', currentTime, remDuration));
            currentTime = new Date(currentTime.getTime() + remDuration * 60 * 1000);

            // Brief awakening between cycles
            if (Math.random() > 0.6 && cycle < numCycles - 1) {
                const awakeDuration = 2 + Math.random() * 5;
                stages.push(this.createStageRecord('awake', currentTime, awakeDuration));
                currentTime = new Date(currentTime.getTime() + awakeDuration * 60 * 1000);
            }
        }

        return stages;
    }

    private createStageRecord(
        stage: 'light' | 'deep' | 'rem' | 'awake',
        startTime: Date, durationMinutes: number
    ): SleepStageRecord {
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
        return {
            stage,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationMinutes: Math.round(durationMinutes),
        };
    }

    private generateHeartRateRecord(stressLevel: 'low' | 'moderate' | 'high', timeMultiplier: number): HeartRateRecord {
        const baseResting = {
            low: 62,
            moderate: 72,
            high: 82,
        }[stressLevel];

        const resting = this.addVariation(baseResting * timeMultiplier, 3);
        const average = resting + this.addVariation(10, 5);

        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        return {
            restingBpm: Math.max(45, Math.min(100, Math.round(resting))),
            averageBpm: Math.max(55, Math.min(110, Math.round(average))),
            minBpm: Math.max(40, Math.round(resting - 8)),
            maxBpm: Math.min(180, Math.round(average + 40 + Math.random() * 30)),
            startTime: startOfDay.toISOString(),
            endTime: now.toISOString(),
            source: this.mockSource,
        };
    }

    private generateHrvRecord(
        stressLevel: 'low' | 'moderate' | 'high',
        weekdayMultiplier: number
    ): HrvRecord {
        const baseHrv = {
            low: 70,
            moderate: 50,
            high: 30,
        }[stressLevel];

        const hrv = this.addVariation(baseHrv * weekdayMultiplier, 8);

        const measureTime = new Date();
        measureTime.setHours(7, 30, 0, 0);

        return {
            interval: Math.max(15, Math.min(100, Math.round(hrv))),
            shortTermHrv: Math.max(10, Math.min(90, Math.round(hrv * 0.85))),
            timestamp: measureTime.toISOString(),
            source: this.mockSource,
        };
    }

    private generateActivityRecord(
        stressLevel: 'low' | 'moderate' | 'high',
        date: string, weekdayMultiplier: number
    ): ActivityRecord {
        const baseSteps = {
            low: 9000,
            moderate: 5500,
            high: 2500,
        }[stressLevel];

        const steps = Math.round(this.addVariation(baseSteps * weekdayMultiplier, 1000));
        const activeMinutes = Math.round(steps * 0.003 + this.addVariation(0, 10));
        const activeCalories = Math.round(steps * 0.04 + activeMinutes * 5);
        const basalCalories = 1600 + Math.round(Math.random() * 400);

        return {
            steps: Math.max(0, steps),
            activeCalories,
            basalCalories,
            totalCalories: activeCalories + basalCalories,
            activeMinutes: Math.max(0, Math.min(180, activeMinutes)),
            distanceMeters: Math.round(steps * 0.75),
            date,
            source: this.mockSource,
        };
    }

    private getWeekdayMultiplier(dayOfWeek: number): number {
        const multipliers: Record<number, number> = {
            0: 1.05, // Sunday
            1: 0.85, // Monday (worst)
            2: 0.90, // Tuesday
            3: 0.95, // Wednesday
            4: 1.00, // Thursday
            5: 1.10, // Friday (best)
            6: 1.08, // Saturday
        };
        return multipliers[dayOfWeek] || 1.0;
    }

    private getTimeMultiplier(hourOfDay: number): number {
        if (hourOfDay >= 6 && hourOfDay < 12) return 0.95;  // Morning
        if (hourOfDay >= 12 && hourOfDay < 18) return 1.00; // Afternoon
        if (hourOfDay >= 18 && hourOfDay < 22) return 1.08; // Evening
        return 1.05; // Night
    }

    private addVariation(base: number, maxVariation: number): number {
        return base + (Math.random() - 0.5) * 2 * maxVariation;
    }
}
// Singleton Instance - Only one existing instance of MockHealthDataService
export const healthDataService = new MockHealthDataService();
