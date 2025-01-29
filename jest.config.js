module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["./src/tests/setup.js"],
    testTimeout: 30000,
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/tests/"
    ],
    moduleDirectories: ["node_modules", "src"]
};