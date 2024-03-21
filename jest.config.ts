import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig.json');
import type { JestConfigWithTsJest } from 'ts-jest';
const paths = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: '<rootDir>/',
});

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', '<rootDir>'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',

  roots: ['<rootDir>'],
  modulePaths: compilerOptions.baseUrl,
  moduleNameMapper: paths,
};

export default jestConfig;

// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
};
