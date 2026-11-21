"""Central configuration: canvas, colours, fonts, the narration transcript with
real timings measured from audio.wav, scene boundaries and keyword cue points.

All times are in seconds on the audio timeline. They come from
  * ffmpeg silencedetect (-35 dB, 0.35 s) for sentence boundaries, and
  * a Khmer-tuned Whisper model (sokhapen/whisper-small-khmer-v6-ct2) run on each
    speech chunk, plus RMS dips inside long sentences for keyword timing.
The recogniser text was then corrected by hand (e.g. "វាលឆោក" -> Wheel Chock,
"ជម្រុះ" -> ច្រមុះ / nose), so the captions match what the narrator says.
"""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
A = lambda *p: os.path.join(ROOT, *p)

W, H, FPS = 1920, 1080, 30
AUDIO = A("audio.wav")              # original narration (uploaded as audio.mp3 but is WAV/PCM)
DURATION = 111.04                   # measured with ffprobe

# ---- colour system (from the brief) ---------------------------------------------
NAVY = (7, 20, 38)          # #071426
DEEP = (11, 31, 58)         # #0B1F3A
TECH = (37, 99, 235)        # #2563EB
CYAN = (34, 211, 238)       # #22D3EE
WHITE = (255, 255, 255)
SILVER = (203, 213, 225)    # #CBD5E1
GOLD = (245, 158, 11)       # #F59E0B
RED = (239, 68, 68)         # #EF4444

# ---- fonts (all SIL OFL, from github.com/google/fonts) ----------------------------
FONT_KH = A("assets/fonts/Kantumruy.ttf")        # Khmer + Latin, modern UI face
FONT_KH2 = A("assets/fonts/NotoSansKhmer.ttf")   # Khmer, heavy weights for impact titles
FONT_EN = A("assets/fonts/Montserrat.ttf")       # technical English labels
FONT_MATH = A("assets/fonts/DejaVuSans-Bold.ttf") # formulas: subscripts, sigma (Bitstream Vera licence)

# ---- narration captions: (start, end, Khmer text) --------------------------------
CAPTIONS = [
    (0.00, 5.50, "តើអ្នកធ្លាប់ឆ្ងល់ទេថា យន្តហោះដ៏ធំមួយ អាចត្រូវបានលើកឱ្យផុតពីដីដោយរបៀបណា?"),
    (5.88, 9.55, "តើឧបករណ៍អ្វីខ្លះ ដែលអាចទ្រទម្ងន់យន្តហោះដ៏ធ្ងន់នេះបាន?"),
    (9.90, 11.75, "ការងារនេះមានឈ្មោះថា Jacking។"),
    (12.01, 17.50, "វាគឺជាដំណើរការលើកយន្តហោះចេញពីដី ដោយប្រើឧបករណ៍ពិសេសហៅថា Aircraft Jack។"),
    (17.76, 21.36, "គោលបំណងគឺធ្វើឱ្យកង់យន្តហោះ ឬ Landing Gear Wheels"),
    (21.36, 25.15, "ផុតពីផ្ទៃដី ដើម្បីអាចធ្វើការត្រួតពិនិត្យ និងថែទាំបាន។"),
    (25.47, 27.60, "ប៉ុន្តែ ហេតុអ្វីបានជាត្រូវលើកយន្តហោះ?"),
    (27.87, 34.58, "គឺដើម្បីអនុវត្តការងារថែទាំសំខាន់ៗ ដូចជា ការត្រួតពិនិត្យ Landing Gear ការដោះប្ដូរកង់"),
    (34.58, 40.05, "និងសំបកកង់ ការត្រួតពិនិត្យប្រព័ន្ធហ្វ្រាំង និងការសាកល្បងប្រព័ន្ធបត់-លាតជើងទម្រ។"),
    (40.35, 45.88, "អ្វីដែលសំខាន់បំផុត គឺទីតាំងដែលត្រូវដាក់ Jack។ ចំណុចទាំងនេះហៅថា Jacking Points។"),
    (45.88, 51.90, "ជាទូទៅ យន្តហោះមួយចំនួនប្រើចំណុចលើកនៅផ្នែកច្រមុះ និងចំណុចពីរនៅតំបន់ស្លាបខាងឆ្វេង និងស្តាំ។"),
    (52.09, 56.70, "ចំណុចទាំងនេះត្រូវបានរចនាឡើង ដើម្បីទទួលបន្ទុកពីឧបករណ៍លើក។"),
    (57.13, 61.00, "ការលើកយន្តហោះ មិនមែនគ្រាន់តែដាក់ Jack ហើយចាប់ផ្តើមលើកនោះទេ។"),
    (61.33, 67.30, "ត្រូវពិនិត្យទម្ងន់យន្តហោះ សមត្ថភាពរបស់ Jack លក្ខខណ្ឌខ្យល់ និងស្ថានភាពផ្ទៃដីជាមុន។"),
    (67.59, 71.80, "ជាពិសេស ត្រូវប្រើ Wheel Chock និងពិនិត្យស្ថានភាពឧបករណ៍។"),
    (72.01, 74.80, "សុវត្ថិភាព តែងតែជាអាទិភាពទីមួយ។"),
    (75.12, 80.10, "ក្រោយពីការលើកយន្តហោះ យើងក៏ត្រូវយល់ដឹងអំពី Leveling និង Weighing ផងដែរ។"),
    (80.45, 85.65, "Leveling គឺជាការធ្វើឱ្យយន្តហោះស្ថិតនៅក្នុងកម្រិតយោង ដែលក្រុមហ៊ុនផលិតកំណត់។"),
    (85.87, 91.56, "ចំណែក Weighing គឺជាការថ្លឹងទម្ងន់យន្តហោះ ដើម្បីកំណត់ Weight និង Center of Gravity"),
    (91.56, 96.20, "ឬ CG ដែលមានសារៈសំខាន់ចំពោះសុវត្ថិភាពនៃការហោះហើរ។"),
    (96.58, 101.05, "Jacking មិនមែនគ្រាន់តែជាការលើកយន្តហោះទេ វាជាផ្នែកមួយដ៏សំខាន់នៃ"),
    (101.05, 106.25, "Aircraft Maintenance ដែលទាមទារចំណេះដឹង ភាពម៉ត់ចត់ និងការគោរពសុវត្ថិភាព។"),
    (106.58, 110.75, "ព្រោះសុវត្ថិភាពនៃការហោះហើរ ចាប់ផ្តើមពីការថែទាំដ៏ត្រឹមត្រូវ។"),
]

# ---- scenes: (id, start, end, renderer name) ------------------------------------
SCENES = [
    (1, 0.00, 5.70, "hook"),
    (2, 5.70, 9.70, "weight_question"),
    (3, 9.70, 11.85, "title_jacking"),
    (4, 11.85, 17.60, "aircraft_jack"),
    (5, 17.60, 25.25, "lift_animation"),
    (6, 25.25, 27.65, "why"),
    (7, 27.65, 40.10, "maintenance_tasks"),
    (8, 40.10, 51.95, "jacking_points"),
    (9, 51.95, 56.85, "load_path"),
    (10, 56.85, 61.10, "not_just_lift"),
    (11, 61.10, 67.40, "checklist"),
    (12, 67.40, 71.85, "chocks_equipment"),
    (13, 71.85, 74.85, "safety_first"),
    (14, 74.85, 80.25, "level_weigh_title"),
    (15, 80.25, 85.70, "leveling"),
    (16, 85.70, 96.35, "weighing"),
    (17, 96.35, 106.40, "recap"),
    (18, 106.40, DURATION, "outro"),
]

# ---- keyword cue points: label/graphic appears when the word is spoken -----------
CUE = dict(
    jacking_word=9.95, aircraft_jack=16.17, gear_wheels=19.44, lift_off=21.36,
    task1=30.60, task2=32.90, task3=35.30, task4=37.70,
    jp_title=43.36, jp_nose=47.60, jp_left=50.10, jp_right=50.90,
    load=52.10, not_just=57.13, prepare=59.70,
    chk_weight=61.40, chk_capacity=62.80, chk_wind=64.45, chk_ground=65.60,
    chock=68.43, equipment=69.70, safety=72.01, priority=73.05,
    leveling_word=76.60, weighing_word=78.40,
    leveling=80.45, weighing=85.87, weight_cg=88.84, cg=91.56,
    maint=101.05, knowledge=102.40, precision=103.85, safety2=105.00, outro=106.58,
)

# ---- photo credits shown on screen when a photo is used ---------------------------
CREDITS = {
    "a320_hangar": "Photo: FlightReal / CC BY 2.0 (Wikimedia Commons)",
    "a320neo_frontier": "Photo: Colin Brown Photography / CC BY 2.0 (cropped)",
    "jack_a10_wide": "Photo: U.S. Air Force / Public domain",
    "jack_a10_operator": "Photo: U.S. Air Force / Public domain",
    "jack_c130": "Photo: U.S. Air Force / Public domain",
    "jack_f16_team": "Photo: U.S. Air Force / Public domain",
    "jack_maintaining": "Photo: SrA Franklin Ramos, U.S. Air Force / Public domain",
    "jack_lancaster_1": "Photo: SAC Ben Mayfield, UK MOD / OGL v1.0",
    "jack_lancaster_2": "Photo: SAC Ben Mayfield, UK MOD / OGL v1.0",
    "jack_e2c_lifted": "Photo: U.S. Navy / Public domain",
    "jack_p3_operator": "Photo: U.S. Navy / Public domain",
    "jack_ringlock": "Photo: U.S. Navy / Public domain",
    "jack_loadtest": "Photo: U.S. Navy / Public domain",
    "a220_takeoff": "Footage: TheFrog001 / CC0 (Wikimedia Commons)",
}
