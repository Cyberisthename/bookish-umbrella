const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '../package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Add build:prod script
packageData.scripts['build:prod'] = 'next build --no-lint';

fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2), 'utf8');

console.log('✅ Added build:prod script to package.json');
