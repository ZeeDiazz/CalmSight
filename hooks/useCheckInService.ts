import {ICheckInService, mockCheckInService} from "@/utils/mockCheckInService";

type CheckInServiceMode = 'mock' | 'local' | 'supabase';

const CURRENT_MODE: CheckInServiceMode = 'local'; //change between the modes


let _localCheckInService: ICheckInService | null = null;

const getLocalService = (): ICheckInService => {
    if (!_localCheckInService) {
        const { localCheckInService } = require('@/utils/localCheckInService');
        _localCheckInService = localCheckInService;
    }
    return _localCheckInService!;
};

/**
 * 'mock': Demo data
 * 'local':AsyncStorage
 * 'supabase': for Future implementation
 */
export const getCheckInService = (): ICheckInService => {
    switch (CURRENT_MODE) {
        case 'local':
            return getLocalService();
       /* case 'supabase':
            // TODO: Future - return SupabaseCheckInService when implemented
            // return supabaseCheckInService;
            */
        default:
            return mockCheckInService;
    }
};
export const getCheckInServiceMode = (): CheckInServiceMode => CURRENT_MODE;
