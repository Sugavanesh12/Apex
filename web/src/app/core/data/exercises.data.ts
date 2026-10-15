import { ExerciseItem } from '../services/workout.service';

export const COMPREHENSIVE_EXERCISE_LIBRARY: ExerciseItem[] = [
  // ==========================================
  // LEGS & GLUTES (STRENGTH & HYPERTROPHY)
  // ==========================================
  {
    id: 'deficit-sumo-squat',
    name: 'Deficit Dumbbell Sumo Deadlift',
    muscle: 'Glutes',
    secondaryMuscles: ['Adductors', 'Hamstrings', 'Quads'],
    category: 'Strength',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/img/ex-sumo-squat-3d.png',
    lastPerformance: '36kg × 10',
    targetSetsReps: '4 × 10',
    prKg: 44,
    equipment: 'Dumbbell & Plates',
    difficulty: 'Intermediate',
    description: 'Elevated stance on bumper plates maximizing depth and adductor/glute elongation at the bottom of the hinge.',
    formCues: [
      'Elevate feet on 20kg bumper plates for extended range of motion',
      'Wide stance with toes pointed outwards at 45 degrees',
      'Maintain upright torso, hinge hips back and drive through heels',
      'Squeeze glutes hard at full lockout without hyperextending'
    ]
  },
  {
    id: 'back-squat',
    name: 'Barbell Back Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/img/ex-back-squat.jpg',
    lastPerformance: '120kg × 5',
    targetSetsReps: '4 × 5',
    prKg: 135,
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'The king of lower body compound exercises. Develops total leg mass, hip drive, and spinal erector strength.',
    formCues: [
      'Set bar on mid-traps, pull elbows down to create upper back shelf',
      'Brace core 360 degrees with Valsalva maneuver before descent',
      'Break at hips and knees simultaneously; descend below parallel',
      'Drive world away through mid-foot'
    ]
  },
  {
    id: 'front-squat',
    name: 'Barbell Front Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Core', 'Upper Back', 'Glutes'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    lastPerformance: '90kg × 6',
    targetSetsReps: '3 × 6',
    prKg: 105,
    equipment: 'Barbell',
    difficulty: 'Advanced',
    description: 'Anterior-loaded squat demanding immense thoracic extension and direct quadriceps recruitment with reduced lumbar shear.',
    formCues: [
      'Fingertip grip with high elbows parallel to the floor',
      'Stay completely upright throughout the concentric and eccentric phases',
      'Maintain knee travel forward tracking over middle toes'
    ]
  },
  {
    id: 'rdl',
    name: 'Romanian Deadlift (RDL)',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Erectors', 'Lats'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/img/ex-rdl.jpg',
    lastPerformance: '95kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 115,
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Premier posterior chain movement isolating hamstrings under high tension during eccentric stretch.',
    formCues: [
      'Slight soft bend in the knees kept constant throughout',
      'Push hips back as far as possible like closing a car door with hips',
      'Keep barbell skimming down thighs and shins',
      'Stop when hips stop traveling backward'
    ]
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Adductors', 'Calves'],
    category: 'Hypertrophy',
    image: '/img/ex-goblet-squat.jpg',
    lastPerformance: '24kg × 10/leg',
    targetSetsReps: '3 × 10',
    prKg: 30,
    equipment: 'Dumbbells & Bench',
    difficulty: 'Intermediate',
    description: 'Unilateral gold standard for eliminating left-right imbalances and building extreme glute and quad hypertrophy.',
    formCues: [
      'Rear foot laces resting flat on bench behind you',
      'Drop rear knee straight down toward the ground',
      'Maintain slight forward torso lean for glute bias'
    ]
  },
  {
    id: 'leg-press',
    name: '45° Leg Press',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes'],
    category: 'Hypertrophy',
    image: '/img/ex-back-squat.jpg',
    lastPerformance: '240kg × 12',
    targetSetsReps: '4 × 12',
    prKg: 280,
    equipment: 'Machine',
    difficulty: 'Beginner',
    description: 'Heavy machine compound allowing maximum quad loading to failure without spinal loading.',
    formCues: [
      'Keep lower back and pelvis glued to back pad',
      'Do not lock out knees forcefully at top of rep',
      'Control the 3-second descent into full depth'
    ]
  },
  {
    id: 'hip-thrust',
    name: 'Barbell Hip Thrust',
    muscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Adductors'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '140kg × 8',
    targetSetsReps: '4 × 8',
    prKg: 165,
    equipment: 'Barbell & Bench',
    difficulty: 'Intermediate',
    description: 'Horizontal vector glute power exercise producing peak mechanical tension at maximum hip extension.',
    formCues: [
      'Bench edge positioned right below scapula',
      'Shins perpendicular to floor at top lockout position',
      'Chin tucked, gaze forward to avoid lumbar hyperextension',
      'Hold 1-second peak squeeze at the top'
    ]
  },
  {
    id: 'lying-leg-curl',
    name: 'Lying Hamstring Curl',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Calves'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '55kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 65,
    equipment: 'Machine',
    difficulty: 'Beginner',
    description: 'Knee flexion isolation targeting the distal and short head of biceps femoris.',
    formCues: [
      'Keep hips pinned down to pad throughout the curl',
      'Dorsiflex toes toward shins to reduce calf takeover',
      'Control the lowering phase for 2-3 seconds'
    ]
  },
  {
    id: 'goblet-squat',
    name: 'Dumbbell Goblet Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Core'],
    category: 'Strength',
    image: '/img/ex-goblet-squat.jpg',
    lastPerformance: '32kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 38,
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    description: 'Foundational front-loaded squat teaching pristine squat mechanics and torso positioning.',
    formCues: [
      'Hold dumbbell vertically against upper chest',
      'Push elbows inside knees at the bottom to open hips',
      'Maintain tall spine throughout'
    ]
  },

  // ==========================================
  // CHEST (PUSH)
  // ==========================================
  {
    id: 'bench-press',
    name: 'Barbell Flat Bench Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    lastPerformance: '95kg × 5',
    targetSetsReps: '4 × 5',
    prKg: 110,
    equipment: 'Barbell & Bench',
    difficulty: 'Intermediate',
    description: 'Primary upper-body pushing compound for maximum pec, tricep, and anterior deltoid power.',
    formCues: [
      'Plant feet flat with aggressive leg drive',
      'Retract and depress shoulder blades into bench',
      'Touch bar to lower sternum; flare elbows at 45-75 degrees',
      'Press up and slightly back toward eye line'
    ]
  },
  {
    id: 'incline-db-press',
    name: 'Incline Dumbbell Press',
    muscle: 'Chest',
    secondaryMuscles: ['Front Delts', 'Triceps'],
    category: 'Hypertrophy',
    image: '/img/ex-goblet-squat.jpg',
    lastPerformance: '34kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 40,
    equipment: 'Dumbbells & Incline Bench',
    difficulty: 'Intermediate',
    description: 'Targets clavicular head (upper chest) with natural scapular movement and deep stretch.',
    formCues: [
      'Set bench to 30 degrees incline (avoid 45 to minimize shoulder takeover)',
      'Lower dumbbells slowly until thumbs align with upper chest',
      'Converge slightly at top without clinking dumbbells'
    ]
  },
  {
    id: 'weighted-dips',
    name: 'Chest Dips (Parallel Bars)',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    lastPerformance: 'BW+20kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 30,
    equipment: 'Dip Station',
    difficulty: 'Intermediate',
    description: 'The upper body squat. Heavy lower pec builder with intense tricep overload.',
    formCues: [
      'Lean torso 30 degrees forward to bias pectoral fibers',
      'Flare elbows slightly out; descend until shoulders are below elbows',
      'Press back up to lock out without shrugging shoulders'
    ]
  },
  {
    id: 'cable-fly',
    name: 'Standing Cable Crossover / Fly',
    muscle: 'Chest',
    secondaryMuscles: ['Front Delts'],
    category: 'Hypertrophy',
    image: '/img/ex-kb-swing.jpg',
    lastPerformance: '15kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 20,
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    description: 'Constant tension isolation capitalizing on adduction across the midline.',
    formCues: [
      'Keep slight elbow bend locked throughout movement',
      'Bring hands together in front of sternum like hugging a tree',
      'Squeeze inner chest hard at peak contraction'
    ]
  },

  // ==========================================
  // BACK & LATS (PULL)
  // ==========================================
  {
    id: 'deadlift',
    name: 'Conventional Barbell Deadlift',
    muscle: 'Back',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Traps', 'Forearms'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '150kg × 5',
    targetSetsReps: '3 × 5',
    prKg: 175,
    equipment: 'Barbell',
    difficulty: 'Advanced',
    description: 'Maximum full-body load pulling from dead stop. Builds unmatched spinal and posterior chain density.',
    formCues: [
      'Barbell over mid-foot; shins touching bar',
      'Engage lats by bending the bar around shins',
      'Pull slack out of bar before breaking off floor',
      'Drive hips through at lockout'
    ]
  },
  {
    id: 'barbell-row',
    name: 'Bent Over Barbell Row',
    muscle: 'Back',
    secondaryMuscles: ['Lats', 'Rhomboids', 'Biceps'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '85kg × 8',
    targetSetsReps: '4 × 8',
    prKg: 100,
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Horizontal pulling benchmark for upper back thickness, rhomboid density, and lat width.',
    formCues: [
      'Hinge at 45 degrees with flat neutral spine',
      'Pull bar toward lower abdomen/belly button',
      'Drive elbows past torso and squeeze shoulder blades together'
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '75kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 85,
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    description: 'Vertical pulling mass builder focusing on latissimus dorsi width and sweep.',
    formCues: [
      'Grip slightly wider than shoulder width with thumbless grip',
      'Pull elbows down toward back pockets',
      'Slight arch in upper chest; do not swing torso excessively'
    ]
  },
  {
    id: 'pullup',
    name: 'Overhand Pull-Up',
    muscle: 'Back',
    secondaryMuscles: ['Lats', 'Core', 'Biceps'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    lastPerformance: 'BW × 12',
    targetSetsReps: '3 × max',
    prKg: 15,
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    description: 'Pure relative bodyweight strength indicator for lat and upper back dominance.',
    formCues: [
      'Full dead hang at bottom of every rep',
      'Initiate pull by depressing scapulae down',
      'Pull until collarbone reaches bar height'
    ]
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Close-Grip Cable Row',
    muscle: 'Back',
    secondaryMuscles: ['Rhomboids', 'Mid-Traps', 'Biceps'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '70kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 80,
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    description: 'Mid-back and rhomboid thickness builder with sustained resistance curve.',
    formCues: [
      'Upright torso with slight natural stretch forward at extension',
      'Pull handle to navel and retract scapulae aggressively',
      'Keep shoulders depressed away from ears'
    ]
  },

  // ==========================================
  // SHOULDERS & ARMS
  // ==========================================
  {
    id: 'overhead-press',
    name: 'Standing Overhead Press (OHP)',
    muscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    lastPerformance: '60kg × 5',
    targetSetsReps: '4 × 5',
    prKg: 70,
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'True test of overhead vertical push power, requiring intense glute and core bracing.',
    formCues: [
      'Grip just outside shoulder width with vertical forearms',
      'Squeeze glutes and quads to create a rigid pillar',
      'Pull head back slightly, press bar in straight vertical line',
      'Lock out overhead with head through the window'
    ]
  },
  {
    id: 'db-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscle: 'Shoulders',
    secondaryMuscles: ['Traps'],
    category: 'Hypertrophy',
    image: '/img/ex-goblet-squat.jpg',
    lastPerformance: '14kg × 15',
    targetSetsReps: '4 × 15',
    prKg: 18,
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Direct isolation for lateral deltoid head to achieve wide, capped shoulder aesthetics.',
    formCues: [
      'Slight forward lean of 10-15 degrees',
      'Lead with elbows, hands slightly lower than elbows',
      'Raise in the scapular plane (30 degrees forward of midline)'
    ]
  },
  {
    id: 'barbell-curl',
    name: 'Barbell Bicep Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    category: 'Hypertrophy',
    image: '/img/ex-goblet-squat.jpg',
    lastPerformance: '40kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 48,
    equipment: 'Barbell / EZ-Bar',
    difficulty: 'Beginner',
    description: 'Fundamental bicep mass builder for peak and thickness.',
    formCues: [
      'Pin elbows to sides; avoid swinging hips',
      'Full supination of wrists at top of contraction',
      'Lower under 2-second control to full arm extension'
    ]
  },
  {
    id: 'tricep-pushdown',
    name: 'Cable Triceps Rope Pushdown',
    muscle: 'Triceps',
    secondaryMuscles: ['Forearms'],
    category: 'Hypertrophy',
    image: '/img/ex-kb-swing.jpg',
    lastPerformance: '27kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 35,
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    description: 'Isolates lateral and medial heads of the triceps with spread at the lockout.',
    formCues: [
      'Keep elbows fixed at ribs like hinges',
      'Push down and spread rope ends apart at the bottom',
      'Pause for 1 second at peak contraction'
    ]
  },

  // ==========================================
  // MOBILITY & MOVEMENT RESTORATION
  // ==========================================
  {
    id: '90-90-hip-mobility',
    name: '90/90 Hip Flow & Internal Rotation',
    muscle: 'Hips',
    secondaryMuscles: ['Glutes', 'Lower Back'],
    category: 'Mobility',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/img/ex-goblet-squat.jpg',
    lastPerformance: '10 reps each side',
    targetSetsReps: '3 × 8',
    prKg: 0,
    equipment: 'Bodyweight / Mat',
    difficulty: 'Beginner',
    description: 'Gold standard hip mobility protocol targeting internal and external hip rotation for deep squats and hip health.',
    formCues: [
      'Front leg bent at 90 degrees, back leg bent at 90 degrees',
      'Keep chest tall and rotate pelvis forward over front shin',
      'Transition smoothly from side to side without using hands if possible'
    ]
  },
  {
    id: 'worlds-greatest-stretch',
    name: "World's Greatest Stretch",
    muscle: 'Full Body',
    secondaryMuscles: ['Hip Flexors', 'Thoracic Spine', 'Hamstrings'],
    category: 'Mobility',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/img/ex-back-squat.jpg',
    lastPerformance: '6 reps/side',
    targetSetsReps: '2 × 6',
    prKg: 0,
    equipment: 'Bodyweight / Mat',
    difficulty: 'Beginner',
    description: 'Multi-joint dynamic opener combining lunge depth, hamstring stretch, and thoracic spine rotational opening.',
    formCues: [
      'Step forward into deep lunge with back leg extended',
      'Drop inside elbow to instep of front foot',
      'Rotate arm up to ceiling following fingertips with gaze',
      'Rock back to straighten front leg for hamstring stretch'
    ]
  },
  {
    id: 'thoracic-cat-cow',
    name: 'Cat-Cow Segmental Spine Flow',
    muscle: 'Spine',
    secondaryMuscles: ['Core', 'Neck'],
    category: 'Mobility',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '12 controlled cycles',
    targetSetsReps: '2 × 10',
    prKg: 0,
    equipment: 'Mat',
    difficulty: 'Beginner',
    description: 'Improves segmental spinal articulation and decompresses lumbar vertebrae after heavy axial loading.',
    formCues: [
      'Hands directly below shoulders, knees below hips',
      'Inhale: drop belly, expand chest, look upward (Cow)',
      'Exhale: tuck tailbone, round spine upward, look to navel (Cat)',
      'Move vertebra by vertebra slowly'
    ]
  },
  {
    id: 'couch-stretch',
    name: 'Wall Couch Stretch',
    muscle: 'Hip Flexors',
    secondaryMuscles: ['Quads', 'Psoas'],
    category: 'Mobility',
    image: '/img/ex-goblet-squat.jpg',
    lastPerformance: '60s hold/side',
    targetSetsReps: '2 × 45s',
    prKg: 0,
    equipment: 'Wall or Bench',
    difficulty: 'Intermediate',
    description: 'Intense hip flexor and rectus femoris elongation reversing anterior pelvic tilt from prolonged sitting.',
    formCues: [
      'Place rear knee against base of wall with shin flush vertical',
      'Step other foot forward into a 90-degree lunge',
      'Squeeze rear glute tightly and slowly elevate torso upright'
    ]
  },
  {
    id: 'deep-squat-prying',
    name: 'Deep Squat Prying & Ankle Mobilization',
    muscle: 'Ankles',
    secondaryMuscles: ['Hips', 'Groin'],
    category: 'Mobility',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/img/ex-sumo-squat-3d.png',
    lastPerformance: '90s hold',
    targetSetsReps: '2 × 60s',
    prKg: 0,
    equipment: 'Kettlebell or Bodyweight',
    difficulty: 'Intermediate',
    description: 'Restores ancestral resting squat posture, expands ankle dorsiflexion, and relieves lower back compression.',
    formCues: [
      'Sink into deepest comfortable squat with flat heels',
      'Use elbows to gently press knees outward',
      'Shift weight gently from side to side over each ankle'
    ]
  },
  {
    id: 'pigeon-pose',
    name: 'Elevated Pigeon Pose',
    muscle: 'Glutes',
    secondaryMuscles: ['Piriformis', 'Hip Capsule'],
    category: 'Mobility',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '60s hold',
    targetSetsReps: '2 × 45s',
    prKg: 0,
    equipment: 'Bench or Mat',
    difficulty: 'Beginner',
    description: 'Direct deep glute and piriformis capsule decompression, crucial for sciatic nerve relief and squat depth.',
    formCues: [
      'Place front shin horizontal across bench or mat',
      'Extend rear leg straight back behind you',
      'Keep hips square to the ground; hinge forward at the waist'
    ]
  },
  {
    id: 'banded-shoulder-dislocates',
    name: 'Banded Shoulder Pass-Throughs',
    muscle: 'Shoulders',
    secondaryMuscles: ['Chest', 'Rotator Cuff'],
    category: 'Mobility',
    image: '/img/ex-kb-swing.jpg',
    lastPerformance: '15 smooth reps',
    targetSetsReps: '2 × 15',
    prKg: 0,
    equipment: 'Resistance Band or PVC Pipe',
    difficulty: 'Beginner',
    description: 'Restores glenohumeral rotational capacity and opens pectoralis minor before bench press or overhead pressing.',
    formCues: [
      'Wide overhand grip on light resistance band',
      'Keeping arms straight, bring band overhead and behind lower back',
      'Do not arch lumbar spine or shrug shoulders'
    ]
  },

  // ==========================================
  // CORE & STABILITY
  // ==========================================
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise (Toes to Bar)',
    muscle: 'Core',
    secondaryMuscles: ['Hip Flexors', 'Grip'],
    category: 'Core',
    image: '/img/ex-back-squat.jpg',
    lastPerformance: 'BW × 12',
    targetSetsReps: '3 × 12',
    prKg: 0,
    equipment: 'Pull-up Bar',
    difficulty: 'Advanced',
    description: 'Maximum lower abdominal recruitment preventing anterior pelvic tilt with lat engagement.',
    formCues: [
      'Dead hang from bar with active shoulders',
      'Posteriorly tilt pelvis before lifting legs',
      'Raise straight legs to parallel or toes to bar without swinging'
    ]
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    muscle: 'Core',
    secondaryMuscles: ['Lats', 'Shoulders'],
    category: 'Core',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '10 controlled reps',
    targetSetsReps: '3 × 10',
    prKg: 0,
    equipment: 'Ab Wheel',
    difficulty: 'Advanced',
    description: 'Elite anti-extension core strength builder with extreme eccentric demand on rectus abdominis.',
    formCues: [
      'Start on knees with rounded upper back and tucked tailbone',
      'Roll wheel out slowly keeping hips tucked forward',
      'Pull back using abdominal contraction rather than hip flexors'
    ]
  },
  {
    id: 'plank',
    name: 'RKC Hardstyle Plank',
    muscle: 'Core',
    secondaryMuscles: ['Glutes', 'Shoulders'],
    category: 'Core',
    image: '/img/ex-rdl.jpg',
    lastPerformance: '60s hold',
    targetSetsReps: '3 × 45s',
    prKg: 0,
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Maximum isometric tension recruitment rather than passive endurance holding.',
    formCues: [
      'Forearms on ground, clench fists hard',
      'Squeeze glutes 100%, pull elbows toward toes',
      'Create total body stiffness like a steel plank'
    ]
  },
  {
    id: 'pallof-press',
    name: 'Cable Pallof Press',
    muscle: 'Core',
    secondaryMuscles: ['Obliques'],
    category: 'Core',
    image: '/img/ex-kb-swing.jpg',
    lastPerformance: '15kg × 12/side',
    targetSetsReps: '3 × 12',
    prKg: 20,
    equipment: 'Cable Machine or Band',
    difficulty: 'Beginner',
    description: 'Premier anti-rotational core movement protecting the lumbar spine during heavy athletic actions.',
    formCues: [
      'Stand perpendicular to cable tower with feet shoulder-width',
      'Hold handle at center of chest, press straight out and hold for 2s',
      'Resist rotation completely; keep hips and shoulders square'
    ]
  },

  // ==========================================
  // HIIT & CONDITIONING
  // ==========================================
  {
    id: 'kettlebell-swing',
    name: 'Explosive Kettlebell Swing',
    muscle: 'Power',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Cardio'],
    category: 'HIIT',
    image: '/img/ex-kb-swing.jpg',
    videoUrl: '/img/ex-kb-swing.jpg',
    lastPerformance: '28kg × 15',
    targetSetsReps: '4 × 15',
    prKg: 36,
    equipment: 'Kettlebell',
    difficulty: 'Intermediate',
    description: 'Ballistic hip hinge developing rapid hip snap power and cardiovascular conditioning.',
    formCues: [
      'Hike kettlebell high between legs like a football snap',
      'Snap hips forward violently into vertical plank',
      'Bell should float weightlessly to chest height from hip drive'
    ]
  },
  {
    id: 'box-jumps',
    name: 'Plyometric Box Jumps',
    muscle: 'Power',
    secondaryMuscles: ['Quads', 'Calves'],
    category: 'HIIT',
    image: '/img/ex-back-squat.jpg',
    lastPerformance: '30 inch box × 8',
    targetSetsReps: '3 × 8',
    prKg: 30,
    equipment: 'Plyo Box',
    difficulty: 'Intermediate',
    description: 'Explosive triple extension (ankles, knees, hips) training fast-twitch motor units.',
    formCues: [
      'Swing arms back in athletic hinge position',
      'Explode upward and land softly in a quarter-squat position',
      'Step down one foot at a time to protect Achilles tendons'
    ]
  },
  {
    id: 'battle-ropes',
    name: 'Battle Ropes Alternating Waves',
    muscle: 'Full Body',
    secondaryMuscles: ['Shoulders', 'Core', 'Cardio'],
    category: 'HIIT',
    image: '/img/ex-kb-swing.jpg',
    lastPerformance: '30s all out',
    targetSetsReps: '4 × 30s',
    prKg: 0,
    equipment: 'Battle Ropes',
    difficulty: 'Beginner',
    description: 'High-intensity non-impact conditioning driving heart rate and shoulder endurance.',
    formCues: [
      'Athletic quarter squat stance with chest up',
      'Alternate arms rapidly in fluid wave motions',
      'Maintain strong core brace throughout'
    ]
  }
];
