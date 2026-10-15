import re
import os

ts_path = r"d:\Apex Project\web\src\app\core\data\exercises.data.ts"
with open(ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

def choose_media(name, muscle):
    n = name.lower()
    m = muscle.lower()
    
    if any(k in n for k in ['bench', 'push up', 'push-up', 'fly', 'flye', 'pec', 'chest press', 'dip']) or 'chest' in m:
        return '/img/ex-bench-press.jpg', '/video/bench-press.mp4'
    elif any(k in n for k in ['deadlift', 'clean', 'shrug', 'snatch']):
        return '/img/ex-deadlift.jpg', '/video/deadlift.mp4'
    elif any(k in n for k in ['rdl', 'romanian', 'row', 'pulldown', 'face pull']):
        return '/img/ex-barbell-row.jpg', '/video/barbell-row.mp4'
    elif any(k in n for k in ['pull up', 'pull-up', 'pullup', 'chin up', 'chin-up', 'chinup']):
        return '/img/ex-pullup.jpg', '/video/pullup.mp4'
    elif any(k in n for k in ['lateral raise', 'side delt', 'front raise']):
        return '/img/ex-lateral-raise.jpg', '/video/lateral-raise.mp4'
    elif any(k in n for k in ['overhead', 'military', 'shoulder press', 'arnold']) or 'shoulder' in m or 'delt' in m:
        return '/img/ex-overhead-press.jpg', '/video/overhead-press.mp4'
    elif any(k in n for k in ['bicep', 'curl', 'hammer', 'preacher']) or 'bicep' in m:
        return '/img/ex-bicep-curl.jpg', '/video/bicep-curl.mp4'
    elif any(k in n for k in ['tricep', 'pushdown', 'skull', 'extension']) or 'tricep' in m:
        return '/img/ex-tricep-pushdown.jpg', '/video/bicep-curl.mp4'
    elif any(k in n for k in ['thrust', 'glute bridge', 'kickback']) or 'glute' in m:
        return '/img/ex-hip-thrust.jpg', '/video/deadlift.mp4'
    elif any(k in n for k in ['lunge', 'split squat', 'step up', 'step-up']):
        return '/img/ex-lunge.jpg', '/video/squat.mp4'
    elif any(k in n for k in ['squat', 'leg press', 'hack', 'extension', 'quad']) or 'quad' in m or 'leg' in m or 'calf' in n or 'calves' in n:
        return '/img/ex-back-squat.jpg', '/video/squat.mp4'
    elif any(k in n for k in ['kettlebell', 'swing']):
        return '/img/ex-kb-swing.jpg', '/video/deadlift.mp4'
    else:
        if 'back' in m:
            return '/img/ex-barbell-row.jpg', '/video/barbell-row.mp4'
        elif 'arm' in m:
            return '/img/ex-bicep-curl.jpg', '/video/bicep-curl.mp4'
        else:
            return '/img/ex-deadlift.jpg', '/video/deadlift.mp4'

lines = content.splitlines()
out_lines = []
curr_name = ''
curr_muscle = ''

for line in lines:
    name_m = re.search(r'"name":\s*"([^"]+)"', line)
    if name_m:
        curr_name = name_m.group(1)
    muscle_m = re.search(r'"muscle":\s*"([^"]+)"', line)
    if muscle_m:
        curr_muscle = muscle_m.group(1)
    
    if '"image":' in line:
        img, vid = choose_media(curr_name, curr_muscle)
        out_lines.append(f'    "image": "{img}",')
    elif '"videoUrl":' in line:
        img, vid = choose_media(curr_name, curr_muscle)
        out_lines.append(f'    "videoUrl": "{vid}",')
    else:
        out_lines.append(line)

new_content = '\n'.join(out_lines)
with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully processed {len(out_lines)} lines in exercises.data.ts!")
