module.exports = {
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  moduleFileExtensions: [
    'js',
    'ts',
    'json'
  ],
  testMatch: [
    '**/*.test.(ts|js)',
    '**/*.spec.(ts|js)'
  ],
  testEnvironment: 'node',
  modulePathIgnorePatterns: ["./dist/"],
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  coverageDirectory: "../coverage",
}