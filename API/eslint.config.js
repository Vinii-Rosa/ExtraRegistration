import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const allowedStatus = [200, 201, 400, 401, 404, 500];
const statusSelector = `CallExpression[callee.property.name='status'] > Literal.arguments:first-child${allowedStatus.map((code) => `[value!=${code}]`).join('')}`;

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'func-style': ['error', 'declaration'],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-syntax': [
        'error',
        { selector: statusSelector, message: 'Use apenas os status 200, 201, 400, 401, 404 e 500' },
      ],
    },
  },
  {
    files: ['test/**/*.ts', 'utils/test_helpers.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: statusSelector, message: 'Use apenas os status 200, 201, 400, 401, 404 e 500' },
        { selector: "CallExpression[callee.name='it']", message: 'Use test() no lugar de it()' },
        { selector: "CallExpression[callee.property.name='inject']", message: 'Não use app.inject: chame o controller com callAssertSuccess/callAssertError' },
      ],
    },
  },
  {
    files: ['controllers/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: statusSelector, message: 'Use apenas os status 200, 201, 400, 401, 404 e 500' },
        { selector: 'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]', message: 'Controller exporta apenas um objeto default' },
      ],
    },
  },
);
