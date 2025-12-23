import {SleepSession} from "@/interfaces/Types";

/** Helper functions for UI
 * Calculate sleep quality score from sleep session
 * Based on research: optimal sleep has ~20-25% deep, ~20-25% REM
 * @returns Score from 0-100
 */
export function calculateSleepQuality(sleep: SleepSession): number {
    if (!sleep || sleep.totalDurationHours === 0) return 0;

    let score = 0;

    if (sleep.totalDurationHours >= 7 && sleep.totalDurationHours <= 9) {
        score += 40; //Best score between 7-8 hours
    } else if (sleep.totalDurationHours >= 6 && sleep.totalDurationHours < 7) {
        score += 30;
    } else if (sleep.totalDurationHours > 9 && sleep.totalDurationHours <= 10) {
        score += 30;
    } else if (sleep.totalDurationHours >= 5 && sleep.totalDurationHours < 6) {
        score += 20;
    } else {
        score += 10;
    }

    if (sleep.sleepEfficiency >= 85) {
        score += 30;
    } else if (sleep.sleepEfficiency >= 75) {
        score += 20;
    } else if (sleep.sleepEfficiency >= 65) {
        score += 10;
    }

    if (sleep.deepSleepMinutes >= 60 && sleep.deepSleepMinutes <= 120) {
        score += 15;
    } else if (sleep.deepSleepMinutes >= 45 && sleep.deepSleepMinutes < 60) {
        score += 10;
    } else if (sleep.deepSleepMinutes >= 30) {
        score += 5;
    }

    if (sleep.remSleepMinutes >= 90 && sleep.remSleepMinutes <= 120) {
        score += 15;
    } else if (sleep.remSleepMinutes >= 60 && sleep.remSleepMinutes < 90) {
        score += 10;
    } else if (sleep.remSleepMinutes >= 30) {
        score += 5;
    }

    return Math.min(100, score);
}

/*
* Helper methods
*/
export function formatSleepDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (m === 0) {
        return `${h}h`;
    }
    return `${h}h ${m}m`;
}

export function formatHeartRate(bpm: number): string {
    return `${Math.round(bpm)} bpm`;
}

export function formatHrv(ms: number): string {
    return `${Math.round(ms)} ms`;
}

export function formatSteps(steps: number): string {
    return steps.toLocaleString();
}

export function getSleepStagePercentage(stageMinutes: number, totalHours: number): number {
    if (totalHours === 0) return 0;
    const totalMinutes = totalHours * 60;
    return Math.round((stageMinutes / totalMinutes) * 100);
}

export function isSleepDurationHealthy(hours: number): boolean {
    return hours >= 7 && hours <= 9;
}

export function isHrvHealthy(hrvMs: number): boolean {
    return hrvMs >= 50;
}

export function isRestingHrHealthy(bpm: number): boolean {
    return bpm >= 50 && bpm <= 80;
}

export function meetsStepGoal(steps: number, goal: number = 10000): boolean {
    return steps >= goal;
}

//TODO: Add age, as these thresholds vary by age (NOT is scope)
export function getHrvStressLevel(hrvMs: number): 'low' | 'moderate' | 'high' {
    if (hrvMs >= 60) return 'low'; // Good recovery
    if (hrvMs >= 40) return 'moderate'; // Some stress
    return 'high'; // High stress / poor recovery
}