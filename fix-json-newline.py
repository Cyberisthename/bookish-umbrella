import json

# Read package.json
with open('package.json', 'r') as f:
    content = f.read()
    f.seek(0)
    lines = content.split('\n')

# Find and fix line 181 (remove newline after })
fixed_lines = []
for i, line in enumerate(lines, 1):
    if i == 180:
        # Line 180: make sure it ends with }, no newline
        fixed_lines.append(line.rstrip())
    elif i == 181:
        # Line 181: remove newline before }
        fixed_lines.append(line.rstrip())
    else:
        fixed_lines.append(line)

# Write back
with open('package.json', 'w') as f:
    f.write('\n'.join(fixed_lines))

print('✅ Fixed JSON parse error in package.json')
