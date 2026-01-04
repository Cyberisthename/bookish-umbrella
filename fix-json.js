import fs from 'fs';
import path from 'path';

const packagePath = path.join(__dirname, '../package.json');
let packageContent = fs.readFileSync(packagePath, 'utf8');

// Fix JSON parse error - remove trailing newline before closing brace
packageContent = packageContent.replace(/\n    }\n/, '    }');

fs.writeFileSync(packagePath, packageContent, 'utf8');
console.log('✅ Fixed JSON structure');
