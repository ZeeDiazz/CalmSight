import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isLoggedIn: boolean;
    hasCompletedOnboarding: boolean;
    isLoading: boolean;
    setLoggedIn: (value: boolean) => Promise<void>;
    setOnboardingComplete: (value: boolean) => Promise<void>;
    resetAuth: () => Promise<void>; // For testing
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAuthState();
    }, []);

    const loadAuthState = async () => {
        try {
            const [loggedIn, onboarded] = await Promise.all([
                AsyncStorage.getItem('isLoggedIn'),
                AsyncStorage.getItem('hasCompletedOnboarding'),
            ]);
            setIsLoggedIn(loggedIn === 'true');
            setHasCompletedOnboarding(onboarded === 'true');
        } catch (error) {
            console.error('Error loading auth state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setLoggedIn = async (value: boolean) => {
        await AsyncStorage.setItem('isLoggedIn', value.toString());
        setIsLoggedIn(value);
    };

    const setOnboardingComplete = async (value: boolean) => {
        await AsyncStorage.setItem('hasCompletedOnboarding', value.toString());
        setHasCompletedOnboarding(value);
    };

    const resetAuth = async () => {
        await AsyncStorage.multiRemove(['isLoggedIn', 'hasCompletedOnboarding']);
        setIsLoggedIn(false);
        setHasCompletedOnboarding(false);
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            hasCompletedOnboarding,
            isLoading,
            setLoggedIn,
            setOnboardingComplete,
            resetAuth,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};