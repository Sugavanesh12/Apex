import math
import os
import csv
import json
from PIL import Image, ImageDraw

OUTPUT_IMG_DIR = r"d:\Apex Project\web\public\img"
EXERCISE_TXT_PATH = r"C:\Users\SugavaneshChinnaiyan\Documents\Exercise Name.txt"
TS_OUTPUT_PATH = r"d:\Apex Project\web\src\app\core\data\exercises.data.ts"

os.makedirs(OUTPUT_IMG_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. ANIMATED GIF GENERATION ENGINE
# -------------------------------------------------------------
WIDTH = 480
HEIGHT = 320
NUM_FRAMES = 24
BG_COLOR = (11, 16, 21)
GRID_COLOR = (22, 32, 42)
BONE_COLOR = (0, 229, 153)       # Neon emerald
JOINT_COLOR = (0, 240, 255)      # Cyan glow
HEAD_COLOR = (226, 232, 240)
BAR_COLOR = (245, 158, 11)       # Barbell amber
PLATE_COLOR = (239, 68, 68)      # Weight plates

def draw_bone(draw, x1, y1, x2, y2, color=BONE_COLOR, width=4):
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)

def draw_joint(draw, x, y, color=JOINT_COLOR, r=5):
    draw.ellipse([(x - r, y - r), (x + r, y + r)], fill=color, outline=(255, 255, 255), width=1)

def create_base_canvas():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    # Background grid lines
    for x in range(0, WIDTH, 40):
        draw.line([(x, 0), (x, HEIGHT)], fill=GRID_COLOR, width=1)
    for y in range(0, HEIGHT, 40):
        draw.line([(0, y), (WIDTH, y)], fill=GRID_COLOR, width=1)
    # Ground plane
    draw.line([(40, int(HEIGHT * 0.85)), (WIDTH - 40, int(HEIGHT * 0.85))], fill=(0, 229, 153, 100), width=2)
    return img, draw

def generate_squat_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2 # 0 to 1
        
        ankleX, ankleY = cx - 15, groundY - 6
        kneeForward = t * 24
        kneeDrop = t * 28
        kneeX, kneeY = cx - 25 + kneeForward, groundY - 65 + kneeDrop
        hipBack = t * 34
        hipDrop = t * 65
        hipX, hipY = cx - 35 - hipBack, groundY - 130 + hipDrop
        shoulderX, shoulderY = cx - 15 - hipBack * 0.4, hipY - 60
        headX, headY = shoulderX + 8, shoulderY - 20
        barX, barY = shoulderX + 4, shoulderY + 2
        
        # Bones
        draw_bone(draw, ankleX, ankleY, kneeX, kneeY)
        draw_bone(draw, kneeX, kneeY, hipX, hipY)
        draw_bone(draw, hipX, hipY, shoulderX, shoulderY, (59, 130, 246))
        draw_bone(draw, shoulderX, shoulderY, headX, headY, (203, 213, 225))
        
        # Joints
        draw_joint(draw, ankleX, ankleY)
        draw_joint(draw, kneeX, kneeY, (34, 197, 94) if t > 0.8 else (245, 158, 11))
        draw_joint(draw, hipX, hipY, (59, 130, 246))
        draw_joint(draw, shoulderX, shoulderY, (203, 213, 225))
        draw.ellipse([(headX - 10, headY - 10), (headX + 10, headY + 10)], fill=HEAD_COLOR)
        
        # Barbell
        draw.line([(barX - 30, barY), (barX + 30, barY)], fill=(226, 232, 240), width=4)
        draw.rectangle([(barX - 4, barY - 16), (barX + 4, barY + 16)], fill=PLATE_COLOR)
        
        # Text
        draw.text((16, 16), "HUMAN BIOMECHANICS: SQUAT PATTERN", fill=(0, 240, 255))
        draw.text((16, 32), f"KNEE FLEXION: {int(165 - t * 80)} deg  |  DEPTH: {'PARALLEL OK' if t > 0.8 else 'DESCENT'}", fill=(203, 213, 225))
        
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-squat.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_deadlift_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2 # 0 to 1
        
        ankleX, ankleY = cx - 10, groundY - 6
        kneeX, kneeY = cx - 8 + t * 6, groundY - 65 + t * 12
        hipX, hipY = cx - 20 - t * 35, groundY - 125 + t * 30
        shoulderX, shoulderY = hipX + 45 - t * 12, hipY - 60 + t * 45
        headX, headY = shoulderX + 12, shoulderY - 18
        barX, barY = ankleX + 6, groundY - 120 + t * 85
        
        draw_bone(draw, ankleX, ankleY, kneeX, kneeY)
        draw_bone(draw, kneeX, kneeY, hipX, hipY)
        draw_bone(draw, hipX, hipY, shoulderX, shoulderY, (59, 130, 246))
        draw_bone(draw, shoulderX, shoulderY, barX, barY, (148, 163, 184)) # Arms
        
        draw_joint(draw, ankleX, ankleY)
        draw_joint(draw, kneeX, kneeY)
        draw_joint(draw, hipX, hipY, (34, 197, 94) if t > 0.8 else (245, 158, 11))
        draw_joint(draw, shoulderX, shoulderY)
        draw.ellipse([(headX - 10, headY - 10), (headX + 10, headY + 10)], fill=HEAD_COLOR)
        
        # Barbell
        draw.line([(barX - 25, barY), (barX + 25, barY)], fill=(226, 232, 240), width=4)
        draw.rectangle([(barX - 4, barY - 16), (barX + 4, barY + 16)], fill=PLATE_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: DEADLIFT & HINGE", fill=(0, 240, 255))
        draw.text((16, 32), f"HIP HINGE ANGLE: {int(175 - t * 75)} deg  |  BAR PATH: VERTICAL", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-deadlift.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_bench_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2
        
        # Bench pad
        draw.rectangle([(cx - 75, groundY - 75), (cx + 75, groundY - 60)], fill=(30, 41, 59))
        
        shoulderX, shoulderY = cx - 35, groundY - 82
        hipX, hipY = cx + 35, groundY - 82
        barY = groundY - 135 + t * 45
        elbowX, elbowY = cx - 18, groundY - 105 + t * 35
        wristX, wristY = shoulderX + 12, barY
        
        draw_bone(draw, shoulderX, shoulderY, hipX, hipY, (59, 130, 246))
        draw_bone(draw, shoulderX, shoulderY, elbowX, elbowY)
        draw_bone(draw, elbowX, elbowY, wristX, wristY)
        
        draw_joint(draw, shoulderX, shoulderY)
        draw_joint(draw, elbowX, elbowY, (34, 197, 94) if t > 0.85 else (245, 158, 11))
        draw_joint(draw, wristX, wristY)
        draw.ellipse([(shoulderX - 16, shoulderY - 8), (shoulderX - 2, shoulderY + 8)], fill=HEAD_COLOR)
        
        # Barbell
        draw.line([(wristX - 35, barY), (wristX + 35, barY)], fill=(226, 232, 240), width=4)
        draw.rectangle([(wristX - 36, barY - 12), (wristX - 30, barY + 12)], fill=PLATE_COLOR)
        draw.rectangle([(wristX + 30, barY - 12), (wristX + 36, barY + 12)], fill=PLATE_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: BENCH PRESS", fill=(0, 240, 255))
        draw.text((16, 32), f"ELBOW ANGLE: {int(170 - t * 85)} deg  |  CHEST TOUCH: {'YES' if t > 0.85 else 'ECCENTRIC'}", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-bench.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_overhead_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = 1 - (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2 # 0: collarbone, 1: lockout
        
        barY = groundY - 145 - t * 50
        shoulderX, shoulderY = cx, groundY - 135
        elbowX, elbowY = cx - 14 + t * 8, groundY - 115 - t * 18
        wristX, wristY = cx - 6, barY
        
        draw_bone(draw, cx, groundY - 6, cx, groundY - 70)
        draw_bone(draw, cx, groundY - 70, cx, shoulderY, (59, 130, 246))
        draw_bone(draw, shoulderX, shoulderY, elbowX, elbowY)
        draw_bone(draw, elbowX, elbowY, wristX, wristY)
        
        draw_joint(draw, elbowX, elbowY, (34, 197, 94) if t > 0.85 else (245, 158, 11))
        draw_joint(draw, shoulderX, shoulderY)
        draw.ellipse([(cx - 9, shoulderY - 24), (cx + 9, shoulderY - 6)], fill=HEAD_COLOR)
        
        # Barbell
        draw.line([(wristX - 35, barY), (wristX + 35, barY)], fill=(226, 232, 240), width=4)
        draw.rectangle([(wristX - 36, barY - 12), (wristX - 30, barY + 12)], fill=PLATE_COLOR)
        draw.rectangle([(wristX + 30, barY - 12), (wristX + 36, barY + 12)], fill=PLATE_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: OVERHEAD PRESS", fill=(0, 240, 255))
        draw.text((16, 32), f"ARM EXTENSION: {int(85 + t * 95)} deg  |  HEAD THROUGH WINDOW: {'YES' if t > 0.85 else 'PRESSING'}", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-overhead.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_pullup_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = 1 - (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2 # 0: hang, 1: top
        
        barY = groundY - 180
        shoulderY = barY + 30 + (1 - t) * 50
        hipY = shoulderY + 55
        
        # Pull-up Bar
        draw.line([(cx - 70, barY), (cx + 70, barY)], fill=(100, 116, 139), width=6)
        
        # Arms
        draw_bone(draw, cx - 35, barY, cx - 22, shoulderY - 6)
        draw_bone(draw, cx + 35, barY, cx + 22, shoulderY - 6)
        # Torso & Legs
        draw_bone(draw, cx, shoulderY, cx, hipY, (59, 130, 246))
        draw_bone(draw, cx, hipY, cx - 8, hipY + 50)
        draw_bone(draw, cx, hipY, cx + 8, hipY + 50)
        
        draw_joint(draw, cx - 22, shoulderY - 6, (34, 197, 94) if t > 0.85 else (245, 158, 11))
        draw_joint(draw, cx + 22, shoulderY - 6, (34, 197, 94) if t > 0.85 else (245, 158, 11))
        draw.ellipse([(cx - 9, shoulderY - 24), (cx + 9, shoulderY - 6)], fill=HEAD_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: PULL-UP & CHIN-UP", fill=(0, 240, 255))
        draw.text((16, 32), f"LAT CONTRACTION: {int(t * 100)}%  |  CHIN OVER BAR: {'YES' if t > 0.85 else 'PULLING'}", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-pullup.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_row_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = 1 - (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2
        
        hipX, hipY = cx - 30, groundY - 110
        shoulderX, shoulderY = cx + 20, groundY - 130
        elbowX = cx - 5 - t * 20
        elbowY = groundY - 115 - t * 20
        handX = cx + 5
        handY = groundY - 80 - t * 45
        
        # Legs
        draw_bone(draw, cx - 15, groundY - 6, cx - 25, groundY - 60)
        draw_bone(draw, cx - 25, groundY - 60, hipX, hipY)
        # Torso
        draw_bone(draw, hipX, hipY, shoulderX, shoulderY, (59, 130, 246))
        # Arms
        draw_bone(draw, shoulderX, shoulderY, elbowX, elbowY)
        draw_bone(draw, elbowX, elbowY, handX, handY)
        
        draw_joint(draw, elbowX, elbowY, (34, 197, 94) if t > 0.85 else (245, 158, 11))
        draw_joint(draw, shoulderX, shoulderY)
        draw.ellipse([(shoulderX + 6, shoulderY - 18), (shoulderX + 24, shoulderY)], fill=HEAD_COLOR)
        
        # Dumbbell / Barbell
        draw.line([(handX - 18, handY), (handX + 18, handY)], fill=(226, 232, 240), width=4)
        draw.rectangle([(handX - 18, handY - 8), (handX - 12, handY + 8)], fill=PLATE_COLOR)
        draw.rectangle([(handX + 12, handY - 8), (handX + 18, handY + 8)], fill=PLATE_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: ROW & PULLOVER", fill=(0, 240, 255))
        draw.text((16, 32), f"SCAPULAR RETRACTION: {int(t * 100)}%  |  ELBOW DRIVE: {'MAX' if t > 0.85 else 'PULLING'}", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-row.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_curl_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = 1 - (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2
        
        shoulderX, shoulderY = cx - 15, groundY - 140
        elbowX, elbowY = shoulderX, shoulderY + 40
        angle = t * math.pi * 0.65
        wristX = elbowX + math.sin(angle) * 36
        wristY = elbowY + math.cos(angle) * 36
        
        draw_bone(draw, cx, groundY - 6, cx, groundY - 75)
        draw_bone(draw, cx, groundY - 75, shoulderX, shoulderY, (59, 130, 246))
        draw_bone(draw, shoulderX, shoulderY, elbowX, elbowY)
        draw_bone(draw, elbowX, elbowY, wristX, wristY)
        
        draw_joint(draw, elbowX, elbowY, (34, 197, 94) if t > 0.85 else (245, 158, 11))
        draw_joint(draw, wristX, wristY)
        draw.ellipse([(cx - 8, shoulderY - 24), (cx + 8, shoulderY - 8)], fill=HEAD_COLOR)
        
        # Dumbbell
        draw.ellipse([(wristX - 8, wristY - 8), (wristX + 8, wristY + 8)], fill=PLATE_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: BICEP CURL & ROTATION", fill=(0, 240, 255))
        draw.text((16, 32), f"BICEPS PEAK: {int(t * 100)}%  |  ELBOW ISOLATION: 100%", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-curl.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_triceps_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = 1 - (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2
        
        shoulderX, shoulderY = cx - 15, groundY - 140
        elbowX, elbowY = shoulderX, shoulderY + 40
        angle = (1 - t) * math.pi * 0.5
        wristX = elbowX + math.sin(angle) * 36
        wristY = elbowY + math.cos(angle) * 36
        
        draw_bone(draw, cx, groundY - 6, cx, groundY - 75)
        draw_bone(draw, cx, groundY - 75, shoulderX, shoulderY, (59, 130, 246))
        draw_bone(draw, shoulderX, shoulderY, elbowX, elbowY)
        draw_bone(draw, elbowX, elbowY, wristX, wristY)
        
        draw_joint(draw, elbowX, elbowY, (34, 197, 94) if t > 0.85 else (245, 158, 11))
        draw_joint(draw, wristX, wristY)
        draw.ellipse([(cx - 8, shoulderY - 24), (cx + 8, shoulderY - 8)], fill=HEAD_COLOR)
        
        draw.ellipse([(wristX - 8, wristY - 8), (wristX + 8, wristY + 8)], fill=PLATE_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: TRICEPS EXTENSION & PUSHDOWN", fill=(0, 240, 255))
        draw.text((16, 32), f"LOCKOUT: {int(t * 100)}%  |  LATERAL HEAD ENGAGEMENT", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-triceps.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_lunge_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2
        
        drop = t * 45
        frontAnkle = cx + 45, groundY - 6
        frontKnee = cx + 45, groundY - 65 + drop * 0.5
        hip = cx, groundY - 120 + drop
        rearKnee = cx - 40, groundY - 60 + drop
        rearAnkle = cx - 55, groundY - 6
        shoulder = cx + 5, hip[1] - 55
        
        draw_bone(draw, frontAnkle[0], frontAnkle[1], frontKnee[0], frontKnee[1])
        draw_bone(draw, frontKnee[0], frontKnee[1], hip[0], hip[1])
        draw_bone(draw, hip[0], hip[1], rearKnee[0], rearKnee[1])
        draw_bone(draw, rearKnee[0], rearKnee[1], rearAnkle[0], rearAnkle[1])
        draw_bone(draw, hip[0], hip[1], shoulder[0], shoulder[1], (59, 130, 246))
        
        draw_joint(draw, frontKnee[0], frontKnee[1], (34, 197, 94) if t > 0.8 else (245, 158, 11))
        draw_joint(draw, rearKnee[0], rearKnee[1])
        draw_joint(draw, hip[0], hip[1])
        draw.ellipse([(shoulder[0] - 8, shoulder[1] - 22), (shoulder[0] + 8, shoulder[1] - 6)], fill=HEAD_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: LUNGE & SPLIT SQUAT", fill=(0, 240, 255))
        draw.text((16, 32), f"UNILATERAL DEPTH: {int(t * 100)}%  |  TORSO UPRIGHT", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-lunge.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_core_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2
        
        # Hanging leg raise
        barY = groundY - 180
        hipY = groundY - 80
        draw.line([(cx - 50, barY), (cx + 50, barY)], fill=(100, 116, 139), width=6)
        
        legAngle = t * math.pi * 0.5
        footX = cx + math.sin(legAngle) * 65
        footY = hipY - math.cos(legAngle) * 65 + 65
        
        draw_bone(draw, cx, barY, cx, hipY - 45)
        draw_bone(draw, cx, hipY - 45, cx, hipY, (59, 130, 246))
        draw_bone(draw, cx, hipY, footX, footY)
        
        draw_joint(draw, cx, hipY, (34, 197, 94) if t > 0.8 else (245, 158, 11))
        draw.ellipse([(cx - 8, barY + 12), (cx + 8, barY + 28)], fill=HEAD_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: CORE & ABS COMPRESSION", fill=(0, 240, 255))
        draw.text((16, 32), f"PELVIC TILT: {int(t * 100)}%  |  NO MOMENTUM SWING", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-core.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_calf_gif():
    frames = []
    groundY = int(HEIGHT * 0.85)
    cx = WIDTH // 2
    for i in range(NUM_FRAMES):
        img, draw = create_base_canvas()
        t = 1 - (math.sin(i / NUM_FRAMES * math.pi * 2) + 1) / 2
        
        heelLift = t * 25
        ankleX, ankleY = cx, groundY - 6 - heelLift
        kneeX, kneeY = cx, groundY - 70 - heelLift
        hipX, hipY = cx, groundY - 135 - heelLift
        shoulderX, shoulderY = cx, groundY - 195 - heelLift
        
        draw_bone(draw, ankleX, groundY - 6, ankleX, ankleY, (245, 158, 11)) # Foot arch
        draw_bone(draw, ankleX, ankleY, kneeX, kneeY)
        draw_bone(draw, kneeX, kneeY, hipX, hipY)
        draw_bone(draw, hipX, hipY, shoulderX, shoulderY, (59, 130, 246))
        
        draw_joint(draw, ankleX, ankleY, (34, 197, 94) if t > 0.8 else (245, 158, 11))
        draw_joint(draw, kneeX, kneeY)
        draw.ellipse([(cx - 8, shoulderY - 22), (cx + 8, shoulderY - 6)], fill=HEAD_COLOR)
        
        draw.text((16, 16), "HUMAN BIOMECHANICS: CALF RAISE & PLANTARFLEXION", fill=(0, 240, 255))
        draw.text((16, 32), f"PEAK CONTRACTION: {int(t * 100)}%  |  GASTROCNEMIUS PEAK", fill=(203, 213, 225))
        frames.append(img)
    frames[0].save(os.path.join(OUTPUT_IMG_DIR, "anim-calf.gif"), save_all=True, append_images=frames[1:], duration=60, loop=0)

def generate_all_gifs():
    print("Generating animated biomechanical GIFs...")
    generate_squat_gif()
    generate_deadlift_gif()
    generate_bench_gif()
    generate_overhead_gif()
    generate_pullup_gif()
    generate_row_gif()
    generate_curl_gif()
    generate_triceps_gif()
    generate_lunge_gif()
    generate_core_gif()
    generate_calf_gif()
    print("Animated GIFs created successfully!")

# -------------------------------------------------------------
# 2. CONVERT 1,000 EXERCISES FROM FILE TO DATASET
# -------------------------------------------------------------
def slugify(text):
    return text.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("'", "").replace("/", "-")

def assign_assets(name, muscle, movement, equipment):
    name_l = name.lower()
    m_l = movement.lower()
    
    # Kinematic Type mapping
    if any(k in m_l for k in ["squat", "press (leg)"]):
        kinematic = "squat"
        anim_gif = "/img/anim-squat.gif"
    elif any(k in m_l for k in ["deadlift", "good morning", "swing", "hip thrust", "glute bridge"]):
        kinematic = "hinge"
        anim_gif = "/img/anim-deadlift.gif"
    elif any(k in m_l for k in ["bench", "press", "push-up", "dips", "fly", "squeeze press"]):
        kinematic = "bench"
        anim_gif = "/img/anim-bench.gif"
    elif any(k in m_l for k in ["overhead press", "push press", "front raise", "thruster", "handstand"]):
        kinematic = "overhead"
        anim_gif = "/img/anim-overhead.gif"
    elif any(k in m_l for k in ["pull-up", "chin-up", "pulldown", "pullover"]):
        kinematic = "pullup"
        anim_gif = "/img/anim-pullup.gif"
    elif any(k in m_l for k in ["row", "shrug", "face pull", "upright row"]):
        kinematic = "row"
        anim_gif = "/img/anim-row.gif"
    elif any(k in m_l for k in ["curl", "drag curl", "spider curl", "concentration curl", "hammer curl", "preacher curl"]):
        kinematic = "curl"
        anim_gif = "/img/anim-curl.gif"
    elif any(k in m_l for k in ["pushdown", "extension", "kickback", "french press", "skullcrusher"]):
        kinematic = "triceps"
        anim_gif = "/img/anim-triceps.gif"
    elif any(k in m_l for k in ["lunge", "step-up", "split squat"]):
        kinematic = "lunge"
        anim_gif = "/img/anim-lunge.gif"
    elif any(k in m_l for k in ["calf raise", "toe press", "tibialis raise"]):
        kinematic = "squat"
        anim_gif = "/img/anim-calf.gif"
    elif any(k in m_l for k in ["crunch", "sit-up", "leg raise", "rollout", "plank", "twist", "chop", "hold", "side bend"]):
        kinematic = "core"
        anim_gif = "/img/anim-core.gif"
    else:
        kinematic = "squat"
        anim_gif = "/img/anim-squat.gif"

    # Photo overlay matching for iconic lifts
    photo_map = {
        "barbell flat bench press": "/img/ex-bench-press.jpg",
        "standing barbell overhead press": "/img/ex-overhead-press.jpg",
        "strict bodyweight pull-up": "/img/ex-pullup.jpg",
        "barbell glute hip thrust": "/img/ex-hip-thrust.jpg",
        "standing barbell bicep curl": "/img/ex-bicep-curl.jpg",
        "cable triceps rope pushdown": "/img/ex-tricep-pushdown.jpg",
        "deficit dumbbell sumo deadlift": "/img/ex-sumo-squat-3d.png",
        "barbell back squat": "/img/ex-back-squat.jpg",
        "romanian deadlift": "/img/ex-rdl.jpg",
        "hardstyle kettlebell swing": "/img/ex-kb-swing.jpg",
        "kettlebell goblet squat": "/img/ex-goblet-squat.jpg"
    }

    image_url = anim_gif
    for key, path in photo_map.items():
        if key in name_l:
            image_url = path
            break

    # Category mapping
    if "Power" in muscle or any(k in m_l for k in ["clean", "snatch", "jerk", "swing", "burpee", "sled push"]):
        category = "HIIT"
    elif "Core" in muscle:
        category = "Core"
    elif any(k in m_l for k in ["squat", "deadlift", "bench", "press"]) and equipment == "Barbell":
        category = "Strength"
    elif any(k in m_l for k in ["mobility", "stretch", "flow"]):
        category = "Mobility"
    else:
        category = "Hypertrophy"

    return kinematic, image_url, category

def process_tsv():
    exercises = []
    seen_ids = set()
    
    with open(EXERCISE_TXT_PATH, "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t")
        header = next(reader) # Muscle Group, Equipment, Exercise Name, Difficulty Level, Primary Movement
        
        for row in reader:
            if not row or len(row) < 5:
                continue
            muscle_group, equipment, name, difficulty, movement = [c.strip() for c in row[:5]]
            
            ex_id = slugify(f"{name}-{equipment}")
            if ex_id in seen_ids:
                ex_id = slugify(f"{name}-{equipment}-{len(seen_ids)}")
            seen_ids.add(ex_id)
            
            kinematic, image_url, category = assign_assets(name, muscle_group, movement, equipment)
            
            # Form cues
            cues = [
                f"Engage core and set stable base using {equipment.lower()}.",
                f"Perform controlled eccentric phase emphasizing {muscle_group.lower()} tension.",
                f"Drive powerfully through the {movement.lower()} trajectory without momentum.",
                "Maintain constant spinal alignment throughout the set."
            ]
            
            description = f"{difficulty} {movement.lower()} exercise targeting the {muscle_group.lower()} using {equipment.lower()}."
            
            exercises.append({
                "id": ex_id,
                "name": name,
                "muscle": muscle_group,
                "secondaryMuscles": [movement, equipment],
                "category": category,
                "image": image_url,
                "videoUrl": "/video/demo-workout.webm",
                "lastPerformance": "3 sets logged",
                "targetSetsReps": "3 x 10-12",
                "prKg": 0,
                "equipment": equipment,
                "difficulty": difficulty,
                "kinematicType": kinematic,
                "description": description,
                "formCues": cues
            })
            
    print(f"Parsed {len(exercises)} exercises from TSV.")
    
    # Write to exercises.data.ts
    with open(TS_OUTPUT_PATH, "w", encoding="utf-8") as out:
        out.write("import { ExerciseItem } from '../services/workout.service';\n\n")
        out.write("export const COMPREHENSIVE_EXERCISE_LIBRARY: ExerciseItem[] = ")
        out.write(json.dumps(exercises, indent=2))
        out.write(";\n")
    print(f"Successfully wrote {len(exercises)} exercises to {TS_OUTPUT_PATH}")

if __name__ == "__main__":
    generate_all_gifs()
    process_tsv()
