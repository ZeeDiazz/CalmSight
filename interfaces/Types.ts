export interface CheckInData {
    type: 'daily' | 'weekly';
    mood: string | null;
    worryTime: string | null;
    threatMonitoring: string | null;
    jobDemand: Record<string, string> | null;
    coping: Record<string, string> | null;
    symptoms: { symptoms: string[]; notes: string;} | null;
}

export interface HealthData {
    date: string;

    sleep: SleepSession | null;
    heartRate: HeartRateRecord | null;
    hrv: HrvRecord | null;
    activity: ActivityRecord | null;

    sources: HealthDataSourceInfo[];
    lastUpdated: string;
    dataCompleteness: 'complete' | 'partial' | 'minimal';
}

export interface IHealthDataService {
    isAvailable(): Promise<boolean>;
    requestPermissions(): Promise<boolean>;
    getPermissionStatus(): Promise<PermissionStatus>;

    getLatestHealthData(): Promise<HealthData>;
    getHealthDataForDate(date: string): Promise<HealthData>;
    getHealthDataRange(startDate: string, endDate: string): Promise<HealthData[]>;

    getLatestSleep(): Promise<SleepSession | null>;
    getLatestHeartRate(): Promise<HeartRateRecord | null>;
    getLatestHrv(): Promise<HrvRecord | null>;
    getTodayActivity(): Promise<ActivityRecord | null>;
}

export type PermissionStatus = {
    sleep: 'granted' | 'denied' | 'not_determined';
    heartRate: 'granted' | 'denied' | 'not_determined';
    hrv: 'granted' | 'denied' | 'not_determined';
    steps: 'granted' | 'denied' | 'not_determined';
    activity: 'granted' | 'denied' | 'not_determined';
};


export type HealthDataSource =
    | 'apple_health'    // Apple
    | 'health_connect' // Android
    | 'garmin'
    | 'mock';           // For development

export interface HealthDataSourceInfo {
    type: HealthDataSource;
    name: string;
    bundleId?: string;
    lastSyncTime?: string;
}


export type SleepStage = 'unknown' | 'awake' | 'light' | 'asleepCore' | 'deep' | 'rem' | 'inBed' | 'outOfBed';

export interface SleepStageRecord {
    stage: SleepStage;
    startTime: string;
    endTime: string;
    durationMinutes: number;
}

export interface SleepSession {
    startTime: string;
    endTime: string;
    stages: SleepStageRecord[];

    // Aggregated values
    totalDurationHours: number;
    timeAsleepHours: number;
    timeAwakeMinutes: number;
    deepSleepMinutes: number;
    lightSleepMinutes: number;
    remSleepMinutes: number;

    // Quality metrics
    sleepEfficiency: number;

    source: HealthDataSource;
}


/*Heart Rate and HRV*/
export interface HeartRateSample {
    bpm: number;
    timestamp: string;
}

export interface HeartRateRecord {
    startTime: string;
    endTime: string;

    restingBpm: number;
    averageBpm: number;
    minBpm: number;
    maxBpm: number;

    samples?: HeartRateSample[];

    source: HealthDataSource;
}

export interface HrvRecord {
    timestamp: string;
    interval: number; // Standard deviation of NN intervals (ms)
    shortTermHrv?: number; // RMSSD-based
    source: HealthDataSource;
}


/*Activity*/
export interface ActivityRecord {
    steps: number;
    distanceMeters?: number;
    activeMinutes: number;

    activeCalories: number;
    basalCalories: number;
    totalCalories: number;

    date: string;
    source: HealthDataSource;
}