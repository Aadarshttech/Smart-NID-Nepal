import re

try:
    with open('html elements.txt', encoding='utf-8', errors='ignore') as f:
        data = f.read()
    
    ids = set(re.findall(r'"id"\s*:\s*"([^"]+)"', data))
    keywords = ['permstate', 'permdistrict', 'permrurmun', 'perm']
    
    filtered = [i for i in ids if any(k in i.lower() for k in keywords)]
    print("MATCHED IDs:")
    for i in sorted(filtered):
        print(i)
except Exception as e:
    print("Error:", e)
