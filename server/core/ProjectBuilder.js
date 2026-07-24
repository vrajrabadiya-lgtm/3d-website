import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { createWriteStream } from 'fs';
import { logger } from './logger.js';
import * as archiver from 'archiver';

const execAsync = util.promisify(exec);

export class ProjectBuilder {
  constructor(projectId) {
    this.projectId = projectId.toString();
    this.baseDir = process.cwd();
    this.buildDir = path.join(this.baseDir, 'artifacts', 'build', this.projectId);
    this.zipDir = path.join(this.baseDir, 'artifacts', 'zips');
    this.zipPath = path.join(this.zipDir, `project-${this.projectId}.zip`);
  }

  async setupProject(project) {
    try {
      // 1. Create directories
      await fs.mkdir(this.buildDir, { recursive: true });
      await fs.mkdir(path.join(this.buildDir, 'src', 'components', 'layout'), { recursive: true });
      await fs.mkdir(path.join(this.buildDir, 'src', 'components', 'sections'), { recursive: true });
      await fs.mkdir(path.join(this.buildDir, 'src', 'components', 'ui'), { recursive: true });
      await fs.mkdir(path.join(this.buildDir, 'src', '3d', 'objects'), { recursive: true });
      await fs.mkdir(path.join(this.buildDir, 'src', 'pages'), { recursive: true });
      await fs.mkdir(path.join(this.buildDir, 'src', 'hooks'), { recursive: true });

      const code = project.generatedCode || {};

      // 2. Generate package.json
      const packageJson = {
        name: `project-${this.projectId}`,
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-router-dom": "^6.22.0",
          "framer-motion": "^11.0.3",
          "@react-three/fiber": "^8.15.14",
          "@react-three/drei": "^9.96.1",
          "@react-three/postprocessing": "^2.16.0",
          "three": "^0.160.0"
        },
        devDependencies: {
          "@types/react": "^18.2.43",
          "@types/react-dom": "^18.2.17",
          "@vitejs/plugin-react": "^4.2.1",
          "vite": "^5.0.8"
        }
      };

      await fs.writeFile(
        path.join(this.buildDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // 3. Generate index.html
      const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.title || '3D Website'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
      await fs.writeFile(path.join(this.buildDir, 'index.html'), indexHtml);

      // 4. Generate vite.config.js
      const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`;
      await fs.writeFile(path.join(this.buildDir, 'vite.config.js'), viteConfig);

      // 5. Generate src/main.jsx
      const mainJsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
      await fs.writeFile(path.join(this.buildDir, 'src', 'main.jsx'), mainJsx);

      // 6. Generate src/index.css
      const indexCss = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody { margin: 0; padding: 0; background-color: #0a0a14; color: #ffffff; }`;
      await fs.writeFile(path.join(this.buildDir, 'src', 'index.css'), indexCss);
      
      // 7. Generate tailwind.config.js
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
      await fs.writeFile(path.join(this.buildDir, 'tailwind.config.js'), tailwindConfig);

      // 8. Write AI Generated files
      if (code.appJSX) {
        await fs.writeFile(path.join(this.buildDir, 'src', 'App.jsx'), code.appJSX);
      }
      if (code.heroJSX) {
        await fs.writeFile(path.join(this.buildDir, 'src', 'components', 'sections', 'HeroSection.jsx'), code.heroJSX);
      }
      if (code.sampleSection) {
        await fs.writeFile(path.join(this.buildDir, 'src', 'components', 'sections', 'SampleSection.jsx'), code.sampleSection);
      }
      if (code.sceneJSX) {
        await fs.writeFile(path.join(this.buildDir, 'src', '3d', 'Cinematic3DScene.jsx'), code.sceneJSX);
      }
      
      // Additional minimal stubs so the app at least compiles if requested by generated App.jsx
      await fs.writeFile(path.join(this.buildDir, 'src', 'components', 'layout', 'Navbar.jsx'), `export default function Navbar() { return <nav>Navbar</nav>; }`);
      await fs.writeFile(path.join(this.buildDir, 'src', 'components', 'layout', 'Footer.jsx'), `export default function Footer() { return <footer>Footer</footer>; }`);
      await fs.writeFile(path.join(this.buildDir, 'src', 'pages', 'HomePage.jsx'), `import HeroSection from '../components/sections/HeroSection';\nimport SampleSection from '../components/sections/SampleSection';\nexport default function HomePage() { return <div><HeroSection /><SampleSection /></div>; }`);
      await fs.writeFile(path.join(this.buildDir, 'src', 'pages', 'AboutPage.jsx'), `export default function AboutPage() { return <div>About</div>; }`);

      // 9. Generate README.md
      const readme = `# ${project.title || 'Nexus Project'}

Generated by the 3D Website Builder.

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
`;
      await fs.writeFile(path.join(this.buildDir, 'README.md'), readme);

      return true;
    } catch (error) {
      logger.error(`Setup failed for project ${this.projectId}`, error);
      throw error;
    }
  }

  async verifyBuild() {
    let buildStatus = 'FAILED';
    let buildLogs = '';
    let buildError = null;
    const startedAt = new Date();

    try {
      // Run npm install
      const { stdout: installOut, stderr: installErr } = await execAsync('npm install', { cwd: this.buildDir });
      buildLogs += `--- NPM INSTALL ---\n${installOut}\n${installErr}\n`;
      
      // Run npm build
      const { stdout: buildOut, stderr: buildErr } = await execAsync('npm run build', { cwd: this.buildDir });
      buildLogs += `\n--- NPM BUILD ---\n${buildOut}\n${buildErr}\n`;
      
      buildStatus = 'SUCCESS';
    } catch (error) {
      buildError = error.message;
      if (error.stdout) buildLogs += `\nSTDOUT: ${error.stdout}`;
      if (error.stderr) buildLogs += `\nSTDERR: ${error.stderr}`;
    }

    const completedAt = new Date();
    
    return {
      status: buildStatus,
      logs: buildLogs,
      error: buildError,
      startedAt,
      completedAt,
      duration: completedAt.getTime() - startedAt.getTime()
    };
  }

  async generateZip() {
    await fs.mkdir(this.zipDir, { recursive: true });

    return new Promise((resolve, reject) => {
      const output = createWriteStream(this.zipPath);
      const archive = new archiver.ZipArchive({
        zlib: { level: 9 } // Maximum compression
      });

      output.on('close', async () => {
        const stats = await fs.stat(this.zipPath);
        resolve({
          zipPath: this.zipPath,
          zipFileName: path.basename(this.zipPath),
          zipSize: stats.size,
          generatedAt: new Date()
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      // Append files from the build directory, but ignore node_modules
      archive.glob('**/*', {
        cwd: this.buildDir,
        ignore: ['node_modules/**', 'dist/**']
      });
      archive.finalize();
    });
  }

  async cleanup() {
    try {
      await fs.rm(this.buildDir, { recursive: true, force: true });
    } catch (error) {
      logger.warn(`Failed to cleanup build dir for ${this.projectId}: ${error.message}`);
    }
  }
}
