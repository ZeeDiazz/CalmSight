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

type HealthServiceStatus = 'loading' | 'available' | 'unavailable' | 'mock';

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

export const useHealthService = (): UseHealthServiceResult => {
    const [status, setStatus] = useState<HealthServiceStatus>('loading');
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeService, setActiveService] = useState<IHealthDataService>(mockHealthDataService);

    useEffect(() => {
        initializeHealthService();
    }, []);

    const initializeHealthService = async () => {
        setError(null);

        // Non-Android platforms always use mock, TODO: change logic after HealthKit Implementation
        if (Platform.OS !== 'android') {
           setActiveService(mockHealthDataService);
            setStatus('mock');
            setPermissionsGranted(true); // Mock always "has permission"
            return;
        }

        // Android without Health Connect service loaded
        if (!androidHealthDataService) {
            console.log('Health Service: Health Connect module not loaded');
            //setActiveService(mockHealthDataService);
            setPermissionsGranted(false);
            setStatus('unavailable');
            return;
        }

        try {
            const available = await androidHealthDataService.isAvailable();
            console.log('Health Connect isAvailable():', available);

            if (!available) {
                console.log('Health Service: Health Connect not available on device');
                setPermissionsGranted(false);
                //setActiveService(mockHealthDataService);
                setError('Health Connect is not installed on this device');
                setStatus('unavailable');
                return;
            }

            const hasPermissions = await checkExistingPermissions();
            console.log('Health Service: hasPermissions =', hasPermissions);

            if(hasPermissions){
                setActiveService(androidHealthDataService);
                setPermissionsGranted(hasPermissions); //or true
            } else {
                console.log('Health Service: No permissions, using mock data');
                //setActiveService(mockHealthDataService);
                setPermissionsGranted(false);
            }
            //setActiveService(hasPermissions ? androidHealthDataService : mockHealthDataService);

            setStatus('available');

        } catch (err) {
            setActiveService(mockHealthDataService);
            setPermissionsGranted(false);
            setError('Failed to initialize Health Connect');
            setStatus('unavailable');
            console.error('Health Service: Error during initialization', err);
        }
    };

    const checkExistingPermissions = async (): Promise<boolean> => {
        if (!androidHealthDataService) {
            return false;
        }

        try {
            const data = await androidHealthDataService.getLatestHealthData();
            console.log('Fetched data:', JSON.stringify({
                date: data.date,
                hasSleep: data.sleep !== null,
                hasHeartRate: data.heartRate !== null,
                hasHrv: data.hrv !== null,
                hasActivity: data.activity !== null,
                sources: data.sources,
                dataCompleteness: data.dataCompleteness,
            }, null, 2));

            const hasData = data.sleep !== null ||
                data.heartRate !== null ||
                data.hrv !== null ||
                data.activity !== null;

            // User might just not have any health data (my emulator)
            const hasAccess = hasData || data.sources.some(s => s.type === 'health_connect');

            console.log('Permission check - hasData:', hasData, 'hasAccess:', hasAccess);

            return hasAccess;
        } catch (err) {
            console.log('Health Service: Could not fetch data, error:', err);
            return false;
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
        if (status === 'mock' || status === 'unavailable') {
            setPermissionsGranted(true);
            return true;
        }

        if (!androidHealthDataService || Platform.OS !== 'android') {
            setPermissionsGranted(true);
            return false;
        }

        try {
            const granted = await androidHealthDataService.requestPermissions();

            if (granted) {
                setActiveService(androidHealthDataService);
                setPermissionsGranted(true);
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
            return await mockHealthDataService.getLatestHealthData();
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
            service: mockHealthDataService,
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
        service: mockHealthDataService,
        isRealData: false,
    };
};