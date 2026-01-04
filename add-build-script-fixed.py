import json
import sys

# Read package.json
with open('package.json', 'r') as f:
    data = json.load(f)

# Add build:prod script if it doesn't exist
if 'build:prod' not in data.get('scripts', {}):
    data['scripts']['build:prod'] = 'next build --no-lint'
    print('✅ Added build:prod script')

# Write back
with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)

print('✅ package.json updated successfully!')
