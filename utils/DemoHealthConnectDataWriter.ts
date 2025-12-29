import { insertRecords, requestPermission, Permission } from 'react-native-health-connect';

interface TestDataOptions {
    daysBack?: number;
    stressLevel?: 'low' | 'moderate' | 'high';
}

export class DemoHealthConnectDataWriter {
    static async requestWritePermissions(): Promise<boolean> {
        try {
            console.log(' Requesting WRITE permissions for Health Connect...');

            const permissions: Permission[] = [
                { accessType: 'write', recordType: 'SleepSession' },
                { accessType: 'write', recordType: 'HeartRate' },
                { accessType: 'write', recordType: 'HeartRateVariabilityRmssd' },
                { accessType: 'write', recordType: 'Steps' },
                { accessType: 'write', recordType: 'ActiveCaloriesBurned' },
                { accessType: 'write', recordType: 'TotalCaloriesBurned' },
            ];

            const grantedPermissions = await requestPermission(permissions);
            const allGranted = grantedPermissions.length === permissions.length;

            if (allGranted) {
                console.log('All WRITE permissions granted!');
            } else {
                console.log('Partial permissions granted:', grantedPermissions.length, '/', permissions.length);
            }

            return grantedPermissions.length > 0;
        } catch (error) {
            console.error('Error requesting write permissions:', error);
            return false;
        }
    }

    static async writeTestDataToHealthConnect(options: TestDataOptions = {}): Promise<boolean> {
        const { daysBack = 7, stressLevel = 'moderate' } = options;

        try {
            const hasPermissions = await this.requestWritePermissions();
            if (!hasPermissions) {
                console.error('Write permissions not granted. Cannot write test data.');
                return false;
            }

            console.log('Starting to write test data to Health Connect...');

            // Write data for each day
            for (let i = 0; i < daysBack; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                console.log(`Writing data for: ${date.toISOString().split('T')[0]}`);

                const dayOfWeek = date.getDay();
                const dayStressLevel = this.getDayStressLevel(dayOfWeek, stressLevel);

                const isToday = i === 0;

                await this.writeSleepData(date, dayStressLevel);
                await this.writeHeartRateData(date, dayStressLevel, isToday);
                await this.writeHRVData(date, dayStressLevel, isToday);
                await this.writeStepsData(date, dayStressLevel, isToday);
                await this.writeCaloriesData(date, dayStressLevel, isToday);

                console.log(`Completed day ${i + 1}/${daysBack}`);
            }

            console.log('Successfully wrote all test data to Health Connect!');
            return true;
        } catch (error) {
            console.error('Error writing test data:', error);
            return false;
        }
    }

    private static async writeSleepData(date: Date, stressLevel: 'low' | 'moderate' | 'high') {
        try {
            // Sleep
            const sleepParams = {
                low: { duration: 8.2, deepSleep: 95, quality: 85 },
                moderate: { duration: 6.5, deepSleep: 55, quality: 65 },
                high: { duration: 5.0, deepSleep: 25, quality: 40 },
            }[stressLevel];

            const sleepStart = new Date(date);
            sleepStart.setDate(sleepStart.getDate() - 1);
            sleepStart.setHours(22, 0, 0, 0);

            const sleepEnd = new Date(sleepStart);
            sleepEnd.setHours(sleepEnd.getHours() + sleepParams.duration);

            const totalMinutes = sleepParams.duration * 60;
            const awakeMinutes = totalMinutes * (1 - sleepParams.quality / 100);
            const deepMinutes = sleepParams.deepSleep;
            const remMinutes = totalMinutes * 0.20; // 20% REM
            const lightMinutes = totalMinutes - awakeMinutes - deepMinutes - remMinutes;

            const sleepStages = [];
            let currentTime = new Date(sleepStart);

            sleepStages.push({
                stage: 2,
                startTime: currentTime.toISOString(),
                endTime: new Date(currentTime.getTime() + lightMinutes * 0.3 * 60000).toISOString(),
            });
            currentTime = new Date(currentTime.getTime() + lightMinutes * 0.3 * 60000);
            sleepStages.push({
                stage: 6,
                startTime: currentTime.toISOString(),
                endTime: new Date(currentTime.getTime() + deepMinutes * 60000).toISOString(),
            });
            currentTime = new Date(currentTime.getTime() + deepMinutes * 60000);

            sleepStages.push({
                stage: 7,
                startTime: currentTime.toISOString(),
                endTime: new Date(currentTime.getTime() + remMinutes * 60000).toISOString(),
            });
            currentTime = new Date(currentTime.getTime() + remMinutes * 60000);
            sleepStages.push({
                stage: 2,
                startTime: currentTime.toISOString(),
                endTime: new Date(currentTime.getTime() + lightMinutes * 0.7 * 60000).toISOString(),
            });

            const sleepRecord = {
                recordType: 'SleepSession' as const,
                startTime: sleepStart.toISOString(),
                endTime: sleepEnd.toISOString(),
                stages: sleepStages,
            };

            await insertRecords([sleepRecord]);
            console.log('Sleep data written');
        } catch (error) {
            console.error('Error writing sleep data:', error);
        }
    }

    private static async writeHeartRateData(date: Date, stressLevel: 'low' | 'moderate' | 'high', isToday: boolean = false) {
        try {
            const restingHR = {low: 62, moderate: 75, high: 88} [stressLevel];

            const now = new Date();
            const currentHour = now.getHours();

            for (let hour = 6; hour <= 22; hour += 2) {
                // Skip future hours if today
                if (isToday && hour >= currentHour) {
                    continue;
                }

                const startTime = new Date(date);
                startTime.setHours(hour, 0, 0, 0);

                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + 1);

                const hourVariation = hour >= 9 && hour <= 17 ? 10 : 0;
                const randomVariation = Math.floor(Math.random() * 8) - 4;
                const bpm = restingHR + hourVariation + randomVariation;

                const hrRecord = {
                    recordType: 'HeartRate' as const,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    samples: [{ time: startTime.toISOString(), beatsPerMinute: bpm }],
                };

                await insertRecords([hrRecord]);
            }

            console.log('Heart rate data written');
        } catch (error) {
            console.error('Error writing heart rate data:', error);
        }
    }

    private static async writeHRVData(date: Date, stressLevel: 'low' | 'moderate' | 'high', isToday: boolean = false) {
        try {
            const now = new Date();

            // skip if it's before 6 AM today
            if (isToday && now.getHours() < 6) {
                console.log('Skipping HRV (6 AM hasn\'t passed yet)');
                return;
            }

            const hrvValue = {low: 72, moderate: 50, high: 28,}[stressLevel];

            const variation = Math.floor(Math.random() * 10) - 5;
            const finalHrv = hrvValue + variation;

            const timestamp = new Date(date);
            timestamp.setHours(6, 0, 0, 0);

            const hrvRecord = {
                recordType: 'HeartRateVariabilityRmssd' as const,
                time: timestamp.toISOString(),
                heartRateVariabilityMillis: finalHrv,
            };

            await insertRecords([hrvRecord]);
            console.log('HRV data written');
        } catch (error) {
            console.error('Error writing HRV data:', error);
        }
    }

    private static async writeStepsData(date: Date, stressLevel: 'low' | 'moderate' | 'high', isToday: boolean = false) {
        try {
            const totalSteps = {low: 9500, moderate: 5500, high: 2500,}[stressLevel];

            const now = new Date();
            const currentHour = now.getHours();

            const hourlySteps = [
                { hour: 7, percentage: 0.05 },
                { hour: 9, percentage: 0.10 },
                { hour: 11, percentage: 0.15 },
                { hour: 13, percentage: 0.20 },
                { hour: 15, percentage: 0.15 },
                { hour: 17, percentage: 0.10 },
                { hour: 19, percentage: 0.15 },
                { hour: 21, percentage: 0.10 },
            ];

            for (const slot of hourlySteps) {
                // Skip future hours for today
                if (isToday && slot.hour >= currentHour) {
                    continue;
                }

                const startTime = new Date(date);
                startTime.setHours(slot.hour, 0, 0, 0);

                const endTime = new Date(startTime);
                endTime.setHours(endTime.getHours() + 1);

                const steps = Math.floor(totalSteps * slot.percentage);

                const stepsRecord = {
                    recordType: 'Steps' as const,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    count: steps,
                };

                await insertRecords([stepsRecord]);
            }

            console.log('Steps data written');
        } catch (error) {
            console.error('Error writing steps data:', error);
        }
    }

    private static async writeCaloriesData(date: Date, stressLevel: 'low' | 'moderate' | 'high', isToday: boolean = false) {
        try {
            const now = new Date();

            const hoursElapsed = isToday ? now.getHours() : 24;
            const dayFraction = hoursElapsed / 24;

            const activeCalories = {low: 600, moderate: 400, high: 200,}[stressLevel];

            const basalCalories = 1800;

            const startTime = new Date(date);
            startTime.setHours(0, 0, 0, 0);

            const endTime = new Date(date);
            if (isToday) {
                // End time is now (minus 1 minute to be safe)
                endTime.setTime(now.getTime() - 60000);
            } else {
                endTime.setHours(23, 59, 59, 999);
            }

            // Scale calories by how much of the day has passed
            const scaledActiveCalories = Math.round(activeCalories * dayFraction);
            const scaledBasalCalories = Math.round(basalCalories * dayFraction);

            const activeCalRecord = {
                recordType: 'ActiveCaloriesBurned' as const,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                energy: {
                    value: scaledActiveCalories,
                    unit: 'kilocalories' as const,
                },
            };

            const totalCalRecord = {
                recordType: 'TotalCaloriesBurned' as const,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                energy: {
                    value: scaledBasalCalories + scaledActiveCalories,
                    unit: 'kilocalories' as const,
                },
            };

            await insertRecords([activeCalRecord]);
            await insertRecords([totalCalRecord]);

            console.log('Calories data written');
        } catch (error) {
            console.error('Error writing calories data:', error);
        }
    }

    private static getDayStressLevel(dayOfWeek: number, baseLevel: 'low' | 'moderate' | 'high'): 'low' | 'moderate' | 'high' {

        if (baseLevel === 'low') {
            return dayOfWeek === 1 ? 'moderate' : 'low';
        }

        if (baseLevel === 'moderate') {
            if (dayOfWeek === 1) return 'high';      // Monday
            if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) return 'low';
            return 'moderate';
        }

        if (baseLevel === 'high') {
            if (dayOfWeek === 6 || dayOfWeek === 0) return 'moderate';
            return 'high';
        }

        return baseLevel;
    }
}