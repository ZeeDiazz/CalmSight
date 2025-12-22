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