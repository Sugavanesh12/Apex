import { ExerciseItem } from '../services/workout.service';

export const COMPREHENSIVE_EXERCISE_LIBRARY: ExerciseItem[] = [
  // ==========================================
  // 1. QUADRICEPS & KNEE-DOMINANT (13 EXERCISES)
  // ==========================================
  {
    id: 'back-squat',
    name: 'Barbell Back Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core', 'Erectors'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '120kg × 5',
    targetSetsReps: '4 × 5',
    prKg: 135,
    equipment: 'Barbell & Rack',
    difficulty: 'Intermediate',
    kinematicType: 'squat',
    description: 'The foundation of lower body compound development. Emphasizes total leg mass, hip drive, and core brace.',
    formCues: [
      'Set bar firmly on mid-traps with elbows pulled down',
      'Brace core 360 degrees before descent',
      'Break simultaneously at hips and knees to parallel depth',
      'Drive powerfully through mid-foot with knees tracking toes'
    ]
  },
  {
    id: 'deficit-sumo-squat',
    name: 'Deficit Dumbbell Sumo Deadlift',
    muscle: 'Glutes',
    secondaryMuscles: ['Adductors', 'Hamstrings', 'Quads'],
    category: 'Strength',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '36kg × 10',
    targetSetsReps: '4 × 10',
    prKg: 44,
    equipment: 'Dumbbell & Plates',
    difficulty: 'Intermediate',
    kinematicType: 'squat',
    description: 'Elevated stance on bumper plates maximizing depth and adductor/glute elongation at the bottom of the hinge.',
    formCues: [
      'Elevate feet on bumper plates for extended range of motion',
      'Wide stance with toes pointed outwards at 45 degrees',
      'Maintain upright torso, hinge hips back and drive through heels',
      'Squeeze glutes hard at full lockout without hyperextending'
    ]
  },
  {
    id: 'front-squat',
    name: 'Barbell Front Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Core', 'Upper Back', 'Glutes'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '90kg × 6',
    targetSetsReps: '3 × 6',
    prKg: 105,
    equipment: 'Barbell & Rack',
    difficulty: 'Advanced',
    kinematicType: 'squat',
    description: 'Anterior-loaded squat demanding immense thoracic extension and direct quadriceps recruitment with reduced lumbar shear.',
    formCues: [
      'Fingertip grip with high elbows parallel to floor',
      'Maintain an upright torso throughout descent',
      'Allow knees to track over middle toes with full depth'
    ]
  },
  {
    id: 'goblet-squat',
    name: 'Kettlebell Goblet Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Core', 'Upper Back'],
    category: 'Hypertrophy',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '28kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 36,
    equipment: 'Kettlebell or DB',
    difficulty: 'Beginner',
    kinematicType: 'squat',
    description: 'Superb squat patterning movement using anterior counterweight to allow deep hip sinking with pristine spinal posture.',
    formCues: [
      'Hold kettlebell horns tight against upper sternum',
      'Point elbows down inside knees at lowest bottom point',
      'Push floor away through three points of contact on foot'
    ]
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves'],
    category: 'Hypertrophy',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '24kg × 10',
    targetSetsReps: '3 × 10 / leg',
    prKg: 30,
    equipment: 'Dumbbells & Bench',
    difficulty: 'Intermediate',
    kinematicType: 'lunge',
    description: 'Unilateral rear-foot elevated squat addressing side-to-side asymmetries with intense quad stretch and glute recruitment.',
    formCues: [
      'Elevate rear instep on a sturdy bench 35-45cm high',
      'Descend straight down until rear knee hovers 2cm off floor',
      'Drive upward through front heel while keeping ribs locked down'
    ]
  },
  {
    id: 'leg-press-45',
    name: '45-Degree Incline Leg Press',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Adductors'],
    category: 'Hypertrophy',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '240kg × 12',
    targetSetsReps: '4 × 12',
    prKg: 280,
    equipment: 'Leg Press Machine',
    difficulty: 'Beginner',
    kinematicType: 'squat',
    description: 'Allows maximal quadriceps mechanical overload without compressive spinal loading or balance limitations.',
    formCues: [
      'Lower sled until knees reach 90 degrees without lower back lifting off pad',
      'Keep feet hip-width with slight toe flare',
      'Press through full foot, stopping just short of locking knees'
    ]
  },
  {
    id: 'hack-squat-machine',
    name: 'Linear Machine Hack Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Calves'],
    category: 'Hypertrophy',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '140kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 160,
    equipment: 'Hack Squat Machine',
    difficulty: 'Intermediate',
    kinematicType: 'squat',
    description: 'Fixed-plane angled sled emphasizing deep knee flexion and direct vastus medialis / lateralis growth.',
    formCues: [
      'Position feet lower on footplate for enhanced quad bias',
      'Control eccentric descent for 3 full seconds to depth',
      'Maintain back firmly glued to backrest pad'
    ]
  },
  {
    id: 'walking-lunges',
    name: 'Dumbbell Walking Lunges',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves'],
    category: 'Hypertrophy',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '20kg × 12 steps',
    targetSetsReps: '3 × 20 steps',
    prKg: 26,
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    kinematicType: 'lunge',
    description: 'Dynamic locomotion unilateral builder enhancing balance, decelerative knee stability, and glute-quad power.',
    formCues: [
      'Take comfortable forward step and descend with both knees at 90 degrees',
      'Keep torso upright with slight forward lean for glute bias',
      'Power off lead foot directly into subsequent stride'
    ]
  },
  {
    id: 'leg-extension',
    name: 'Seated Quadriceps Leg Extension',
    muscle: 'Quads',
    secondaryMuscles: ['Patellar Tendon'],
    category: 'Hypertrophy',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '65kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 80,
    equipment: 'Leg Extension Machine',
    difficulty: 'Beginner',
    kinematicType: 'squat',
    description: 'Pure open-kinetic-chain isolation targeting the rectus femoris and terminal knee extension peak contraction.',
    formCues: [
      'Align knee joint axis directly with machine cam pivot',
      'Pause for 1 full second at top lockout squeezing quads',
      'Resist weight on descent smoothly over 3 seconds'
    ]
  },
  {
    id: 'sissy-squat',
    name: 'Weighted Sissy Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Core', 'Hip Flexors'],
    category: 'Hypertrophy',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW+10kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 15,
    equipment: 'Sissy Squat Bench',
    difficulty: 'Advanced',
    kinematicType: 'squat',
    description: 'Extreme knee flexion and rectus femoris stretch exercise under passive tension.',
    formCues: [
      'Lock calves and shins firmly into pad',
      'Lean torso back in line with thighs during descent',
      'Drive through balls of feet to return to starting position'
    ]
  },
  {
    id: 'box-squat',
    name: 'Low Box Squat with Pause',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Hips'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '110kg × 5',
    targetSetsReps: '4 × 4',
    prKg: 125,
    equipment: 'Barbell & Box',
    difficulty: 'Intermediate',
    kinematicType: 'squat',
    description: 'Breaks the stretch-shortening cycle to build explosive starting strength out of the hole.',
    formCues: [
      'Sit back onto box under control without bouncing or relaxing core',
      'Pause for 1 second keeping spinal rigidity',
      'Explode upwards driving hips forward'
    ]
  },
  {
    id: 'zercher-squat',
    name: 'Barbell Zercher Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Upper Back', 'Biceps', 'Core'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '85kg × 6',
    targetSetsReps: '3 × 6',
    prKg: 100,
    equipment: 'Barbell',
    difficulty: 'Advanced',
    kinematicType: 'squat',
    description: 'Bar cradled in crook of elbows, building savage upper back fortitude, core pressure, and deep hip mobility.',
    formCues: [
      'Hook bar in elbow crooks with fists clasped tight to chest',
      'Descend elbows inside knees for exceptional depth',
      'Keep chest elevated throughout the concentric phase'
    ]
  },
  {
    id: 'heel-elevated-goblet-squat',
    name: 'Heel-Elevated Cyclist Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Vastus Medialis', 'Glutes'],
    category: 'Hypertrophy',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '32kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 40,
    equipment: 'Slant Board & Dumbbell',
    difficulty: 'Intermediate',
    kinematicType: 'squat',
    description: '25-degree wedge slant eliminating ankle dorsiflexion limits for complete tear-drop quad focus.',
    formCues: [
      'Place heels on wedge with narrow 15cm stance',
      'Descend straight down letting knees track forward over toes',
      'Push through balls of feet maintaining upright torso'
    ]
  },

  // ==========================================
  // 2. CHEST & HORIZONTAL PUSH (12 EXERCISES)
  // ==========================================
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    category: 'Strength',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '82.5kg × 5',
    targetSetsReps: '4 × 6',
    prKg: 95,
    equipment: 'Barbell & Flat Bench',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Premier upper body horizontal pressing exercise building pectoral density, front delt size, and triceps lockout power.',
    formCues: [
      'Retract and depress scapulae firmly into bench cushion',
      'Grip bar slightly wider than shoulder-width with wrapped thumbs',
      'Lower bar with 45-degree elbow tuck touching lower sternum',
      'Press upward and slightly backward over shoulders with leg drive'
    ]
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Barbell Bench Press (30°)',
    muscle: 'Chest',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    category: 'Strength',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '70kg × 6',
    targetSetsReps: '3 × 6',
    prKg: 82.5,
    equipment: 'Barbell & Incline Bench',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Targeted clavicular head (upper chest) builder that constructs a full, armored upper torso.',
    formCues: [
      'Set bench to 30 degrees (avoid excessive 45+ degree shoulder bias)',
      'Touch bar cleanly to upper chest just below collarbones',
      'Drive feet down into the ground to anchor pelvis'
    ]
  },
  {
    id: 'flat-dumbbell-press',
    name: 'Flat Dumbbell Chest Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    category: 'Hypertrophy',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '32kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 38,
    equipment: 'Dumbbells & Bench',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Provides deeper pectoral stretch at the bottom and convergent contraction at the apex.',
    formCues: [
      'Rotate dumbbells to 45-degree arrow angle at bottom',
      'Feel pronounced stretch across chest before driving upward',
      'Bring bells together over mid-chest without clanking'
    ]
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Chest Press',
    muscle: 'Chest',
    secondaryMuscles: ['Upper Chest', 'Anterior Deltoids', 'Triceps'],
    category: 'Hypertrophy',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '28kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 34,
    equipment: 'Dumbbells & Incline Bench',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Deep stretch on the upper pecs with free wrist rotation to alleviate shoulder impingement.',
    formCues: [
      'Retract shoulder blades and plant feet firmly',
      'Lower dumbbells under control until level with chest',
      'Converge slightly toward top while maintaining tension'
    ]
  },
  {
    id: 'weighted-dips-chest',
    name: 'Forward-Leaning Chest Dips',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Anterior Delts'],
    category: 'Strength',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW+20kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 30,
    equipment: 'Dip Station & Dip Belt',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Calisthenic upper body squat for pecs. Produces massive lower pectoral stimulation and arm thickness.',
    formCues: [
      'Lean torso forward 30 degrees with elbows flared slightly',
      'Descend until shoulders are level with or slightly below elbows',
      'Press up forcefully to lockout without shrugging shoulders'
    ]
  },
  {
    id: 'pushup-standard',
    name: 'Strict Deficit Push-Ups',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Core', 'Serratus Anterior'],
    category: 'Strength',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 30',
    targetSetsReps: '4 × 20',
    prKg: 0,
    equipment: 'Parallettes or Handles',
    difficulty: 'Beginner',
    kinematicType: 'bench',
    description: 'Deficit handles allow extended pectoral stretch and full scapular protraction at peak contraction.',
    formCues: [
      'Lock glutes and abs in rigid hollow body plank',
      'Tuck elbows 45 degrees relative to ribs',
      'Touch chest fully below handle level, then push floor away completely'
    ]
  },
  {
    id: 'cable-crossover-fly',
    name: 'Standing Cable Chest Flyes',
    muscle: 'Chest',
    secondaryMuscles: ['Anterior Deltoids'],
    category: 'Hypertrophy',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '15kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 20,
    equipment: 'Dual Cable Station',
    difficulty: 'Beginner',
    kinematicType: 'bench',
    description: 'Constant tension resistance curve throughout the entire active range of motion.',
    formCues: [
      'Set pulleys at shoulder height with slight staggered stance',
      'Maintain soft bend in elbows like hugging a tree barrel',
      'Cross wrists slightly at peak contraction for maximal adduction'
    ]
  },
  {
    id: 'low-to-high-cable-fly',
    name: 'Low-to-High Cable Upper Chest Fly',
    muscle: 'Chest',
    secondaryMuscles: ['Upper Chest', 'Anterior Deltoid'],
    category: 'Hypertrophy',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '12.5kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 17.5,
    equipment: 'Cable Station',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Matches the diagonal muscle fiber orientation of the clavicular pectoral head.',
    formCues: [
      'Pulleys at lowest setting with palms supinated upward',
      'Sweep cables diagonally upward meeting at chin height',
      'Hold squeeze for 1 second at top'
    ]
  },
  {
    id: 'pec-deck-fly',
    name: 'Machine Pec Deck Fly',
    muscle: 'Chest',
    secondaryMuscles: ['Anterior Deltoids'],
    category: 'Hypertrophy',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '60kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 75,
    equipment: 'Pec Deck Machine',
    difficulty: 'Beginner',
    kinematicType: 'bench',
    description: 'Provides guided path with peak mechanical resistance right at the shortened squeeze position.',
    formCues: [
      'Adjust seat so handles align with mid-chest',
      'Keep chest puffed and shoulder blades pressed back against pad',
      'Drive elbows inward toward each other'
    ]
  },
  {
    id: 'decline-barbell-press',
    name: 'Decline Barbell Bench Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Lower Pecs'],
    category: 'Strength',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '90kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 105,
    equipment: 'Decline Bench & Barbell',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Reduces shoulder impingement while allowing heavier mechanical load on sternocostal pecs.',
    formCues: [
      'Anchor shins securely under rollers',
      'Lower bar to bottom border of pecs',
      'Keep wrists stacked vertically above forearms'
    ]
  },
  {
    id: 'landmine-chest-press',
    name: 'Standing Landmine Squeeze Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    category: 'Hypertrophy',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '35kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 45,
    equipment: 'Landmine & Barbell',
    difficulty: 'Beginner',
    kinematicType: 'bench',
    description: 'Two-handed press creating intense isometric inward squeeze on inner pectoral fibers.',
    formCues: [
      'Cup barbell sleeve between both palms at chest level',
      'Squeeze hands together aggressively throughout motion',
      'Press upward at 45-degree angle without leaning back'
    ]
  },
  {
    id: 'diamond-pushups',
    name: 'Close Diamond Grip Push-Ups',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Core'],
    category: 'Hypertrophy',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 20',
    targetSetsReps: '3 × 15',
    prKg: 0,
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Hands together in diamond shape shifting load heavily into triceps and sternal pecs.',
    formCues: [
      'Form diamond with index fingers and thumbs directly under sternum',
      'Tuck elbows in close to ribcage on descent',
      'Keep body in a laser-straight plank line'
    ]
  },

  // ==========================================
  // 3. BACK & POSTERIOR PULL (14 EXERCISES)
  // ==========================================
  {
    id: 'pull-up',
    name: 'Strict Bodyweight Pull-Up',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Rear Delts'],
    category: 'Strength',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW+15kg × 5',
    targetSetsReps: '4 × 6',
    prKg: 25,
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    kinematicType: 'pullup',
    description: 'Gold standard vertical pull test. Builds wide V-taper lats, mid-back density, and crushing grip.',
    formCues: [
      'Overhand pronated grip slightly wider than shoulder-width',
      'Depress and retract scapulae before bending elbows',
      'Pull chest up to touch the bar with elbows driven toward hips',
      'Lower smoothly to full dead-hang without swinging'
    ]
  },
  {
    id: 'chin-up',
    name: 'Underhand Grip Chin-Up',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Lower Traps'],
    category: 'Strength',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW+20kg × 6',
    targetSetsReps: '3 × 8',
    prKg: 30,
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    kinematicType: 'pullup',
    description: 'Supinated grip maximizing biceps involvement and lower lat activation throughout vertical trajectory.',
    formCues: [
      'Shoulder-width underhand grip',
      'Drive elbows down and back while keeping core braced',
      'Clear chin cleanly over bar at peak'
    ]
  },
  {
    id: 'neutral-grip-pullup',
    name: 'Neutral Grip Pull-Up',
    muscle: 'Back',
    secondaryMuscles: ['Brachialis', 'Lats', 'Teres Major'],
    category: 'Strength',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW+15kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 25,
    equipment: 'Parallel Bars',
    difficulty: 'Intermediate',
    kinematicType: 'pullup',
    description: 'Palms facing each other; highly joint-friendly for elbows and shoulders under heavy loads.',
    formCues: [
      'Grip parallel handles firmly',
      'Pull chest up between handles',
      'Control eccentric descent to full lat elongation'
    ]
  },
  {
    id: 'barbell-bent-over-row',
    name: 'Barbell Bent-Over Row',
    muscle: 'Back',
    secondaryMuscles: ['Hamstrings', 'Lats', 'Rhomboids', 'Biceps'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '80kg × 8',
    targetSetsReps: '4 × 8',
    prKg: 95,
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    kinematicType: 'row',
    description: 'Heavy horizontal row building immense mid-back thickness, lats, and isometric spinal erector stability.',
    formCues: [
      'Hinge hips back at 45-degree torso angle with flat spine',
      'Pull bar toward lower abdomen leading with elbows',
      'Pinch shoulder blades hard together at apex',
      'Lower bar with control without rounding lower back'
    ]
  },
  {
    id: 'pendlay-row',
    name: 'Pendlay Row (From Floor)',
    muscle: 'Back',
    secondaryMuscles: ['Rhomboids', 'Rear Delts', 'Lats'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '75kg × 6',
    targetSetsReps: '4 × 5',
    prKg: 90,
    equipment: 'Barbell & Plates',
    difficulty: 'Advanced',
    kinematicType: 'row',
    description: 'Strict horizontal row resetting on floor each repetition to foster explosive pulling power.',
    formCues: [
      'Torso strictly parallel to floor with knees soft',
      'Explode bar up to sternum without standing up',
      'Return weight dead-stop to floor before next rep'
    ]
  },
  {
    id: 'lat-pulldown-wide',
    name: 'Wide-Grip Lat Pulldown',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Teres Major'],
    category: 'Hypertrophy',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '70kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 85,
    equipment: 'Cable Lat Pulldown',
    difficulty: 'Beginner',
    kinematicType: 'pullup',
    description: 'Machine alternative to pull-up enabling pure lat focus and dialed-in eccentric tempo control.',
    formCues: [
      'Grip bar just beyond shoulder width with thumb over bar',
      'Lean back 10-15 degrees and drive elbows straight down into pockets',
      'Slow release over 3 seconds feeling lats stretch'
    ]
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row (Close Grip)',
    muscle: 'Back',
    secondaryMuscles: ['Rhomboids', 'Lats', 'Biceps', 'Erectors'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '65kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 80,
    equipment: 'Low Row Cable Machine',
    difficulty: 'Beginner',
    kinematicType: 'row',
    description: 'Targets the rhomboids and mid-traps with adjustable grip versatility and constant tension.',
    formCues: [
      'Sit tall with knees slightly bent and chest broad',
      'Initiate pull by retracting scapulae, then pull handle to navel',
      'Do not lean excessively back or rock torso'
    ]
  },
  {
    id: 'one-arm-dumbbell-row',
    name: 'One-Arm Dumbbell Row',
    muscle: 'Back',
    secondaryMuscles: ['Lats', 'Core', 'Biceps'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '36kg × 10 / arm',
    targetSetsReps: '3 × 10 / arm',
    prKg: 42,
    equipment: 'Dumbbell & Bench',
    difficulty: 'Beginner',
    kinematicType: 'row',
    description: 'Unilateral row permitting massive range of motion and direct lat stretch at bottom.',
    formCues: [
      'Brace non-working hand and knee on flat bench',
      'Row dumbbell in J-curve path back toward hip pocket',
      'Keep hips and shoulders square to floor throughout'
    ]
  },
  {
    id: 't-bar-row',
    name: 'Chest-Supported T-Bar Row',
    muscle: 'Back',
    secondaryMuscles: ['Mid-Traps', 'Rhomboids', 'Biceps'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '55kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 70,
    equipment: 'T-Bar Row Machine',
    difficulty: 'Intermediate',
    kinematicType: 'row',
    description: 'Eliminates lower back fatigue so the upper and mid-back can be hammered to true muscular failure.',
    formCues: [
      'Chest flush against pad with neck neutral',
      'Drive elbows backward past ribs',
      'Pause at peak contraction for 1 second'
    ]
  },
  {
    id: 'face-pull',
    name: 'Cable Face Pull with External Rotation',
    muscle: 'Back',
    secondaryMuscles: ['Rear Delts', 'Infraspinatus', 'Traps'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '22.5kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 30,
    equipment: 'Cable Station & Rope',
    difficulty: 'Beginner',
    kinematicType: 'row',
    description: 'Premier posture restoration and shoulder health exercise training the rotator cuff and rear delts.',
    formCues: [
      'Set pulley at eye level using double rope attachment',
      'Pull rope towards forehead while rotating hands back above elbows',
      'Spread rope ends apart at back of movement'
    ]
  },
  {
    id: 'straight-arm-pulldown',
    name: 'Straight-Arm Cable Lat Pulldown',
    muscle: 'Back',
    secondaryMuscles: ['Teres Major', 'Core', 'Triceps Long Head'],
    category: 'Hypertrophy',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '25kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 32.5,
    equipment: 'High Pulley & Bar/Rope',
    difficulty: 'Beginner',
    kinematicType: 'pullup',
    description: 'Pure lat isolation without biceps intervention, teaching athletes how to engage lats in deadlifts.',
    formCues: [
      'Hinge hips slightly with arms almost straight',
      'Sweep bar down in wide arc toward thighs',
      'Squeeze lats hard at bottom before resisting upward return'
    ]
  },
  {
    id: 'chest-supported-dumbbell-row',
    name: 'Incline Bench Dumbbell Row',
    muscle: 'Back',
    secondaryMuscles: ['Rhomboids', 'Rear Delts', 'Traps'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '26kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 32,
    equipment: 'Incline Bench & Dumbbells',
    difficulty: 'Beginner',
    kinematicType: 'row',
    description: 'Set bench to 30 degrees to completely eliminate swinging and isolate mid-back musculature.',
    formCues: [
      'Lie face down on incline bench with feet planted',
      'Row dumbbells up pinching shoulder blades together',
      'Lower fully until arms hang straight'
    ]
  },
  {
    id: 'inverted-row',
    name: 'Suspension / Barbell Inverted Row',
    muscle: 'Back',
    secondaryMuscles: ['Core', 'Biceps', 'Grip'],
    category: 'Strength',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 15',
    targetSetsReps: '3 × 15',
    prKg: 0,
    equipment: 'Smith Machine Bar or Rings',
    difficulty: 'Beginner',
    kinematicType: 'row',
    description: 'Horizontal bodyweight pull developing scapular control and core integrity.',
    formCues: [
      'Hang underneath bar with heels on floor and body rigid',
      'Pull chest up until it touches bar',
      'Do not let hips sag or hyperextend'
    ]
  },
  {
    id: 'lat-prayer-pullover',
    name: 'Cable Kneeling Lat Pullover (Prayer)',
    muscle: 'Back',
    secondaryMuscles: ['Lats', 'Serratus'],
    category: 'Hypertrophy',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '25kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 35,
    equipment: 'Cable Station & Bench',
    difficulty: 'Intermediate',
    kinematicType: 'pullup',
    description: 'Kneeling position with elbows on bench producing an unrivaled deep stretch on the latissimus dorsi.',
    formCues: [
      'Rest elbows on bench holding rope attachment above head',
      'Sink hips back to deepen lat stretch',
      'Pull elbows down driving into bench'
    ]
  },

  // ==========================================
  // 4. HAMSTRINGS, GLUTES & HIP HINGE (12 EXERCISES)
  // ==========================================
  {
    id: 'rdl',
    name: 'Romanian Deadlift (RDL)',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Erectors', 'Lats'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '95kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 115,
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    kinematicType: 'hinge',
    description: 'The benchmark posterior chain movement. Stretches hamstrings under loaded eccentric control.',
    formCues: [
      'Unlock knees 15 degrees and freeze knee angle throughout',
      'Push hips straight backward toward wall behind you',
      'Keep barbell skimming down thighs and shins',
      'Drive hips forward to stand tall; squeeze glutes'
    ]
  },
  {
    id: 'barbell-hip-thrust',
    name: 'Barbell Glute Hip Thrust',
    muscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Adductors', 'Core'],
    category: 'Hypertrophy',
    image: '/img/ex-hip-thrust.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '140kg × 10',
    targetSetsReps: '4 × 10',
    prKg: 165,
    equipment: 'Barbell, Pad & Bench',
    difficulty: 'Intermediate',
    kinematicType: 'hinge',
    description: 'Maximal glute peak contraction without spinal shear. The undisputed king of glute hypertrophy.',
    formCues: [
      'Upper back supported against bench edge at lower scapula',
      'Feet shoulder-width with shins vertical at top lockout',
      'Tuck chin and look forward (do not tilt head back)',
      'Drive through heels to full hip extension; pause 1 sec'
    ]
  },
  {
    id: 'deadlift-conventional',
    name: 'Conventional Barbell Deadlift',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Erectors', 'Traps', 'Forearms', 'Core'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '150kg × 5',
    targetSetsReps: '3 × 5',
    prKg: 170,
    equipment: 'Barbell & Bumper Plates',
    difficulty: 'Advanced',
    kinematicType: 'hinge',
    description: 'Ultimate test of raw whole-body pulling power from dead stop on the floor.',
    formCues: [
      'Barbell over mid-foot with shins 2.5cm away',
      'Hinge hips down, grip bar, and pull chest up to wedge into position',
      'Pull slack out of bar before lifting',
      'Push floor away with legs until bar passes knees, then thrust hips'
    ]
  },
  {
    id: 'kettlebell-swing',
    name: 'Hardstyle Kettlebell Swing',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Core', 'Lats', 'Forearms'],
    category: 'HIIT',
    image: '/img/ex-kb-swing.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '28kg × 20',
    targetSetsReps: '4 × 20',
    prKg: 36,
    equipment: 'Kettlebell',
    difficulty: 'Intermediate',
    kinematicType: 'hinge',
    description: 'Ballistic hip hinge developing explosive hip extension power, cardiovascular capacity, and resilient back.',
    formCues: [
      'Hike kettlebell high between thighs like a football snap',
      'Snap hips forward violently to stand tall; contract glutes and abs',
      'Let bell float weightlessly to chest height; do not lift with arms',
      'Wait until bell descends near hips before hinging back'
    ]
  },
  {
    id: 'dumbbell-rdl',
    name: 'Dumbbell Romanian Deadlift',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Lower Back'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '34kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 40,
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    kinematicType: 'hinge',
    description: 'Permits dumbbells to track along lateral sides of legs for optimal comfort and hamstring stretch.',
    formCues: [
      'Keep weights close to legs during hip hinge',
      'Lower until hamstrings are fully loaded without spine rounding',
      'Squeeze glutes to return to upright'
    ]
  },
  {
    id: 'single-leg-hip-thrust',
    name: 'Single-Leg Hip Thrust on Bench',
    muscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Core'],
    category: 'Hypertrophy',
    image: '/img/ex-hip-thrust.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW+16kg × 12 / leg',
    targetSetsReps: '3 × 12 / leg',
    prKg: 24,
    equipment: 'Bench & Kettlebell',
    difficulty: 'Intermediate',
    kinematicType: 'hinge',
    description: 'Eliminates glute asymmetries and pelvic rotation while training unilateral stability.',
    formCues: [
      'Upper back anchored on bench, lift one foot off floor',
      'Drive active heel down into floor to full hip extension',
      'Keep pelvis square without dipping to one side'
    ]
  },
  {
    id: 'lying-leg-curl',
    name: 'Lying Hamstring Leg Curl',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Gastrocnemius'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '50kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 65,
    equipment: 'Lying Leg Curl Machine',
    difficulty: 'Beginner',
    kinematicType: 'hinge',
    description: 'Direct knee-flexion hamstring isolation ensuring complete hamstring development.',
    formCues: [
      'Keep hips pushed firmly down into pad (do not let butt rise)',
      'Curl heels smoothly toward glutes',
      'Lower weight over 3 seconds under strict tension'
    ]
  },
  {
    id: 'seated-leg-curl',
    name: 'Seated Hamstring Leg Curl',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Calves'],
    category: 'Hypertrophy',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '60kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 75,
    equipment: 'Seated Leg Curl Machine',
    difficulty: 'Beginner',
    kinematicType: 'hinge',
    description: 'Places hamstrings in lengthened hip-flexed position, yielding superior hypertrophy stimulus.',
    formCues: [
      'Secure thigh pad snugly across quadriceps',
      'Pull toes up toward shins (dorsiflexion) to reduce calf takeover',
      'Curl heels back as far as possible and pause'
    ]
  },
  {
    id: 'glute-ham-raise',
    name: 'Glute-Ham Developer (GHR)',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Calves', 'Spinal Erectors'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 8',
    targetSetsReps: '3 × 8',
    prKg: 0,
    equipment: 'GHD Bench',
    difficulty: 'Advanced',
    kinematicType: 'hinge',
    description: 'Elite eccentric hamstring exercise that protects against hamstring strains and tears in sprinting.',
    formCues: [
      'Anchor ankles firmly between pads',
      'Lower torso smoothly by extending knees until body is horizontal',
      'Pull through hamstrings and calves to return to upright'
    ]
  },
  {
    id: 'good-morning-barbell',
    name: 'Barbell Good Mornings',
    muscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Lower Back'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '60kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 75,
    equipment: 'Barbell & Rack',
    difficulty: 'Intermediate',
    kinematicType: 'hinge',
    description: 'Reinforces spinal bracing under load while overloading the hip hinge pattern.',
    formCues: [
      'Position bar low on traps with tight upper back shelf',
      'Hinge hips straight back keeping shins nearly vertical',
      'Halt when torso is around 15 degrees above parallel to floor'
    ]
  },
  {
    id: 'hyperextension-45',
    name: '45-Degree Back Extension (Glute Bias)',
    muscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Spinal Erectors'],
    category: 'Hypertrophy',
    image: '/img/ex-hip-thrust.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW+20kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 35,
    equipment: '45-Degree Bench & Plate',
    difficulty: 'Beginner',
    kinematicType: 'hinge',
    description: 'Round upper back and flare feet 45 degrees to channel mechanical tension into glutes.',
    formCues: [
      'Set pad just below hip crease to allow free pelvic flexion',
      'Maintain rounded thoracic spine to disengage erectors',
      'Squeeze glutes to lift torso to straight alignment'
    ]
  },
  {
    id: 'cable-pull-through',
    name: 'Cable Hip Pull-Through',
    muscle: 'Glutes',
    secondaryMuscles: ['Hamstrings'],
    category: 'Hypertrophy',
    image: '/img/ex-kb-swing.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '35kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 45,
    equipment: 'Low Cable & Rope',
    difficulty: 'Beginner',
    kinematicType: 'hinge',
    description: 'Horizontal vector resistance ideal for beginners mastering hip hinge without axial spinal load.',
    formCues: [
      'Straddle rope facing away from pulley',
      'Hinge hips back letting rope pull between legs',
      'Thrust hips forward and squeeze glutes hard at lockout'
    ]
  },

  // ==========================================
  // 5. SHOULDERS & DELTOIDS (12 EXERCISES)
  // ==========================================
  {
    id: 'overhead-press',
    name: 'Standing Barbell Overhead Press (OHP)',
    muscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    category: 'Strength',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '55kg × 5',
    targetSetsReps: '4 × 5',
    prKg: 65,
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    kinematicType: 'overhead',
    description: 'The definitive test of vertical pushing strength. Builds 3D shoulders, trap support, and core rigidity.',
    formCues: [
      'Grip bar just outside shoulders with forearms vertical',
      'Squeeze glutes, quads, and abs into rock-solid pillar',
      'Pull chin back, press bar straight up clearing forehead',
      'Lock out overhead with shrug of upper traps'
    ]
  },
  {
    id: 'seated-dumbbell-shoulder-press',
    name: 'Seated Dumbbell Shoulder Press',
    muscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Traps'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '26kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 32,
    equipment: 'Dumbbells & 75° Bench',
    difficulty: 'Intermediate',
    kinematicType: 'overhead',
    description: 'High-stability shoulder mass builder providing independent arm tracking and comfortable range.',
    formCues: [
      'Set bench angle at 75-80 degrees (not completely vertical)',
      'Lower dumbbells until handles touch top of shoulders',
      'Press upward in slight arc meeting over crown of head'
    ]
  },
  {
    id: 'arnold-press',
    name: 'Dumbbell Arnold Press',
    muscle: 'Shoulders',
    secondaryMuscles: ['Anterior & Lateral Delts', 'Triceps'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '20kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 24,
    equipment: 'Dumbbells & Bench',
    difficulty: 'Intermediate',
    kinematicType: 'overhead',
    description: 'Rotational press named after Schwarzenegger that hits anterior and lateral heads in one fluid arc.',
    formCues: [
      'Start with palms facing chest at chin level',
      'Rotate wrists outward as you press upward over head',
      'Finish with palms facing forward at full lockout'
    ]
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Standing Dumbbell Lateral Raise',
    muscle: 'Shoulders',
    secondaryMuscles: ['Lateral Deltoids', 'Traps'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '14kg × 15',
    targetSetsReps: '4 × 15',
    prKg: 18,
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    kinematicType: 'overhead',
    description: 'Creates lateral shoulder width and the coveted 3D cannonball deltoid silhouette.',
    formCues: [
      'Lean torso forward 10 degrees to align with scapular plane',
      'Lead with elbows and pinkies slightly elevated',
      'Raise to shoulder height without swinging or shrugging traps'
    ]
  },
  {
    id: 'cable-lateral-raise',
    name: 'Behind-the-Back Cable Lateral Raise',
    muscle: 'Shoulders',
    secondaryMuscles: ['Lateral Deltoid'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '10kg × 15 / arm',
    targetSetsReps: '3 × 15 / arm',
    prKg: 12.5,
    equipment: 'Low Cable Station',
    difficulty: 'Beginner',
    kinematicType: 'overhead',
    description: 'Cables provide resistance at the bottom stretch where dumbbells offer zero mechanical tension.',
    formCues: [
      'Set pulley at knee height, cable running behind body',
      'Raise arm diagonally forward in the scapular plane',
      'Control lowering phase over 2 seconds'
    ]
  },
  {
    id: 'rear-delt-fly-dumbbell',
    name: 'Chest-Supported Rear Delt Dumbbell Fly',
    muscle: 'Shoulders',
    secondaryMuscles: ['Rear Deltoids', 'Rhomboids'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '12kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 16,
    equipment: 'Incline Bench & Dumbbells',
    difficulty: 'Beginner',
    kinematicType: 'row',
    description: 'Isolates the posterior deltoid head to ensure shoulder balance and prevent rounded posture.',
    formCues: [
      'Lie face down on 30-degree incline bench',
      'Raise dumbbells out to sides with pinkies leading',
      'Do not pinch shoulder blades together; focus purely on back of shoulder'
    ]
  },
  {
    id: 'reverse-cable-crossover',
    name: 'Reverse Cable Fly (High Pulleys)',
    muscle: 'Shoulders',
    secondaryMuscles: ['Rear Deltoids', 'Traps'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '7.5kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 10,
    equipment: 'Dual Cable Station',
    difficulty: 'Intermediate',
    kinematicType: 'row',
    description: 'Cross-cable setup providing smooth continuous resistance against horizontal shoulder abduction.',
    formCues: [
      'Grab left cable with right hand and right cable with left without attachments',
      'Pull arms horizontally apart until arms are in line with torso',
      'Feel intense contraction across rear shoulder head'
    ]
  },
  {
    id: 'upright-row-cable',
    name: 'Wide-Grip Cable Upright Row',
    muscle: 'Shoulders',
    secondaryMuscles: ['Lateral Deltoids', 'Traps'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '35kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 45,
    equipment: 'Cable Station & Straight Bar',
    difficulty: 'Intermediate',
    kinematicType: 'row',
    description: 'Wide grip (1.5x shoulder width) eliminates subacromial impingement while destroying the lateral deltoids.',
    formCues: [
      'Grip bar wide; pull bar to mid-chest level',
      'Lead with elbows flared out high',
      'Lower smoothly to starting hang'
    ]
  },
  {
    id: 'lean-away-cable-raise',
    name: 'Lean-Away Cable Lateral Raise',
    muscle: 'Shoulders',
    secondaryMuscles: ['Lateral Deltoids'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '10kg × 12 / arm',
    targetSetsReps: '3 × 12 / arm',
    prKg: 15,
    equipment: 'Cable Machine Tower',
    difficulty: 'Intermediate',
    kinematicType: 'overhead',
    description: 'Leaning away increases the range of motion and shifts the peak tension curve.',
    formCues: [
      'Hold tower upright with one hand and lean body outward at 20 degrees',
      'Raise arm smoothly to parallel with floor',
      'Do not rock torso to generate momentum'
    ]
  },
  {
    id: 'push-press-barbell',
    name: 'Barbell Push Press',
    muscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Quads', 'Core', 'Glutes'],
    category: 'Strength',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '75kg × 5',
    targetSetsReps: '4 × 4',
    prKg: 85,
    equipment: 'Barbell',
    difficulty: 'Advanced',
    kinematicType: 'overhead',
    description: 'Explosive dip-and-drive transfer from legs to lock out maximal vertical tonnage overhead.',
    formCues: [
      'Dip knees 10cm keeping torso vertical',
      'Drive aggressively through legs to propel bar off collarbones',
      'Punch under bar locking arms out with head pushed through'
    ]
  },
  {
    id: 'dumbbell-front-raise',
    name: 'Alternating Dumbbell Front Raise',
    muscle: 'Shoulders',
    secondaryMuscles: ['Anterior Deltoids'],
    category: 'Hypertrophy',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '12kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 16,
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    kinematicType: 'overhead',
    description: 'Isolates the anterior deltoid head with controlled shoulder flexion.',
    formCues: [
      'Hold dumbbells on thighs with neutral grip',
      'Raise one arm at a time to eye level',
      'Lower under strict eccentric control without swaying'
    ]
  },
  {
    id: 'handstand-pushup',
    name: 'Wall-Supported Handstand Push-Up',
    muscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Traps', 'Core'],
    category: 'Strength',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 8',
    targetSetsReps: '3 × 6',
    prKg: 0,
    equipment: 'Wall & Mat',
    difficulty: 'Advanced',
    kinematicType: 'overhead',
    description: 'Elite calisthenic pressing skill demanding supreme overhead strength and balance.',
    formCues: [
      'Kick up to handstand with heels resting gently on wall',
      'Lower head down into tripod position ahead of hands',
      'Press through palms back to full lockout'
    ]
  },

  // ==========================================
  // 6. ARMS - BICEPS & TRICEPS (14 EXERCISES)
  // ==========================================
  {
    id: 'barbell-bicep-curl',
    name: 'Standing Barbell Bicep Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    category: 'Hypertrophy',
    image: '/img/ex-bicep-curl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '40kg × 8',
    targetSetsReps: '3 × 8',
    prKg: 50,
    equipment: 'Olympic Barbell or EZ-Bar',
    difficulty: 'Intermediate',
    kinematicType: 'curl',
    description: 'Heavy compound curl for arm thickness and overall biceps peak development.',
    formCues: [
      'Shoulder-width underhand grip with elbows pinned to sides',
      'Curl bar up in smooth arc without swinging hips or shoulders',
      'Squeeze biceps hard at top contraction for 1 second',
      'Lower bar over 3 seconds to complete elbow extension'
    ]
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Bench Dumbbell Curl (45°)',
    muscle: 'Biceps',
    secondaryMuscles: ['Long Head Biceps'],
    category: 'Hypertrophy',
    image: '/img/ex-bicep-curl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '16kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 20,
    equipment: 'Dumbbells & 45° Bench',
    difficulty: 'Intermediate',
    kinematicType: 'curl',
    description: 'Places long head of biceps in maximal passive stretch behind torso for towering arm peaks.',
    formCues: [
      'Set bench to 45 degrees, arms hanging completely straight',
      'Curl dumbbells while supinating wrists (pinkies rotating out)',
      'Keep elbows stationary behind the torso plane throughout'
    ]
  },
  {
    id: 'hammer-curl',
    name: 'Standing Dumbbell Hammer Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Brachialis', 'Brachioradialis'],
    category: 'Hypertrophy',
    image: '/img/ex-bicep-curl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '18kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 22,
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    kinematicType: 'curl',
    description: 'Neutral palms-in grip targeting the deep brachialis muscle to push the biceps peak outward.',
    formCues: [
      'Palms face inward toward each other throughout movement',
      'Curl weights upward without swinging torso',
      'Control lowering phase smoothly'
    ]
  },
  {
    id: 'preacher-curl',
    name: 'EZ-Bar Preacher Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Short Head Biceps'],
    category: 'Hypertrophy',
    image: '/img/ex-bicep-curl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '35kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 42.5,
    equipment: 'Preacher Bench & EZ-Bar',
    difficulty: 'Intermediate',
    kinematicType: 'curl',
    description: 'Armpits glued to pad eliminating any shoulder momentum; creates intense pump in lower biceps.',
    formCues: [
      'Lock armpits firmly over top ridge of preacher bench',
      'Curl bar up to chin level',
      'Lower carefully stopping just 5 degrees short of full hyperextension'
    ]
  },
  {
    id: 'cable-bayesian-curl',
    name: 'Bayesian Cable Curl (Behind Body)',
    muscle: 'Biceps',
    secondaryMuscles: ['Long Head Biceps'],
    category: 'Hypertrophy',
    image: '/img/ex-bicep-curl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '12.5kg × 12 / arm',
    targetSetsReps: '3 × 12 / arm',
    prKg: 17.5,
    equipment: 'Low Cable Station',
    difficulty: 'Intermediate',
    kinematicType: 'curl',
    description: 'Facing away from cable creates continuous tension in the lengthened position.',
    formCues: [
      'Step forward from low pulley with arm trailing behind torso',
      'Curl handle forward keeping elbow pinned back',
      'Feel extreme stretch at full bottom reach'
    ]
  },
  {
    id: 'spider-curl',
    name: 'Prone Incline Spider Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Short Head Biceps'],
    category: 'Hypertrophy',
    image: '/img/ex-bicep-curl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '14kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 18,
    equipment: 'Incline Bench & EZ-Bar',
    difficulty: 'Intermediate',
    kinematicType: 'curl',
    description: 'Lie chest-down on incline bench with arms hanging vertically for peak shortened contraction.',
    formCues: [
      'Chest supported on pad, arms hanging straight down',
      'Curl bar directly upward towards forehead',
      'Squeeze biceps peak at top for 2 seconds'
    ]
  },
  {
    id: 'tricep-pushdown-rope',
    name: 'Cable Triceps Rope Pushdown',
    muscle: 'Triceps',
    secondaryMuscles: ['Lateral Head', 'Medial Head'],
    category: 'Hypertrophy',
    image: '/img/ex-tricep-pushdown.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '30kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 37.5,
    equipment: 'Cable Station & Rope',
    difficulty: 'Beginner',
    kinematicType: 'triceps',
    description: 'Allows hands to separate at bottom for peak contraction of the lateral triceps horseshoe.',
    formCues: [
      'Pin elbows firmly to sides of ribcage',
      'Push rope down smoothly until arms are locked out',
      'Spread rope ends apart at bottom squeezing triceps hard',
      'Return weight up to 90 degrees before next rep'
    ]
  },
  {
    id: 'skull-crusher',
    name: 'Lying EZ-Bar Skull Crushers',
    muscle: 'Triceps',
    secondaryMuscles: ['Long Head Triceps'],
    category: 'Hypertrophy',
    image: '/img/ex-tricep-pushdown.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '35kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 45,
    equipment: 'Flat Bench & EZ-Bar',
    difficulty: 'Intermediate',
    kinematicType: 'triceps',
    description: 'Overloads the long head of the triceps across both shoulder and elbow joint angles.',
    formCues: [
      'Lie on bench with arms angled 15 degrees back from vertical',
      'Bend only at elbows to lower bar toward crown of head',
      'Extend elbows powerfully back to starting angle'
    ]
  },
  {
    id: 'close-grip-bench-press',
    name: 'Close-Grip Barbell Bench Press',
    muscle: 'Triceps',
    secondaryMuscles: ['Chest', 'Anterior Delts'],
    category: 'Strength',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '75kg × 8',
    targetSetsReps: '4 × 6',
    prKg: 90,
    equipment: 'Barbell & Bench',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Heavy compound mass builder for triceps using shoulder-width grip.',
    formCues: [
      'Grip bar shoulder-width apart (avoid excessively narrow grips)',
      'Keep elbows tucked close to ribcage on descent',
      'Press through palms focusing on triceps extension at top'
    ]
  },
  {
    id: 'overhead-cable-extension',
    name: 'Overhead Cable Triceps Extension',
    muscle: 'Triceps',
    secondaryMuscles: ['Long Head Triceps'],
    category: 'Hypertrophy',
    image: '/img/ex-tricep-pushdown.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '25kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 32.5,
    equipment: 'Cable Station & Rope',
    difficulty: 'Intermediate',
    kinematicType: 'triceps',
    description: 'Full overhead stretch position creating maximal stretch-mediated hypertrophy in long head.',
    formCues: [
      'Face away from cable with staggered stance and leaned torso',
      'Allow hands to drift behind head for deep stretch',
      'Extend arms straight forward locking out triceps'
    ]
  },
  {
    id: 'straight-bar-pushdown',
    name: 'Cable Straight-Bar Pushdown',
    muscle: 'Triceps',
    secondaryMuscles: ['Lateral & Medial Heads'],
    category: 'Hypertrophy',
    image: '/img/ex-tricep-pushdown.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '35kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 45,
    equipment: 'Cable Station & Straight Bar',
    difficulty: 'Beginner',
    kinematicType: 'triceps',
    description: 'Allows heavy loading on the medial and lateral triceps heads with rigid bar support.',
    formCues: [
      'Overhand grip with thumbs wrapped over bar',
      'Keep upper body tilted slightly forward',
      'Push bar down to touch top of thighs'
    ]
  },
  {
    id: 'parallel-bar-tricep-dips',
    name: 'Upright Parallel Bar Dips (Triceps Bias)',
    muscle: 'Triceps',
    secondaryMuscles: ['Anterior Delts', 'Chest'],
    category: 'Strength',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW+15kg × 10',
    targetSetsReps: '3 × 10',
    prKg: 25,
    equipment: 'Parallel Dip Bars',
    difficulty: 'Intermediate',
    kinematicType: 'bench',
    description: 'Keep torso completely vertical to shift primary loading from chest directly onto triceps.',
    formCues: [
      'Maintain an upright spine throughout descent',
      'Keep elbows tucked close to sides',
      'Push up to full elbow lockout'
    ]
  },
  {
    id: 'cross-body-cable-extension',
    name: 'Dual Cross-Body Cable Triceps Extension',
    muscle: 'Triceps',
    secondaryMuscles: ['Lateral Head Triceps'],
    category: 'Hypertrophy',
    image: '/img/ex-tricep-pushdown.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '10kg × 15 / arm',
    targetSetsReps: '3 × 15 / arm',
    prKg: 15,
    equipment: 'Dual Cable Station',
    difficulty: 'Intermediate',
    kinematicType: 'triceps',
    description: 'Aligns line of pull precisely with the natural angle of the triceps fibers for zero elbow friction.',
    formCues: [
      'Grab opposite cables without attachments',
      'Extend arms downward and outward along natural arm angle',
      'Lock out arms completely at bottom'
    ]
  },
  {
    id: 'wrist-curls-barbell',
    name: 'Seated Barbell Wrist Curls',
    muscle: 'Forearms',
    secondaryMuscles: ['Wrist Flexors', 'Grip'],
    category: 'Hypertrophy',
    image: '/img/ex-bicep-curl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '30kg × 20',
    targetSetsReps: '3 × 20',
    prKg: 40,
    equipment: 'Barbell & Bench',
    difficulty: 'Beginner',
    kinematicType: 'curl',
    description: 'Builds dense, muscular forearms and iron-tight crushing grip strength.',
    formCues: [
      'Rest forearms on thighs with wrists hanging over knees',
      'Let bar roll down onto fingertips, then curl wrist all the way up',
      'Hold squeeze at top for 1 second'
    ]
  },

  // ==========================================
  // 7. CORE, ABS & SPINAL STABILITY (14 EXERCISES)
  // ==========================================
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise (Toes to Bar)',
    muscle: 'Core',
    secondaryMuscles: ['Hip Flexors', 'Lats', 'Grip'],
    category: 'Core',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 12',
    targetSetsReps: '3 × 12',
    prKg: 0,
    equipment: 'Pull-up Bar',
    difficulty: 'Advanced',
    kinematicType: 'core',
    description: 'Elite lower abdominal and core compression movement demanding pelvic tilt and lat engagement.',
    formCues: [
      'Hang from bar with active shoulders engaged',
      'Initiate lift by tilting pelvis posterior; do not swing legs',
      'Raise straight legs smoothly until toes touch the bar',
      'Control lowering phase over 3 seconds without swinging'
    ]
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Kneeling Ab Wheel Rollout',
    muscle: 'Core',
    secondaryMuscles: ['Lats', 'Shoulders', 'Hip Flexors'],
    category: 'Core',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 15',
    targetSetsReps: '3 × 12',
    prKg: 0,
    equipment: 'Ab Wheel Roller',
    difficulty: 'Intermediate',
    kinematicType: 'core',
    description: 'Supreme anti-extension core builder generating massive intra-abdominal pressure.',
    formCues: [
      'Tuck pelvis under into posterior tilt (hollow body posture)',
      'Roll wheel forward while keeping hips extended',
      'Descend until chest hovers just 5cm above floor',
      'Pull back using abs and lats without sitting back on heels'
    ]
  },
  {
    id: 'cable-woodchopper',
    name: 'High-to-Low Cable Woodchopper',
    muscle: 'Core',
    secondaryMuscles: ['Obliques', 'Shoulders', 'Hips'],
    category: 'Core',
    image: '/img/ex-kb-swing.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '25kg × 12 / side',
    targetSetsReps: '3 × 12 / side',
    prKg: 35,
    equipment: 'Cable Station & D-Handle',
    difficulty: 'Intermediate',
    kinematicType: 'core',
    description: 'Dynamic rotational power transfer linking hips, obliques, and shoulder girdle.',
    formCues: [
      'Grip handle with arms straight; rotate through hips and thoracic spine',
      'Chop diagonally across body down toward opposite knee',
      'Pivot on rear foot and engage core at finish'
    ]
  },
  {
    id: 'forearm-plank',
    name: 'Hardstyle RKC Forearm Plank',
    muscle: 'Core',
    secondaryMuscles: ['Glutes', 'Quads', 'Shoulders'],
    category: 'Core',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '60s hold',
    targetSetsReps: '3 × 45s max contraction',
    prKg: 0,
    equipment: 'Exercise Mat',
    difficulty: 'Beginner',
    kinematicType: 'core',
    description: 'Active tension plank pulling elbows toward toes to create maximal muscle irradiation.',
    formCues: [
      'Forearms parallel on floor with fists clenched tight',
      'Contract quads, glutes, and abdominals at 100% intensity',
      'Maintain flat straight line from ear to ankle'
    ]
  },
  {
    id: 'pallof-press',
    name: 'Half-Kneeling Cable Pallof Press',
    muscle: 'Core',
    secondaryMuscles: ['Obliques', 'Glute Medius'],
    category: 'Core',
    image: '/img/ex-kb-swing.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '17.5kg × 12 / side',
    targetSetsReps: '3 × 12 / side',
    prKg: 25,
    equipment: 'Cable Station & D-Handle',
    difficulty: 'Beginner',
    kinematicType: 'core',
    description: 'Premier anti-rotation exercise training spine to resist shear and rotational forces.',
    formCues: [
      'Hold handle at center of sternum, perpendicular to cable',
      'Press hands straight out in front of chest without twisting',
      'Hold extended position for 2 seconds before returning'
    ]
  },
  {
    id: 'dragon-flag',
    name: 'Strict Bruce Lee Dragon Flag',
    muscle: 'Core',
    secondaryMuscles: ['Lats', 'Glutes', 'Lower Back'],
    category: 'Core',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 6',
    targetSetsReps: '3 × 5',
    prKg: 0,
    equipment: 'Sturdy Flat Bench',
    difficulty: 'Advanced',
    kinematicType: 'core',
    description: 'Legendary advanced core feat supporting entire bodyweight from only upper back and shoulders.',
    formCues: [
      'Grip bench edges firmly behind head',
      'Lock body into rigid rod from shoulders to toes',
      'Raise entire body upward onto shoulder blades',
      'Lower body slowly without breaking at hips'
    ]
  },
  {
    id: 'russian-twists-weighted',
    name: 'Elevated-Leg Weighted Russian Twists',
    muscle: 'Core',
    secondaryMuscles: ['Obliques', 'Hip Flexors'],
    category: 'Core',
    image: '/img/ex-kb-swing.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '12kg × 20',
    targetSetsReps: '3 × 20',
    prKg: 18,
    equipment: 'Medicine Ball or Plate',
    difficulty: 'Intermediate',
    kinematicType: 'core',
    description: 'Transverse rotational endurance and isometric hip flexor endurance.',
    formCues: [
      'Sit in V-shape with feet hovering 10cm off floor',
      'Rotate plate across body touching floor on each side',
      'Control torso twist without flailing legs'
    ]
  },
  {
    id: 'hollow-body-hold',
    name: 'Gymnastic Hollow Body Hold',
    muscle: 'Core',
    secondaryMuscles: ['Transverse Abdominis', 'Hip Flexors'],
    category: 'Core',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '45s hold',
    targetSetsReps: '3 × 40s',
    prKg: 0,
    equipment: 'Mat',
    difficulty: 'Intermediate',
    kinematicType: 'core',
    description: 'Fundamental calisthenic hollow rock shape pressing lower back flush against the ground.',
    formCues: [
      'Lie flat; press lumbar spine hard against the floor',
      'Extend arms overhead and legs straight, hovering 15cm high',
      'Hold banana shape without letting lower back arch off floor'
    ]
  },
  {
    id: 'cable-kneeling-crunch',
    name: 'Kneeling Cable Rope Crunch',
    muscle: 'Core',
    secondaryMuscles: ['Upper & Lower Abs'],
    category: 'Core',
    image: '/img/ex-tricep-pushdown.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '45kg × 15',
    targetSetsReps: '3 × 15',
    prKg: 60,
    equipment: 'Cable Station & Rope',
    difficulty: 'Beginner',
    kinematicType: 'core',
    description: 'Direct progressive overload for the rectus abdominis without hip flexor takeover.',
    formCues: [
      'Kneel holding rope ends pinned against crown of head',
      'Keep hips stationary and flex spine drawing ribs down to pelvis',
      'Contract abs violently at bottom before returning'
    ]
  },
  {
    id: 'side-plank-reach',
    name: 'Side Plank with Rotational Reach',
    muscle: 'Core',
    secondaryMuscles: ['Obliques', 'Glute Medius', 'Shoulders'],
    category: 'Core',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 12 / side',
    targetSetsReps: '3 × 10 / side',
    prKg: 0,
    equipment: 'Mat',
    difficulty: 'Beginner',
    kinematicType: 'core',
    description: 'Lateral core endurance combined with thoracic rotational stability.',
    formCues: [
      'Stack elbow under shoulder with straight line through hips and feet',
      'Thread top hand under torso, then reach straight up to ceiling',
      'Keep hips lifted high away from floor'
    ]
  },
  {
    id: 'captains-chair-knee-raise',
    name: "Captain's Chair Knee Tuck",
    muscle: 'Core',
    secondaryMuscles: ['Hip Flexors', 'Lower Abs'],
    category: 'Core',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 15',
    targetSetsReps: '3 × 15',
    prKg: 0,
    equipment: "Captain's Chair Station",
    difficulty: 'Beginner',
    kinematicType: 'core',
    description: 'Supported forearm station allowing strict pelvic curling without grip fatigue.',
    formCues: [
      'Rest forearms on pads with back flat against backrest',
      'Pull knees up to chest, tilting pelvis upward at top',
      'Lower slowly without letting legs swing behind'
    ]
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug Cross-Body Contralateral',
    muscle: 'Core',
    secondaryMuscles: ['Transverse Abdominis', 'Shoulders'],
    category: 'Core',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 12 / side',
    targetSetsReps: '3 × 12 / side',
    prKg: 0,
    equipment: 'Mat',
    difficulty: 'Beginner',
    kinematicType: 'core',
    description: 'Gold standard rehabilitation and trunk control drill coordinating opposing limbs.',
    formCues: [
      'Lie on back with arms pointing to ceiling and knees at 90 degrees',
      'Lower opposite arm and leg simultaneously towards floor',
      'Ensure lower back stays glued to floor throughout'
    ]
  },
  {
    id: 'bird-dog-hold',
    name: 'Quadruped Bird-Dog with 3s Pause',
    muscle: 'Core',
    secondaryMuscles: ['Glutes', 'Upper Back', 'Spinal Erectors'],
    category: 'Core',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 10 / side',
    targetSetsReps: '3 × 10 / side',
    prKg: 0,
    equipment: 'Mat',
    difficulty: 'Beginner',
    kinematicType: 'core',
    description: 'Stabilizes the lumbar spine against rotational forces while activating glutes and lats.',
    formCues: [
      'All fours position with hands under shoulders and knees under hips',
      'Reach right arm forward and left leg backward until parallel to floor',
      'Hold top for 3 seconds without letting hips tilt'
    ]
  },
  {
    id: 'decline-weighted-situp',
    name: 'Decline Bench Weighted Sit-Up',
    muscle: 'Core',
    secondaryMuscles: ['Hip Flexors', 'Upper Abs'],
    category: 'Core',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '15kg × 12',
    targetSetsReps: '3 × 12',
    prKg: 25,
    equipment: 'Decline Bench & Weight Plate',
    difficulty: 'Intermediate',
    kinematicType: 'core',
    description: 'Increased gravitational angle for loaded abdominal crunching power.',
    formCues: [
      'Hook feet under pads, hold plate tight to upper chest',
      'Descend slowly rolling spine vertebrae by vertebrae',
      'Curl forward using abs; avoid pulling with neck'
    ]
  },

  // ==========================================
  // 8. MOBILITY, PREHAB & FLEXIBILITY (14 EXERCISES)
  // ==========================================
  {
    id: '90-90-hip-mobility',
    name: '90/90 Hip Mobility Flow',
    muscle: 'Hips',
    secondaryMuscles: ['Glutes', 'Adductors', 'Psoas'],
    category: 'Mobility',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '3 min flow',
    targetSetsReps: '3 × 60s / side',
    prKg: 0,
    equipment: 'Yoga Mat',
    difficulty: 'Beginner',
    kinematicType: 'mobility',
    description: 'Premier hip internal and external rotation flow unlocking deep squat depth and bulletproofing lower back.',
    formCues: [
      'Front leg and back leg bent at 90-degree angles on floor',
      'Sit tall and hinge forward over front shin with straight spine',
      'Transition smoothly to opposite side using active hip control'
    ]
  },
  {
    id: 'worlds-greatest-stretch',
    name: "World's Greatest Stretch",
    muscle: 'Full Body',
    secondaryMuscles: ['Thoracic Spine', 'Hip Flexors', 'Hamstrings', 'Groin'],
    category: 'Mobility',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '5 reps / side',
    targetSetsReps: '2 × 5 / side',
    prKg: 0,
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    kinematicType: 'mobility',
    description: 'Dynamic movement sequence opening hips, thoracic rotation, hamstrings, and ankles in one seamless drill.',
    formCues: [
      'Step into deep lunge with back leg straight and glute contracted',
      'Drop inside elbow down toward floor next to front instep',
      'Rotate arm up to ceiling following hand with eyes'
    ]
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Spinal Articulation',
    muscle: 'Spine',
    secondaryMuscles: ['Neck', 'Shoulders', 'Pelvis'],
    category: 'Mobility',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '10 cycles',
    targetSetsReps: '2 × 10 cycles',
    prKg: 0,
    equipment: 'Mat',
    difficulty: 'Beginner',
    kinematicType: 'mobility',
    description: 'Segmental spinal movement transitioning between flexion and extension to lubricate intervertebral discs.',
    formCues: [
      'On all fours, inhale as belly drops and gaze lifts into Cow',
      'Exhale as you tuck tailbone and round spine up to ceiling into Cat',
      'Move segment by segment from sacrum up to cervical spine'
    ]
  },
  {
    id: 'deep-squat-thoracic-rotation',
    name: 'Deep Squat with Thoracic Reach',
    muscle: 'Thoracic Spine',
    secondaryMuscles: ['Hips', 'Ankles', 'Groin'],
    category: 'Mobility',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '8 reps / side',
    targetSetsReps: '2 × 8 / side',
    prKg: 0,
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    kinematicType: 'mobility',
    description: 'Sits in deep resting squat while rotating upper spine to mobilize thoracic spine for overhead squats.',
    formCues: [
      'Sink into deepest resting squat with heels flat on floor',
      'Grab opposite ankle with one hand for leverage',
      'Reach opposite arm up to ceiling rotating through upper torso'
    ]
  },
  {
    id: 'couch-stretch',
    name: 'Kelly Starrett Couch Stretch',
    muscle: 'Hip Flexors',
    secondaryMuscles: ['Quadriceps', 'Psoas'],
    category: 'Mobility',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '2 min / side',
    targetSetsReps: '2 × 90s / side',
    prKg: 0,
    equipment: 'Wall or Box & Mat',
    difficulty: 'Intermediate',
    kinematicType: 'mobility',
    description: 'Intense hip extension mobilization reversing the postural damage of chronic sitting.',
    formCues: [
      'Back shin vertical against wall with knee as close to wall as possible',
      'Step other foot forward into lunge stance',
      'Squeeze rear glute violently to extend hip before sitting upright'
    ]
  },
  {
    id: 'pigeon-pose-stretch',
    name: 'Elevated Pigeon Pose Stretch',
    muscle: 'Glutes',
    secondaryMuscles: ['Piriformis', 'IT Band'],
    category: 'Mobility',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '90s hold / side',
    targetSetsReps: '2 × 60s / side',
    prKg: 0,
    equipment: 'Flat Bench or Mat',
    difficulty: 'Beginner',
    kinematicType: 'mobility',
    description: 'Deep external rotation stretch opening deep hip rotators and alleviating sciatic tension.',
    formCues: [
      'Place front shin horizontal across flat bench or mat',
      'Extend rear leg straight behind keeping hips level',
      'Hinge forward from hips keeping chest proud'
    ]
  },
  {
    id: 'shoulder-dislocates',
    name: 'Resistance Band Shoulder Dislocates',
    muscle: 'Shoulders',
    secondaryMuscles: ['Chest', 'Traps', 'Biceps Tendon'],
    category: 'Mobility',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '15 passes',
    targetSetsReps: '2 × 15 passes',
    prKg: 0,
    equipment: 'Resistance Band or PVC Pipe',
    difficulty: 'Beginner',
    kinematicType: 'mobility',
    description: 'Rotates shoulder girdle through full 360-degree circumduction for overhead pressing readiness.',
    formCues: [
      'Hold band wide with straight arms in front of hips',
      'Raise band overhead and pass all the way behind to touch lower back',
      'Keep arms straight without shrugging shoulders up'
    ]
  },
  {
    id: 'ankle-dorsiflexion-wall-drive',
    name: 'Half-Kneeling Ankle Dorsiflexion Wall Drive',
    muscle: 'Calves',
    secondaryMuscles: ['Soleus', 'Achilles Tendon'],
    category: 'Mobility',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '15 pulses / side',
    targetSetsReps: '2 × 15 / side',
    prKg: 0,
    equipment: 'Wall & Mat',
    difficulty: 'Beginner',
    kinematicType: 'mobility',
    description: 'Mobilizes the talocrural joint to allow knees to track far over toes in deep squats without heel lift.',
    formCues: [
      'Toes placed 10cm from wall in half-kneeling stance',
      'Drive knee straight forward over middle toe until touching wall',
      'Keep front heel glued flat to floor during each pulse'
    ]
  },
  {
    id: 'thread-the-needle',
    name: 'Quadruped Thread the Needle',
    muscle: 'Thoracic Spine',
    secondaryMuscles: ['Shoulders', 'Upper Back'],
    category: 'Mobility',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '10 reps / side',
    targetSetsReps: '2 × 8 / side',
    prKg: 0,
    equipment: 'Mat',
    difficulty: 'Beginner',
    kinematicType: 'mobility',
    description: 'Rotational thoracic mobility releasing tension across mid-back and posterior shoulder capsule.',
    formCues: [
      'From hands and knees, reach right arm under left armpit',
      'Rest right shoulder and temple gently onto floor',
      'Exhale and sink deeper into the rotational stretch'
    ]
  },
  {
    id: 'cossack-squat-mobility',
    name: 'Bodyweight Cossack Squat',
    muscle: 'Adductors',
    secondaryMuscles: ['Glutes', 'Ankles', 'Hamstrings'],
    category: 'Mobility',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '8 reps / side',
    targetSetsReps: '3 × 8 / side',
    prKg: 0,
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    kinematicType: 'lunge',
    description: 'Frontal plane lateral lunge mobilizing groin, adductors, and deep ankle dorsiflexion.',
    formCues: [
      'Take wide stance, descend to one side while keeping heel flat',
      'Opposite leg stays completely straight with toes pointing up to ceiling',
      'Keep chest upright and push back through heel to switch sides'
    ]
  },
  {
    id: 'prone-y-t-w',
    name: 'Prone Y-T-W Scapular Raises',
    muscle: 'Upper Back',
    secondaryMuscles: ['Lower Traps', 'Rhomboids', 'Rear Delts'],
    category: 'Mobility',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '10 reps each position',
    targetSetsReps: '2 × 10 each',
    prKg: 0,
    equipment: 'Floor Mat',
    difficulty: 'Beginner',
    kinematicType: 'mobility',
    description: 'Strengthens lower and middle trapezius for pristine shoulder mechanics during bench and overhead pressing.',
    formCues: [
      'Lie face down with forehead on small rolled towel',
      'Form Y shape with thumbs up, raise arms squeezing lower traps',
      'Transition to T shape, then W shape holding each lift 2 seconds'
    ]
  },
  {
    id: 'scorpion-stretch',
    name: 'Prone Scorpion Stretch',
    muscle: 'Hips',
    secondaryMuscles: ['Chest', 'Lower Back', 'Hip Flexors'],
    category: 'Mobility',
    image: '/img/ex-sumo-squat-3d.png',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '8 reps / side',
    targetSetsReps: '2 × 8 / side',
    prKg: 0,
    equipment: 'Mat',
    difficulty: 'Intermediate',
    kinematicType: 'mobility',
    description: 'Rotational hip and torso opener mobilizing the anterior hip capsule and pectoral girdle.',
    formCues: [
      'Lie face down with arms outstretched in T position',
      'Lift left heel and reach it across body toward right hand',
      'Keep chest as close to floor as comfortable while rotating hips'
    ]
  },
  {
    id: 'jefferson-curl',
    name: 'Loaded Jefferson Curl',
    muscle: 'Spine',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Calves'],
    category: 'Mobility',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '16kg × 8',
    targetSetsReps: '3 × 6',
    prKg: 24,
    equipment: 'Box & Light Kettlebell',
    difficulty: 'Advanced',
    kinematicType: 'hinge',
    description: 'Controlled spinal flexion strengthening posterior chain through full vertebrate segmentation.',
    formCues: [
      'Stand on box holding light weight',
      'Tuck chin to chest, roll down one vertebra at a time',
      'Descend past toes feeling hamstrings and back lengthen',
      'Roll back up reversing order keeping legs straight'
    ]
  },
  {
    id: 'banded-ankle-distraction',
    name: 'Banded Ankle Joint Distraction',
    muscle: 'Ankles',
    secondaryMuscles: ['Achilles', 'Calves'],
    category: 'Mobility',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '2 min / side',
    targetSetsReps: '2 × 60s / side',
    prKg: 0,
    equipment: 'Heavy Resistance Band & Rig',
    difficulty: 'Intermediate',
    kinematicType: 'mobility',
    description: 'Applies joint traction to talus bone clearing anterior ankle pinching in deep squats.',
    formCues: [
      'Loop heavy band around rig and step into band at talus crease below malleoli',
      'Step forward into lunge with high band tension pulling backward',
      'Drive knee forward over toes repeatedly'
    ]
  },

  // ==========================================
  // 9. CALISTHENICS & OLYMPIC LIFTS (10 EXERCISES)
  // ==========================================
  {
    id: 'clean-and-jerk',
    name: 'Barbell Clean and Jerk',
    muscle: 'Full Body',
    secondaryMuscles: ['Quads', 'Glutes', 'Traps', 'Shoulders', 'Triceps'],
    category: 'Strength',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '85kg × 2',
    targetSetsReps: '5 × 2',
    prKg: 100,
    equipment: 'Olympic Barbell & Bumpers',
    difficulty: 'Advanced',
    kinematicType: 'overhead',
    description: 'The ultimate Olympic weightlifting test of explosive triple extension and overhead mastery.',
    formCues: [
      'Explosive first pull off floor maintaining back angle',
      'Violent hip snap and shrug into quick elbow turnover under bar',
      'Catch in clean squat, stand tall, then dip and drive into split jerk'
    ]
  },
  {
    id: 'snatch-olympic',
    name: 'Full Barbell Snatch',
    muscle: 'Full Body',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Shoulders', 'Upper Back'],
    category: 'Strength',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '65kg × 2',
    targetSetsReps: '5 × 2',
    prKg: 75,
    equipment: 'Olympic Barbell & Bumpers',
    difficulty: 'Advanced',
    kinematicType: 'overhead',
    description: 'Fastest movement in human sport. Barbell travels from floor to overhead in one unbroken explosion.',
    formCues: [
      'Wide snatch grip with hook grip locked',
      'Extend hips violently as bar reaches hip crease',
      'Pull under bar aggressively dropping into deep overhead squat'
    ]
  },
  {
    id: 'power-clean',
    name: 'Barbell Power Clean',
    muscle: 'Full Body',
    secondaryMuscles: ['Traps', 'Hamstrings', 'Quads', 'Core'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '90kg × 3',
    targetSetsReps: '4 × 3',
    prKg: 105,
    equipment: 'Barbell & Bumpers',
    difficulty: 'Advanced',
    kinematicType: 'hinge',
    description: 'Catches bar above parallel squat depth, focusing on maximum rate of force development.',
    formCues: [
      'Maintain bar path close to body',
      'Snap hips and shrug traps simultaneously',
      'Shoot elbows forward catching bar securely across front delts'
    ]
  },
  {
    id: 'muscle-up-bar',
    name: 'Strict Bar Muscle-Up',
    muscle: 'Back',
    secondaryMuscles: ['Chest', 'Triceps', 'Core', 'Shoulders'],
    category: 'Strength',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 5',
    targetSetsReps: '3 × 4',
    prKg: 0,
    equipment: 'Pull-up Bar',
    difficulty: 'Advanced',
    kinematicType: 'pullup',
    description: 'Apex calisthenics skill combining dynamic chest-to-bar pull, rapid transition, and straight-bar dip.',
    formCues: [
      'Grip with false grip or aggressive overhand grip',
      'Pull violently towards lower ribcage',
      'Roll wrists and chest over bar at top, then press to lockout'
    ]
  },
  {
    id: 'pistol-squat',
    name: 'Single-Leg Pistol Squat',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Ankles', 'Core'],
    category: 'Strength',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 8 / leg',
    targetSetsReps: '3 × 6 / leg',
    prKg: 0,
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    kinematicType: 'squat',
    description: 'Full single-leg squat requiring extreme ankle dorsiflexion, balance, and quad strength.',
    formCues: [
      'Extend non-working leg straight out in front',
      'Descend on working leg until hamstring touches calf',
      'Keep heel flat and press back up to standing'
    ]
  },
  {
    id: 'ring-dips',
    name: 'Gymnastic Ring Dips',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    category: 'Strength',
    image: '/img/ex-bench-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: 'BW × 10',
    targetSetsReps: '3 × 10',
    prKg: 0,
    equipment: 'Gymnastic Rings',
    difficulty: 'Advanced',
    kinematicType: 'bench',
    description: 'Unstable rings demand extraordinary stabilizer activation across chest, shoulders, and triceps.',
    formCues: [
      'Stabilize top support with rings turned out 45 degrees',
      'Descend until shoulders touch rings',
      'Press up and turn rings out at top'
    ]
  },
  {
    id: 'l-sit-parallettes',
    name: 'Parallettes L-Sit Hold',
    muscle: 'Core',
    secondaryMuscles: ['Triceps', 'Quads', 'Hip Flexors'],
    category: 'Core',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '30s hold',
    targetSetsReps: '3 × 25s',
    prKg: 0,
    equipment: 'Parallettes',
    difficulty: 'Intermediate',
    kinematicType: 'core',
    description: 'Isometric gymnastics compression posture developing bulletproof shoulder depression and abs.',
    formCues: [
      'Depress shoulders forcefully into parallettes',
      'Lift straight legs until parallel to floor forming an L',
      'Lock knees and point toes'
    ]
  },
  {
    id: 'snatch-high-pull',
    name: 'Barbell Snatch High Pull',
    muscle: 'Back',
    secondaryMuscles: ['Traps', 'Glutes', 'Hamstrings'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '80kg × 4',
    targetSetsReps: '4 × 4',
    prKg: 95,
    equipment: 'Barbell & Bumpers',
    difficulty: 'Intermediate',
    kinematicType: 'hinge',
    description: 'Develops furious hip extension and upper trap development without wrist catch strain.',
    formCues: [
      'Wide grip with hook grip locked',
      'Drive violently through floor into vertical extension',
      'Pull elbows high and to the sides guiding bar to chest'
    ]
  },
  {
    id: 'box-jump-plyo',
    name: '30-Inch Explosive Plyometric Box Jump',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Calves', 'Hamstrings'],
    category: 'HIIT',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '10 jumps',
    targetSetsReps: '4 × 5 jumps',
    prKg: 0,
    equipment: 'Plyo Box 30"',
    difficulty: 'Intermediate',
    kinematicType: 'squat',
    description: 'Pure vertical propulsion training fast-twitch muscle recruitment and soft landing mechanics.',
    formCues: [
      'Swing arms back in athletic ready stance',
      'Explode upward driving through balls of feet',
      'Land softly on box absorbing impact in quarter squat'
    ]
  },
  {
    id: 'burpee-broad-jump',
    name: 'Chest-to-Floor Burpee to Broad Jump',
    muscle: 'Full Body',
    secondaryMuscles: ['Chest', 'Quads', 'Glutes', 'Core'],
    category: 'HIIT',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '15 reps',
    targetSetsReps: '3 × 12',
    prKg: 0,
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    kinematicType: 'lunge',
    description: 'Combines horizontal bounding power with metabolic chest-to-ground conditioning.',
    formCues: [
      'Drop chest completely to floor',
      'Pop feet up to hands into athletic stance',
      'Immediately leap forward as far as possible landing softly'
    ]
  },

  // ==========================================
  // 10. CONDITIONING, HIIT & BALLISTICS (10 EXERCISES)
  // ==========================================
  {
    id: 'sled-push-prowler',
    name: 'Heavy Prowler Sled Push',
    muscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Calves', 'Cardiovascular', 'Core'],
    category: 'HIIT',
    image: '/img/ex-back-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '120kg × 40m',
    targetSetsReps: '5 × 30m',
    prKg: 160,
    equipment: 'Prowler Sled & Turf',
    difficulty: 'Intermediate',
    kinematicType: 'lunge',
    description: 'Brutal concentric-only lower body power and conditioning with zero eccentric muscle soreness.',
    formCues: [
      'Grip high poles with arms straight and torso at 45 degrees',
      'Drive through balls of feet with deep knee piston drives',
      'Keep head down and core locked in continuous sprint'
    ]
  },
  {
    id: 'battle-ropes-waves',
    name: 'Alternating Battle Rope Waves',
    muscle: 'Shoulders',
    secondaryMuscles: ['Core', 'Forearms', 'Cardiovascular'],
    category: 'HIIT',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '45s max sprint',
    targetSetsReps: '4 × 30s on / 30s off',
    prKg: 0,
    equipment: 'Battle Ropes',
    difficulty: 'Beginner',
    kinematicType: 'overhead',
    description: 'High-frequency upper body anaerobic conditioning shredding shoulders and core.',
    formCues: [
      'Athletic quarter squat stance with braced core',
      'Whip arms alternately up and down creating fluid sinusoidal waves',
      'Maintain rapid wave rhythm without rocking torso'
    ]
  },
  {
    id: 'assault-bike-sprint',
    name: 'AirBike 30-Second Max Wattage Sprint',
    muscle: 'Full Body',
    secondaryMuscles: ['Quads', 'Hamstrings', 'Chest', 'Lats'],
    category: 'HIIT',
    image: '/img/ex-goblet-squat.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '620 watts',
    targetSetsReps: '6 × 20s sprint / 40s rest',
    prKg: 750,
    equipment: 'Assault Bike / Echo Bike',
    difficulty: 'Intermediate',
    kinematicType: 'squat',
    description: 'Exponential wind resistance machine driving heart rate to absolute VO2 max thresholds.',
    formCues: [
      'Push and pull handlebars with maximum force synchronized with leg drive',
      'Maintain aggressive forward lean and breathe through mouth',
      'Empty gas tank completely on every interval'
    ]
  },
  {
    id: 'concept2-rowing-intervals',
    name: 'Concept2 Rowing 500m Sprint Intervals',
    muscle: 'Back',
    secondaryMuscles: ['Hamstrings', 'Quads', 'Biceps', 'Core'],
    category: 'HIIT',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '1:34.2 / 500m',
    targetSetsReps: '4 × 500m',
    prKg: 0,
    equipment: 'Concept2 Rower',
    difficulty: 'Intermediate',
    kinematicType: 'row',
    description: 'Full-body kinetic chain transfer from leg drive through hip swing to handle finish.',
    formCues: [
      'Drive with legs first (60% power), swing hips (20%), pull with arms (20%)',
      'Reverse sequence on return: arms extend, hips hinge, knees bend',
      'Maintain flat back throughout drive phase'
    ]
  },
  {
    id: 'farmer-walk-heavy',
    name: 'Heavy Farmers Walk Carry',
    muscle: 'Forearms',
    secondaryMuscles: ['Traps', 'Core', 'Glutes', 'Calves'],
    category: 'Strength',
    image: '/img/ex-kb-swing.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '40kg each hand × 50m',
    targetSetsReps: '4 × 40m',
    prKg: 50,
    equipment: 'Heavy Dumbbells or Farmer Handles',
    difficulty: 'Intermediate',
    kinematicType: 'lunge',
    description: 'Loaded carry developing savage grip strength, thick traps, and unbreakable anti-lateral flexion core.',
    formCues: [
      'Deadlift weights to sides with chest proud and shoulders pulled back',
      'Take short, quick, heel-to-toe heel steps',
      'Keep torso upright without swaying side to side'
    ]
  },
  {
    id: 'kettlebell-clean-press',
    name: 'Single-Arm Kettlebell Clean and Press',
    muscle: 'Full Body',
    secondaryMuscles: ['Shoulders', 'Glutes', 'Core', 'Lats'],
    category: 'Strength',
    image: '/img/ex-kb-swing.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '24kg × 8 / arm',
    targetSetsReps: '3 × 8 / arm',
    prKg: 32,
    equipment: 'Kettlebell',
    difficulty: 'Intermediate',
    kinematicType: 'overhead',
    description: 'Unilateral hinge to clean catch followed by overhead press; incredible functional builder.',
    formCues: [
      'Hike kettlebell, snap hips and keep bell close to zipper line',
      'Rotate hand under bell catching in soft rack position on forearm',
      'Press overhead cleanly without leaning away'
    ]
  },
  {
    id: 'medicine-ball-slams',
    name: 'Explosive Medicine Ball Floor Slams',
    muscle: 'Core',
    secondaryMuscles: ['Lats', 'Shoulders', 'Triceps'],
    category: 'HIIT',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '12kg × 20 slams',
    targetSetsReps: '4 × 15 slams',
    prKg: 15,
    equipment: 'Dead-Bounce Slam Ball',
    difficulty: 'Beginner',
    kinematicType: 'overhead',
    description: 'Full triple extension into violent abdominal flexion throwing ball through the floor.',
    formCues: [
      'Reach ball overhead extending hips, knees, and ankles completely',
      'Slam ball downward violently into floor using entire core',
      'Catch ball on rebound in squat stance'
    ]
  },
  {
    id: 'sandbag-clean-shoulder',
    name: 'Sandbag Clean to Shoulder',
    muscle: 'Full Body',
    secondaryMuscles: ['Glutes', 'Lower Back', 'Biceps', 'Core'],
    category: 'Strength',
    image: '/img/ex-rdl.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '60kg × 6',
    targetSetsReps: '3 × 6',
    prKg: 75,
    equipment: 'Heavy Sandbag',
    difficulty: 'Advanced',
    kinematicType: 'hinge',
    description: 'Awkward shifting load forces deep stabilizer recruitment and raw grappling strength.',
    formCues: [
      'Bear hug sandbag tight against chest with rounded upper back',
      'Lap bag onto knees, then explode hips forward',
      'Guide bag onto one shoulder standing tall'
    ]
  },
  {
    id: 'ski-erg-sprints',
    name: 'Concept2 SkiErg 250m Power Sprints',
    muscle: 'Lats',
    secondaryMuscles: ['Triceps', 'Core', 'Cardiovascular'],
    category: 'HIIT',
    image: '/img/ex-pullup.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '42.8s / 250m',
    targetSetsReps: '5 × 250m',
    prKg: 0,
    equipment: 'Concept2 SkiErg',
    difficulty: 'Intermediate',
    kinematicType: 'pullup',
    description: 'Downward pulling ergometer taxing the lats, triceps, and abdominal wall with aerobic strain.',
    formCues: [
      'Reach up high on toes grasping handles',
      'Drive handles down using bodyweight and core crunch',
      'Finish stroke past hips with slight knee bend'
    ]
  },
  {
    id: 'dumbbell-devils-press',
    name: "Dumbbell Devil's Press",
    muscle: 'Full Body',
    secondaryMuscles: ['Chest', 'Shoulders', 'Hamstrings', 'Cardio'],
    category: 'HIIT',
    image: '/img/ex-overhead-press.jpg',
    videoUrl: '/video/demo-workout.webm',
    lastPerformance: '20kg pair × 10',
    targetSetsReps: '3 × 8',
    prKg: 24,
    equipment: 'Pair of Dumbbells',
    difficulty: 'Advanced',
    kinematicType: 'overhead',
    description: 'Combination burpee between dumbbells into a double dumbbell snatch overhead in one fluid movement.',
    formCues: [
      'Perform chest-to-floor burpee with hands gripping dumbbells',
      'Jump feet forward outside dumbbells into hinge stance',
      'Swing dumbbells back between legs and snatch overhead in one continuous motion'
    ]
  }
];
