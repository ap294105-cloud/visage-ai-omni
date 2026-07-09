import os
import re

d = 'node_modules/jspdf/dist'
for f in os.listdir(d):
    if f.endswith('.js'):
        path = os.path.join(d, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        new_content = re.sub(r'require\(\[([^\]]+)\]', r'String([\1]', content)
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Patched {f}")
