import {initialize, requestPermission, readRecords, getSdkStatus, SdkAvailabilityStatus, Permission,} from 'react-native-health-connect';
import {IHealthDataService, HealthData, SleepSession, SleepStageRecord, HeartRateRecord, HrvRecord, ActivityRecord, PermissionStatus, SleepStage,} from '@/interfaces/Types';
//Followed this guide for implementation: https://github.com/Haider-Mukhtar/ReactNative-Health-Connect

//Tracking sleep after kl.20 (8pm)
const SLEEP_TRACKING_START_HOUR = 20;

// Used to estimate active minutes from step count (100 steps/min).
const STEPS_PER_ACTIVE_MINUTE = 100;

const AVERAGE_STRIDE_LENGTH_METERS = 0.75;
//Limits memory usage while maintaining useful data.
const MAX_HEART_RATE_SAMPLES = 50;

interface HealthDataCache {
    data: HealthData;
    timestamp: number;
    date: string;
}

class AndroidHealthDataService implements IHealthDataService {
    private initialized = false;

    private cache: HealthDataCache | null = null;
    private readonly CACHE_TTL_MS = 5 * 60 * 1000;

    async isAvailable(): Promise<boolean> {
        try {
            const status = await getSdkStatus();
            const isAvailable = status === SdkAvailabilityStatus.SDK_AVAILABLE;
            console.log('isAvailable result:', isAvailable);
            return isAvailable;
        } catch (error) {
            console.error('Error checking Health Connect availability:', error);
            return false;
        }
    }

    private async ensureInitialized(): Promise<boolean> {
        if (this.initialized) return true;

        try {
            const available = await this.isAvailable();
            if (!available) {
                console.warn('Health Connect is not available on this device');
                return false;
            }

            await initialize();
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize Health Connect:', error);
            return false;
        }
    }

    async requestPermissions(): Promise<boolean> {
        try {
            const initialized = await this.ensureInitialized();
            if (!initialized) return false;

            // Define permissions
            const permissions: Permission[] = [
                { accessType: 'read', recordType: 'SleepSession' },
                { accessType: 'read', recordType: 'HeartRate' },
                { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
                { accessType: 'read', recordType: 'Steps' },
                { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
                { accessType: 'read', recordType: 'TotalCaloriesBurned' },
            ];

            const grantedPermissions = await requestPermission(permissions);
            const allGranted = grantedPermissions.length === permissions.length;
            const someGranted = grantedPermissions.length > 0;

            console.log(`Health Connect permissions: ${grantedPermissions.length}/${permissions.length} granted`);

            if (allGranted) {
                console.log('All permissions granted');
            } else if (someGranted) {
                console.log('Partial permissions granted:', grantedPermissions.map(p => p.recordType));
            }
            this.cache = null;

            return someGranted;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    }


    async getPermissionStatus(): Promise<PermissionStatus> {
        return {
            sleep: 'not_determined',
            heartRate: 'not_determined',
            hrv: 'not_determined',
            steps: 'not_determined',
            activity: 'not_determined',
        };
    }

    private isCacheValid(date: string): boolean {
        if (!this.cache) return false;
        if (this.cache.date !== date) return false;

        const now = Date.now();
        const age = now - this.cache.timestamp;
        return age < this.CACHE_TTL_MS;
    }

    async getLatestHealthData(): Promise<HealthData> {
        const today = new Date().toISOString().split('T')[0];
        return this.getHealthDataForDate(today);
    }

    async getHealthDataForDate(date: string): Promise<HealthData> {

        if (this.isCacheValid(date)) {
            console.log('Returning cached health data for:', date);
            return this.cache!.data;
        }

        const initialized = await this.ensureInitialized();

        if (!initialized) {
            return this.createEmptyHealthData(date);
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const sleepStart = new Date(startOfDay);
        sleepStart.setDate(sleepStart.getDate() - 1);
        sleepStart.setHours(SLEEP_TRACKING_START_HOUR, 0, 0, 0);

        try {
            const [sleep, heartRate, hrv, activity] = await Promise.all([
                this.fetchSleepData(sleepStart, endOfDay),
                this.fetchHeartRateData(startOfDay, endOfDay),
                this.fetchHrvData(startOfDay, endOfDay),
                this.fetchActivityData(startOfDay, endOfDay),
            ]);

            const dataCompleteness = this.calculateDataCompleteness(sleep, heartRate, hrv, activity);

            const healthData: HealthData = {date, sleep, heartRate, hrv, activity,
                sources: [{
                    type: 'health_connect',
                    name: 'Health Connect',
                    lastSyncTime: new Date().toISOString(),
                }],
                lastUpdated: new Date().toISOString(), dataCompleteness,
            };

            this.cache = {
                data: healthData,
                timestamp: Date.now(),
                date,
            };

            return healthData;
        } catch (error) {
            console.error('Error fetching health data:', error);
            return this.createEmptyHealthData(date);
        }
    }

    async getHealthDataRange(startDate: string, endDate: string): Promise<HealthData[]> {
        const data: HealthData[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayData = await this.getHealthDataForDate(dateStr);
            data.push(dayData);
        }
        return data;
    }

    async getLatestSleep(): Promise<SleepSession | null> {
        const today = new Date().toISOString().split('T')[0];

        // Use cache if valid
        if (this.isCacheValid(today)) {
            return this.cache!.data.sleep;
        }

        // Otherwise fetch sleep data directly
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const sleepStart = new Date(startOfDay);
        sleepStart.setDate(sleepStart.getDate() - 1);
        sleepStart.setHours(SLEEP_TRACKING_START_HOUR, 0, 0, 0);

        return this.fetchSleepData(sleepStart, endOfDay);
    }

    async getLatestHeartRate(): Promise<HeartRateRecord | null> {
        const today = new Date().toISOString().split('T')[0];

        if (this.isCacheValid(today)) {
            return this.cache!.data.heartRate;
        }

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        return this.fetchHeartRateData(startOfDay, endOfDay);
    }

    async getLatestHrv(): Promise<HrvRecord | null> {
        const today = new Date().toISOString().split('T')[0];

        if (this.isCacheValid(today)) {
            return this.cache!.data.hrv;
        }

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        return this.fetchHrvData(startOfDay, endOfDay);
    }

    async getTodayActivity(): Promise<ActivityRecord | null> {
        const today = new Date().toISOString().split('T')[0];

        if (this.isCacheValid(today)) {
            return this.cache!.data.activity;
        }

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        return this.fetchActivityData(startOfDay, endOfDay);
    }

    invalidateCache(): void {
        this.cache = null;
    }

    private async fetchSleepData(startTime: Date, endTime: Date): Promise<SleepSession | null> {
        try {
            const result = await readRecords('SleepSession', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                },
            });

            if (!result.records || result.records.length === 0) {
                return null;
            }

            // Get the most recent sleep session
            const session = result.records[result.records.length - 1] as any;

            // Map sleep stages
            const stages: SleepStageRecord[] = (session.stages || []).map((stage: any) => ({
                stage: this.mapSleepStage(stage.stage),
                startTime: stage.startTime,
                endTime: stage.endTime,
                durationMinutes: this.calculateDurationMinutes(stage.startTime, stage.endTime),
            }));

            // Calculate aggregated values
            const totalDurationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
            const totalDurationHours = totalDurationMs / (1000 * 60 * 60);

            const deepSleepMinutes = stages
                .filter(s => s.stage === 'deep')
                .reduce((sum, s) => sum + s.durationMinutes, 0);

            const lightSleepMinutes = stages
                .filter(s => s.stage === 'light' || s.stage === 'asleepCore')
                .reduce((sum, s) => sum + s.durationMinutes, 0);

            const remSleepMinutes = stages
                .filter(s => s.stage === 'rem')
                .reduce((sum, s) => sum + s.durationMinutes, 0);

            const awakeMinutes = stages
                .filter(s => s.stage === 'awake')
                .reduce((sum, s) => sum + s.durationMinutes, 0);

            const timeAsleepHours = (totalDurationHours * 60 - awakeMinutes) / 60;
            const sleepEfficiency = totalDurationHours > 0
                ? Math.round((timeAsleepHours / totalDurationHours) * 100)
                : 0;

            return {
                startTime: session.startTime,
                endTime: session.endTime,
                stages,
                totalDurationHours: Math.round(totalDurationHours * 10) / 10,
                timeAsleepHours: Math.round(timeAsleepHours * 10) / 10,
                timeAwakeMinutes: Math.round(awakeMinutes),
                deepSleepMinutes: Math.round(deepSleepMinutes),
                lightSleepMinutes: Math.round(lightSleepMinutes),
                remSleepMinutes: Math.round(remSleepMinutes),
                sleepEfficiency,
                source: 'health_connect',
            };
        } catch (error) {
            console.error('Error fetching sleep data:', error);
            return null;
        }
    }

    private async fetchHeartRateData(startTime: Date, endTime: Date): Promise<HeartRateRecord | null> {
        try {
            const result = await readRecords('HeartRate', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                },
            });

            if (!result.records || result.records.length === 0) {
                return null;
            }

            const allSamples: { bpm: number; timestamp: string }[] = [];

            result.records.forEach((record: any) => {
                if (record.samples) {
                    record.samples.forEach((sample: any) => {
                        allSamples.push({
                            bpm: sample.beatsPerMinute,
                            timestamp: sample.time,
                        });
                    });
                }
            });

            if (allSamples.length === 0) {
                return null;
            }

            const bpmValues = allSamples.map(s => s.bpm);
            const avgBpm = Math.round(bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length);
            const minBpm = Math.min(...bpmValues);
            const maxBpm = Math.max(...bpmValues);

            // Estimate resting HR (lowest 10% of readings)
            const sortedBpm = [...bpmValues].sort((a, b) => a - b);
            const restingCount = Math.max(1, Math.floor(sortedBpm.length * 0.1));
            const restingBpm = Math.round(
                sortedBpm.slice(0, restingCount).reduce((a, b) => a + b, 0) / restingCount
            );

            return {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                restingBpm,
                averageBpm: avgBpm,
                minBpm,
                maxBpm,
                samples: allSamples.slice(-MAX_HEART_RATE_SAMPLES),
                source: 'health_connect',
            };
        } catch (error) {
            console.error('Error fetching heart rate data:', error);
            return null;
        }
    }

    private async fetchHrvData(startTime: Date, endTime: Date): Promise<HrvRecord | null> {
        try {
            const result = await readRecords('HeartRateVariabilityRmssd', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                },
            });

            if (!result.records || result.records.length === 0) {
                return null;
            }

            const latestRecord = result.records[result.records.length - 1] as any;

            return {
                timestamp: latestRecord.time,
                interval: Math.round(latestRecord.heartRateVariabilityMillis),
                shortTermHrv: Math.round(latestRecord.heartRateVariabilityMillis * 0.85),
                source: 'health_connect',
            };
        } catch (error) {
            console.error('Error fetching HRV data:', error);
            return null;
        }
    }

    private async fetchActivityData(startTime: Date, endTime: Date): Promise<ActivityRecord | null> {
        try {
            const [stepsResult, activeCalResult, totalCalResult] = await Promise.all([
                readRecords('Steps', {
                    timeRangeFilter: {
                        operator: 'between',
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                    },
                }),
                readRecords('ActiveCaloriesBurned', {
                    timeRangeFilter: {
                        operator: 'between',
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                    },
                }),
                readRecords('TotalCaloriesBurned', {
                    timeRangeFilter: {
                        operator: 'between',
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                    },
                }),
            ]);

            const totalSteps = stepsResult.records?.reduce(
                (sum: number, record: any) => sum + (record.count || 0), 0
            ) || 0;

            const activeCalories = activeCalResult.records?.reduce(
                (sum: number, record: any) => sum + (record.energy?.inKilocalories || 0), 0
            ) || 0;

            const totalCalories = totalCalResult.records?.reduce(
                (sum: number, record: any) => sum + (record.energy?.inKilocalories || 0), 0
            ) || 0;

            // Estimate active minutes (100 steps per min)
            const activeMinutes = Math.round(totalSteps / STEPS_PER_ACTIVE_MINUTE);

            return {
                steps: totalSteps,
                distanceMeters: Math.round(totalSteps * AVERAGE_STRIDE_LENGTH_METERS),
                activeMinutes: Math.min(activeMinutes, 180),
                activeCalories: Math.round(activeCalories),
                basalCalories: Math.round(totalCalories - activeCalories),
                totalCalories: Math.round(totalCalories),
                date: startTime.toISOString().split('T')[0],
                source: 'health_connect',
            };
        } catch (error) {
            console.error('Error fetching activity data:', error);
            return null;
        }
    }

    /** To understand the mapping, see the link below
     * @see https://developer.android.com/health-and-fitness/health-connect/features/sleep-sessions
     */
    private mapSleepStage(stage: number | string): SleepStage {
        const stageMap: Record<number, SleepStage> = {
            0: 'unknown', // UNKNOWN
            1: 'awake',   // AWAKE
            2: 'light',   // SLEEPING
            3: 'awake',   // OUT_OF_BED
            4: 'awake',   // AWAKE_IN_BED
            5: 'light',   // LIGHT
            6: 'deep',    // DEEP
            7: 'rem',     // REM
        };

        if (typeof stage === 'number') {
            return stageMap[stage] || 'unknown';
        }

        const stringMap: Record<string, SleepStage> = {
            UNKNOWN: 'unknown',
            AWAKE: 'awake',
            AWAKE_IN_BED: 'awake',
            OUT_OF_BED: 'awake',
            SLEEPING: 'light',
            LIGHT: 'light',
            DEEP: 'deep',
            REM: 'rem',
        };

        return stringMap[stage] || 'unknown';
    }

    private calculateDurationMinutes(startTime: string, endTime: string): number {
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        return Math.round((end - start) / (1000 * 60));
    }

    private calculateDataCompleteness(
        sleep: SleepSession | null,
        heartRate: HeartRateRecord | null,
        hrv: HrvRecord | null,
        activity: ActivityRecord | null
    ): 'complete' | 'partial' | 'minimal' {
        const hasData = [sleep, heartRate, hrv, activity].filter(Boolean).length;

        if (hasData === 4) return 'complete';
        if (hasData >= 2) return 'partial';
        return 'minimal';
    }

    private createEmptyHealthData(date: string): HealthData {
        return {
            date,
            sleep: null,
            heartRate: null,
            hrv: null,
            activity: null,
            sources: [{
                type: 'health_connect',
                name: 'Health Connect',
                lastSyncTime: new Date().toISOString(),
            }],
            lastUpdated: new Date().toISOString(),
            dataCompleteness: 'minimal',
        };
    }
}

// Singleton instance
export const androidHealthDataService = new AndroidHealthDataService();