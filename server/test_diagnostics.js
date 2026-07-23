import { BuildDiagnostics } from './core/BuildDiagnostics.js';

const tests = [
  {
    name: 'Missing File',
    logs: `vite v5.0.8 building for production...
✓ 34 modules transformed.
x Build failed in 1.23s
error during build:
Error: Could not resolve "./pages/ServicesPage" from "src/App.jsx"
    at error (file:///project/node_modules/rollup/dist/es/shared/parseAst.js:337:30)`
  },
  {
    name: 'Missing Package',
    logs: `Failed to resolve entry for package "react-icons". The package may have incorrect main/module/exports specified in its package.json.`
  },
  {
    name: 'Syntax Error',
    logs: `SyntaxError: Unexpected token (10:5)
    at Object.parse (file:///project/node_modules/babel/index.js:5:10)`
  },
  {
    name: 'JSX Error',
    logs: `Transform failed with 1 error:
src/App.jsx:5:10: ERROR: Unexpected JSX element <invalid>`
  },
  {
    name: 'Unknown Error',
    logs: `Some weird unknown error happened during build.
Exit code 1.`
  }
];

tests.forEach((test) => {
  console.log(`\n--- ${test.name} ---`);
  const result = BuildDiagnostics.analyzeLogs(test.logs);
  console.log(JSON.stringify(result, null, 2));
});
