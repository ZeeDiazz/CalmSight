import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckInData } from "@/interfaces/Types";
import { StressCalculation } from "@/interfaces/StressTypesProps";
import { ICheckInService } from "@/utils/mockCheckInService";

const STORAGE_KEYS = {
    CHECK_INS: 'calmsight_checkins',
    STRESS_SCORES: 'calmsight_stress_scores',
} as const;

interface CheckInStorage {
    [date: string]: CheckInData;
}

interface StressScoreStorage {
    [date: string]: StressCalculation;
}

/* Stores check-in data and calculated stress scores locally on the device.
* */
export class LocalCheckInService implements ICheckInService {
    async saveCheckIn(data: CheckInData): Promise<void> {
        try {
            const date = new Date().toISOString().split('T')[0];
            const existing = await this.getAllCheckIns();
            existing[date] = data;
            await AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(existing));
            console.log('LocalCheckInService: Saved check-in for', date);
        } catch (error) {
            console.error('LocalCheckInService: Error saving check-in', error);
            throw error;
        }
    }
    async saveCheckInForDate(date: string, data: CheckInData): Promise<void> {
        try {
            const existing = await this.getAllCheckIns();
            existing[date] = data;
            await AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(existing));
            console.log('LocalCheckInService: Saved check-in for', date);
        } catch (error) {
            console.error('LocalCheckInService: Error saving check-in', error);
            throw error;
        }
    }

    async getCheckInForDate(date: string): Promise<CheckInData | null> {
        try {
            const all = await this.getAllCheckIns();
            return all[date] || null;
        } catch (error) {
            console.error('LocalCheckInService: Error getting check-in', error);
            return null;
        }
    }

    async getCheckInsForDateRange(startDate: string, endDate: string): Promise<CheckInData[]> {
        try {
            const all = await this.getAllCheckIns();
            const checkIns: CheckInData[] = [];

            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                if (all[dateStr]) {
                    checkIns.push(all[dateStr]);
                }
            }

            return checkIns;
        } catch (error) {
            console.error('LocalCheckInService: Error getting check-ins for range', error);
            return [];
        }
    }

    async getLatestCheckIn(): Promise<CheckInData | null> {
        try {
            const all = await this.getAllCheckIns();
            const dates = Object.keys(all).sort().reverse();

            if (dates.length === 0) return null;
            return all[dates[0]];
        } catch (error) {
            console.error('LocalCheckInService: Error getting latest check-in', error);
            return null;
        }
    }

    async deleteCheckIn(date: string): Promise<boolean> {
        try {
            const existing = await this.getAllCheckIns();

            if (!existing[date]) return false;

            delete existing[date];
            await AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(existing));
            console.log('LocalCheckInService: Deleted check-in for', date);
            return true;
        } catch (error) {
            console.error('LocalCheckInService: Error deleting check-in', error);
            return false;
        }
    }

    async hasCheckedInToday(): Promise<boolean> {
        const today = new Date().toISOString().split('T')[0];
        const checkIn = await this.getCheckInForDate(today);
        return checkIn !== null;
    }

    async getAllCheckIns(): Promise<CheckInStorage> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECK_INS);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('LocalCheckInService: Error reading check-ins', error);
            return {};
        }
    }

    async getCheckInCount(): Promise<number> {
        const all = await this.getAllCheckIns();
        return Object.keys(all).length;
    }

    async saveStressScore(date: string, score: StressCalculation): Promise<void> {
        try {
            const existing = await this.getAllStressScores();
            existing[date] = score;
            await AsyncStorage.setItem(STORAGE_KEYS.STRESS_SCORES, JSON.stringify(existing));
        } catch (error) {
            console.error('LocalCheckInService: Error saving stress score', error);
            throw error;
        }
    }

    async getStressScoreForDate(date: string): Promise<StressCalculation | null> {
        try {
            const all = await this.getAllStressScores();
            return all[date] || null;
        } catch (error) {
            console.error('LocalCheckInService: Error getting stress score', error);
            return null;
        }
    }

    async getStressScoresForDateRange(startDate: string, endDate: string): Promise<Record<string, StressCalculation>> {
        try {
            const all = await this.getAllStressScores();
            const scores: Record<string, StressCalculation> = {};

            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                if (all[dateStr]) {
                    scores[dateStr] = all[dateStr];
                }
            }

            return scores;
        } catch (error) {
            console.error('LocalCheckInService: Error getting stress scores for range', error);
            return {};
        }
    }

    async getAllStressScores(): Promise<StressScoreStorage> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.STRESS_SCORES);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('LocalCheckInService: Error reading stress scores', error);
            return {};
        }
    }

    async clearAllData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.CHECK_INS,
                STORAGE_KEYS.STRESS_SCORES,
            ]);
            console.log('LocalCheckInService: Cleared all data');
        } catch (error) {
            console.error('LocalCheckInService: Error clearing data', error);
            throw error;
        }
    }

    async exportAllData(): Promise<{ checkIns: CheckInStorage; stressScores: StressScoreStorage }> {
        const checkIns = await this.getAllCheckIns();
        const stressScores = await this.getAllStressScores();
        return { checkIns, stressScores };
    }

    async importData(data: { checkIns?: CheckInStorage; stressScores?: StressScoreStorage }): Promise<void> {
        try {
            if (data.checkIns) {
                await AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(data.checkIns));
            }
            if (data.stressScores) {
                await AsyncStorage.setItem(STORAGE_KEYS.STRESS_SCORES, JSON.stringify(data.stressScores));
            }
            console.log('LocalCheckInService: Imported data successfully');
        } catch (error) {
            console.error('LocalCheckInService: Error importing data', error);
            throw error;
        }
    }

    async getStorageInfo(): Promise<{ checkInsCount: number; stressScoresCount: number; dates: string[] }> {
        const checkIns = await this.getAllCheckIns();
        const stressScores = await this.getAllStressScores();

        return {
            checkInsCount: Object.keys(checkIns).length,
            stressScoresCount: Object.keys(stressScores).length,
            dates: Object.keys(checkIns).sort(),
        };
    }
}

// Singleton instance
export const localCheckInService = new LocalCheckInService();