module.exports = {
    preset: 'jest-expo',
    testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
    transformIgnorePatterns: [
        'node_modules/(?!(jest-expo|@expo|expo|react-native|@react-native|expo-modules-core)/)',
    ],
};
