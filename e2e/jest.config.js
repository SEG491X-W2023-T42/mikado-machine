module.exports = {
    collectCoverage: false,
    errorOnDeprecated: true,
    maxWorkers: 1,
    projects: [
        {
            displayName: 'e2e',
            preset: 'jest-puppeteer',
            testMatch: ['<rootDir>/e2e/**/*.spec.js'],
        },
    ],
    resetModules: true,
    testTimeout: 60000,
    verbose: true,
    watchman: false,
};
