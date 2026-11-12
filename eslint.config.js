import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

const SOURCE_FILES = ['**/*.{ts,tsx}'];

const noPixi = { group: ['pixi.js', 'pixi.js/*'], message: 'Pixi belongs in src/engine.' };
const noReact = {
  group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
  message: 'React belongs in src/ui.',
};

const noLayer = (layer) => ({
  group: [`**/${layer}`, `**/${layer}/**`],
  message: `This layer must not depend on ${layer}.`,
});
const onlyBarrelOf = (layer) => ({
  group: [`**/${layer}`, `**/${layer}/**`, `!@/${layer}`],
  message: `Import ${layer} through its barrel: @/${layer}.`,
});
const relativeInside = (layer) => ({
  group: [`@/${layer}`, `@/${layer}/**`],
  message: 'Use relative imports inside a layer.',
});

const noTesting = { group: ['@/testing', '@/testing/**'], message: 'Test helpers are for tests.' };

const restrict = (patterns) => ({ 'no-restricted-imports': ['error', { patterns }] });

const boundary = (files, ...patterns) => [
  { files, ignores: ['**/*.test.{ts,tsx}'], rules: restrict([...patterns, noTesting]) },
  {
    files: files.map((glob) => glob.replace('*.{ts,tsx}', '*.test.{ts,tsx}')),
    rules: restrict(patterns),
  },
];

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: SOURCE_FILES,
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...boundary(
    ['src/shared/**/*.{ts,tsx}'],
    noPixi,
    noReact,
    noLayer('domain'),
    noLayer('app'),
    noLayer('engine'),
    noLayer('ui'),
  ),
  ...boundary(
    ['src/domain/**/*.{ts,tsx}'],
    noPixi,
    noReact,
    relativeInside('domain'),
    noLayer('app'),
    noLayer('engine'),
    noLayer('ui'),
  ),
  ...boundary(
    ['src/app/**/*.{ts,tsx}'],
    noPixi,
    noReact,
    relativeInside('app'),
    onlyBarrelOf('domain'),
    noLayer('engine'),
    noLayer('ui'),
  ),
  ...boundary(
    ['src/engine/**/*.{ts,tsx}'],
    noReact,
    relativeInside('engine'),
    onlyBarrelOf('domain'),
    onlyBarrelOf('app'),
    noLayer('ui'),
  ),
  ...boundary(
    ['src/ui/**/*.{ts,tsx}'],
    noPixi,
    relativeInside('ui'),
    noLayer('domain'),
    onlyBarrelOf('app'),
    onlyBarrelOf('engine'),
  ),
  ...boundary(
    ['src/*.{ts,tsx}'],
    noPixi,
    noLayer('domain'),
    noLayer('engine'),
    onlyBarrelOf('app'),
    onlyBarrelOf('ui'),
  ),
  {
    files: SOURCE_FILES,
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportExpression',
          message: 'Use static imports so the layer rules see them.',
        },
        {
          selector: 'TSImportType',
          message: 'Use a static type import so the layer rules see it.',
        },
      ],
    },
  },
  {
    files: SOURCE_FILES,
    ignores: ['src/domain/random.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Inject a RandomSource instead.' },
        { object: 'window', property: 'setInterval', message: 'Drive time from the ticker.' },
        { object: 'globalThis', property: 'setInterval', message: 'Drive time from the ticker.' },
      ],
    },
  },
  {
    files: SOURCE_FILES,
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'setInterval', message: 'Drive time from the ticker.' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/constants.ts', '**/catalog.ts', '**/*.test.ts', 'src/testing/**'],
    rules: {
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1, 2],
          ignoreArrayIndexes: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
          enforceConst: true,
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
