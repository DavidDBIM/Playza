const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\HP\\Desktop\\Projects\\playza\\playza-frontend\\public\\gameLib\\Cyber-Surge';
const indexPath = path.join(dir, 'index.html');
const cssPath = path.join(dir, 'style.css');

const content = fs.readFileSync(indexPath, 'utf-8');

// 1. Extract CSS
let cssContent = '';
const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    cssContent = styleMatch[1].trim();
}
fs.writeFileSync(cssPath, cssContent);

// 2. Extract JS
const scriptMatch = content.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.error("No module script found");
    process.exit(1);
}
let jsContent = scriptMatch[1];

jsContent = jsContent.replace(/import \* as THREE from 'three';\s*/g, '');

const classParts = jsContent.split(/\n\s*class /);
const initCodePart = classParts.pop(); 

const lastCloseBraceIndex = initCodePart.lastIndexOf('}\n');
const lastClassCode = initCodePart.substring(0, lastCloseBraceIndex + 1);
const initCode = initCodePart.substring(lastCloseBraceIndex + 1).trim();

classParts.push(lastClassCode); 

const classesToPath = {
    'GameEngine': 'src/core/GameEngine.js',
    'PlayerController': 'src/player/PlayerController.js',
    'ProceduralGenerator': 'src/systems/ProceduralGenerator.js',
    'EnvironmentManager': 'src/systems/EnvironmentManager.js',
    'ObstacleSystem': 'src/systems/ObstacleSystem.js',
    'PowerUpSystem': 'src/systems/PowerUpSystem.js',
    'ScoringSystem': 'src/systems/ScoringSystem.js',
    'CameraSystem': 'src/systems/CameraSystem.js',
    'AudioManager': 'src/systems/AudioManager.js',
    'EffectSystem': 'src/systems/EffectSystem.js',
    'UIManager': 'src/ui/UIManager.js'
};

// All other classes need to be imported in GameEngine
const engineImports = `
import { PlayerController } from '../player/PlayerController.js';
import { ProceduralGenerator } from '../systems/ProceduralGenerator.js';
import { EnvironmentManager } from '../systems/EnvironmentManager.js';
import { ObstacleSystem } from '../systems/ObstacleSystem.js';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { ScoringSystem } from '../systems/ScoringSystem.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { AudioManager } from '../systems/AudioManager.js';
import { EffectSystem } from '../systems/EffectSystem.js';
import { UIManager } from '../ui/UIManager.js';
`;

const extractedClasses = {};

for (let i = 1; i < classParts.length; i++) {
    const part = classParts[i];
    const match = part.match(/^([A-Za-z0-9_]+)\s*{/);
    if (match) {
        const className = match[1];
        let classBody = `export class ${className} {` + part.substring(match[0].length);
        
        let imports = "import * as THREE from 'three';\n";
        if (className === 'GameEngine') {
            imports += engineImports;
        }

        let fileContent = imports + "\n" + classBody;
        
        extractedClasses[className] = true;
        
        const relPath = classesToPath[className];
        if (relPath) {
            const fullPath = path.join(dir, relPath);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, fileContent.trim() + '\n');
            console.log(`Wrote ${relPath}`);
        }
    }
}

// Write the main entry point
let mainJs = "import * as THREE from 'three';\n";
mainJs += `import { GameEngine } from './src/core/GameEngine.js';\n\n`;
mainJs += `${initCode}\n`;

mainJs = mainJs.replace(/const game = new GameEngine\(container\);/, `const game = new GameEngine(container);\nwindow.game = game; // Make accessible globally for debugging if needed`);

fs.writeFileSync(path.join(dir, 'main.js'), mainJs);

// 3. Update index.html
let newHtml = content.replace(styleMatch[0], `<link rel="stylesheet" href="style.css">`);
newHtml = newHtml.replace(scriptMatch[0], `<script type="module" src="main.js"></script>`);
fs.writeFileSync(indexPath, newHtml);

console.log("Done extracting!");
