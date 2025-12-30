import { Platform } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { IHealthDataService, HealthData } from '@/interfaces/Types';
import { mockHealthDataService } from '@/utils/mockHealthDataGenerator';
//Followed this guide for implementation: https://github.com/Haider-Mukhtar/ReactNative-Health-Connect

let androidHealthDataService: IHealthDataService | null = null;
if (Platform.OS === 'android') {
    try {
        console.log('Attempting to load androidHealthDataService...');
        const androidModule = require('@/utils/androidHealthDataService');
        androidHealthDataService = androidModule.androidHealthDataService;
        console.log('androidHealthDataService loaded successfully:', !!androidHealthDataService);
    } catch (error) {
        console.warn('Android Health Connect not available:', error);
    }
} else {
    console.log('Not Android, skipping Health Connect module load');
}

type HealthServiceStatus = 'loading' | 'available' | 'unavailable' | 'mock' | 'none';

interface UseHealthServiceResult {
    service: IHealthDataService;
    status: HealthServiceStatus;
    isRealData: boolean;
    permissionsGranted: boolean;
    requestPermissions: () => Promise<boolean>;
    checkAvailability: () => Promise<boolean>;
    getHealthData: () => Promise<HealthData>;
    error: string | null;
}

// Empty health service for Android without permissions
const createEmptyHealthService = (): IHealthDataService => ({
    isAvailable: async () => false,
    requestPermissions: async () => false,
    getPermissionStatus: async () => ({
        sleep: 'denied',
        heartRate: 'denied',
        hrv: 'denied',
        steps: 'denied',
        activity: 'denied',
    }),
    getLatestHealthData: async () => createEmptyHealthData(),
    getHealthDataForDate: async (date: string) => createEmptyHealthData(date),
    getHealthDataRange: async (startDate: string, endDate: string) => {
        const data: HealthData[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            data.push(createEmptyHealthData(dateStr));
        }
        return data;
    },
    getLatestSleep: async () => null,
    getLatestHeartRate: async () => null,
    getLatestHrv: async () => null,
    getTodayActivity: async () => null
});

const createEmptyHealthData = (date?: string): HealthData => ({
    date: date || new Date().toISOString().split('T')[0],
    sleep: null,
    heartRate: null,
    hrv: null,
    activity: null,
    sources: [],
    lastUpdated: new Date().toISOString(),
    dataCompleteness: 'minimal',
});

export const useHealthService = (): UseHealthServiceResult => {
    const [status, setStatus] = useState<HealthServiceStatus>('loading');
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeService, setActiveService] = useState<IHealthDataService>(
        Platform.OS === 'android' ? createEmptyHealthService() : mockHealthDataService
    );

    useEffect(() => {
        initializeHealthService();
    }, []);

    const initializeHealthService = async () => {
        setError(null);

        // Non-Android platforms use mock data (for iOS demo)
        if (Platform.OS !== 'android') {
            setActiveService(mockHealthDataService);
            setStatus('mock');
            setPermissionsGranted(true); // Mock always "has permission"
            console.log('Health Service: Using mock data for iOS');
            return;
        }

        // Android without Health Connect service loaded
        if (!androidHealthDataService) {
            console.log('Health Service: Health Connect module not loaded, using empty health service');
            setActiveService(createEmptyHealthService());
            setPermissionsGranted(false);
            setStatus('none');
            return;
        }

        try {
            const available = await androidHealthDataService.isAvailable();
            console.log('Health Connect isAvailable():', available);

            if (!available) {
                console.log('Health Service: Health Connect not available on device, using empty health service');
                setActiveService(createEmptyHealthService());
                setPermissionsGranted(false);
                setError('Health Connect is not installed on this device');
                setStatus('none');
                return;
            }

            const granted = await androidHealthDataService.requestPermissions();

            if (granted) {
                setActiveService(androidHealthDataService);
                setStatus('available');
                setPermissionsGranted(true);  // This enables isRealData
                console.log('Health Service: Permissions granted, switched to Health Connect');
            } else {
                setActiveService(createEmptyHealthService());
                setError('Health permissions were denied - stress scores will be based on check-ins only');
                setPermissionsGranted(false);
                setStatus('none');
                console.log('Health Service: Permissions denied, using empty health service');
            }

        } catch (err) {
            setActiveService(createEmptyHealthService());
            setPermissionsGranted(false);
            setError('Failed to initialize Health Connect');
            setStatus('none');
            console.error('Health Service: Error during initialization', err);
        }
    };

    const checkAvailability = useCallback(async (): Promise<boolean> => {
        if (Platform.OS !== 'android' || !androidHealthDataService) {
            return false;
        }
        try {
            return await androidHealthDataService.isAvailable();
        } catch {
            return false;
        }
    }, []);

    const requestPermissions = useCallback(async (): Promise<boolean> => {
        setError(null);

        // Mock service always returns true
        if (status === 'mock') {
            setPermissionsGranted(true);
            return true;
        }
        if (status === 'none' && androidHealthDataService) {
            try {
                const granted = await androidHealthDataService.requestPermissions();

                if (granted) {
                    setActiveService(androidHealthDataService);
                    setPermissionsGranted(true);
                    setStatus('available');
                    console.log('Health Service: Permissions granted, switched to Health Connect');
                    return true;
                } else {
                    setError('Some health permissions were denied');
                    setPermissionsGranted(false);
                    return false;
                }
            } catch (error) {
                setPermissionsGranted(false);
                setError('Failed to request health permissions');
                console.error('Health Service: Error requesting permissions', error);
                return false;
            }
        }

        if (!androidHealthDataService || Platform.OS !== 'android') {
            return false;
        }

        try {
            const granted = await androidHealthDataService.requestPermissions();

            if (granted) {
                setActiveService(androidHealthDataService);
                setPermissionsGranted(true);
                setStatus('available');
                console.log('Health Service: Permissions granted, switched to Health Connect');
            } else {
                setError('Some health permissions were denied');
                setPermissionsGranted(false);
            }

            return granted;
        } catch (error) {
            setPermissionsGranted(false);
            setError('Failed to request health permissions');
            console.error('Health Service: Error requesting permissions', error);
            return false;
        }
    }, [status]);

    const getHealthData = useCallback(async (): Promise<HealthData> => {
        try {
            return await activeService.getLatestHealthData();
        } catch (err) {
            console.error('Health Service: Error getting health data', err);
            return createEmptyHealthData();
        }
    }, [activeService]);

    // Determine if we're using real data
    const isRealData =
        Platform.OS === 'android'
        && status === 'available'
        && permissionsGranted
        && activeService === androidHealthDataService;

    return {
        service: activeService,
        status,
        isRealData,
        permissionsGranted,
        requestPermissions,
        checkAvailability,
        getHealthData,
        error,
    };
};

/**
 * Get the appropriate health service without hooks
 */
export const getHealthService = async (): Promise<{
    service: IHealthDataService;
    isRealData: boolean;
}> => {
    if (Platform.OS !== 'android' || !androidHealthDataService) {
        return {
            service: Platform.OS === 'android' ? createEmptyHealthService() : mockHealthDataService,
            isRealData: false,
        };
    }

    try {
        const available = await androidHealthDataService.isAvailable();
        if (available) {
            // Try to fetch data to verify permissions
            const data = await androidHealthDataService.getLatestHealthData();
            const hasAccess = data.sleep !== null || data.heartRate !== null ||
                data.hrv !== null || data.activity !== null;

            if (hasAccess) {
                return {
                    service: androidHealthDataService,
                    isRealData: true,
                };
            }
        }
    } catch (error) {
        console.error('Error getting health service:', error);
    }

    return {
        service: createEmptyHealthService(),
        isRealData: false,
    };
};