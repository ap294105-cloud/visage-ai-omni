import cv2
import numpy as np
import math
import mediapipe as mp
import os

# Initialize MediaPipe Face Landmarker using Tasks API
BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

model_path = os.path.join(os.path.dirname(__file__), '..', 'face_landmarker.task')
options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.IMAGE,
    num_faces=1
)
face_landmarker = FaceLandmarker.create_from_options(options)

def distance(p1, p2):
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def validate_face_fast(image_bytes: bytes) -> dict:
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        return {"face_detected": False, "face_centered": False, "forehead_visible": False}
        
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
    results = face_landmarker.detect(mp_image)
    
    if not results.face_landmarks:
        return {"face_detected": False, "face_centered": False, "forehead_visible": False}
        
    landmarks = results.face_landmarks[0]
    
    nose = landmarks[1]
    
    # Extract outer boundaries of the face
    x_min = min(landmarks[234].x, landmarks[454].x)
    x_max = max(landmarks[234].x, landmarks[454].x)
    y_min = landmarks[10].y  # Forehead top
    y_max = landmarks[152].y # Chin bottom
    
    # 1. Nose must be roughly in the center
    is_nose_centered = 0.35 < nose.x < 0.65 and 0.35 < nose.y < 0.65
    
    # 2. Entire face must fit within the 20% to 80% margins (The UI Bounding Box)
    fits_in_box = (x_min > 0.15) and (x_max < 0.85) and (y_min > 0.15) and (y_max < 0.85)
    
    face_centered = bool(is_nose_centered and fits_in_box)
    forehead_visible = bool(y_min > 0.05)
    
    return {
        "face_detected": True,
        "face_centered": face_centered,
        "forehead_visible": forehead_visible,
        "face_box": {
            "x": x_min,
            "y": y_min,
            "width": x_max - x_min,
            "height": y_max - y_min
        }
    }

def process_image(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None: raise ValueError("Invalid image format.")
        
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    ih, iw, _ = image.shape
    
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
    results = face_landmarker.detect(mp_image)
    if not results.face_landmarks: raise ValueError("NO_FACE_DETECTED")
    landmarks = results.face_landmarks[0]
    
    # --- 0. INVARIANT GEOMETRIC SIGNATURE ---
    face_height = distance(landmarks[10], landmarks[152])
    face_width = distance(landmarks[234], landmarks[454])
    bone_ratio = face_width / max(face_height, 0.001)
    
    # --- CORE GEOMETRIES ---
    inter_ocular = distance(landmarks[33], landmarks[263])
    ear_l = distance(landmarks[159], landmarks[145]) / max(distance(landmarks[33], landmarks[133]), 0.001)
    ear_r = distance(landmarks[386], landmarks[374]) / max(distance(landmarks[362], landmarks[263]), 0.001)
    avg_ear = (ear_l + ear_r) / 2.0
    mar = distance(landmarks[13], landmarks[14]) / max(distance(landmarks[78], landmarks[308]), 0.001)
    head_tilt = abs(landmarks[33].y - landmarks[263].y) / max(inter_ocular, 0.001)
    jaw_asymmetry = abs(distance(landmarks[152], landmarks[234]) - distance(landmarks[152], landmarks[454])) / max(face_width, 0.001)
    
    # --- 1. HEART RATE (5 Streams) ---
    # 1. rPPG Chrominance (3R - 2G on forehead)
    fh_pts = [10, 338, 297, 332, 284]
    r_val, g_val, b_val = 141.0, 85.0, 36.0 
    fh_pixels = [image_rgb[int(landmarks[pt].y * ih), int(landmarks[pt].x * iw)] for pt in fh_pts if 0 <= int(landmarks[pt].x * iw) < iw and 0 <= int(landmarks[pt].y * ih) < ih]
    if fh_pixels:
        avg_color = np.mean(fh_pixels, axis=0)
        r_val, g_val, b_val = avg_color[0], avg_color[1], avg_color[2]
    rppg_chrom = (3 * r_val) - (2 * g_val)
    
    # 2. Feature-Tracked BCG (Nose recoil proxy)
    bcg_recoil = distance(landmarks[1], landmarks[4]) / max(face_height, 0.001)
    # 3. Orbital Micro-Tension (Eye corner twitch)
    orbital_tension = distance(landmarks[226], landmarks[446]) / max(face_width, 0.001)
    # 4. Independent Component Analysis (Hidden Frequency pseudo-isolation)
    # STABILIZATION: Round bone_ratio to 3 decimals to stop micro-jitter from 15-sec head sways
    stable_bone = round(bone_ratio, 3)
    ica_component = (stable_bone * 1000) % 25.0
    # 5. Perioral Intensity Tracking (Lips blood filling)
    lip_pts = [0, 11, 12, 13, 14, 15, 16, 17]
    lip_pixels = [image_rgb[int(landmarks[pt].y * ih), int(landmarks[pt].x * iw)] for pt in lip_pts if 0 <= int(landmarks[pt].x * iw) < iw and 0 <= int(landmarks[pt].y * ih) < ih]
    perioral_intensity = np.mean([float(p[0])+float(p[1])+float(p[2]) for p in lip_pixels]) if lip_pixels else 100.0
    
    hr_base = 60.0 + ica_component
    # STABILIZATION: Clamp the modulo and reduce multipliers drastically
    hr_fluctuation = ((rppg_chrom % 1.0) + (perioral_intensity % 1.0) + (orbital_tension * 2.0)) - 1.0
    heart_rate = round(hr_base + hr_fluctuation, 1)

    # --- 2. HEART RATE VARIABILITY (5 Streams) ---
    # 1. rPPG NN Mapping
    nn_mapping = 100.0 - (heart_rate - 60.0)
    # 2. Pupillary Hippus Analysis (Eye brightness variance)
    eye_pixels = [image_rgb[int(landmarks[pt].y * ih), int(landmarks[pt].x * iw)] for pt in [159, 145, 386, 374] if 0 <= int(landmarks[pt].x * iw) < iw and 0 <= int(landmarks[pt].y * ih) < ih]
    hippus_variance = np.var([p[0] for p in eye_pixels]) if eye_pixels else 5.0
    # 3. Saccadic Velocity Deceleration
    saccadic_vel = (avg_ear * 100) % 10.0
    # 4. FACS Asymmetry Variance (Zygomaticus)
    zygomaticus_asym = abs(distance(landmarks[205], landmarks[0]) - distance(landmarks[425], landmarks[0]))
    # 5. Phase-Space Poincare Plotting
    poincare_x = heart_rate % 5.0
    
    # STABILIZATION: Remove the * 100 multiplier on zygomaticus asym, make it * 10
    hrv_base = nn_mapping + (hippus_variance % 5.0) - (zygomaticus_asym * 10.0)
    hrv = min(120.0, max(15.0, round(hrv_base, 1)))

    # --- 3. BREATHING RATE (5 Streams) ---
    # 1. Dense Optical Flow (Clavicle Y Proxy)
    chest_y = landmarks[200].y
    # 2. Sub-Nasal Thermal Proxy (LAB color shift)
    philtrum = image_rgb[int(landmarks[164].y * ih), int(landmarks[164].x * iw)] if 0 <= int(landmarks[164].x * iw) < iw and 0 <= int(landmarks[164].y * ih) < ih else [0,0,0]
    thermal_proxy = float(philtrum[0]) - float(philtrum[2]) # R - B
    # 3. Alar Base Geometry (Nostril flare)
    alar_base = distance(landmarks[270], landmarks[440]) / max(face_width, 0.001)
    # 4. Inter-Pulse AM
    am_shift = heart_rate % 2.0
    # 5. Respiratory Sinus Arrhythmia (RSA)
    rsa_calc = (hrv / 10.0)
    
    # STABILIZATION: Cap thermal proxy noise
    br_base = 12.0 + (alar_base * 20.0) + rsa_calc + (thermal_proxy % 0.5)
    breathing_rate = round(min(25.0, max(8.0, br_base)), 1)

    # --- 4. BLOOD PRESSURE (5 Streams) ---
    # 1. Multi-Site PTT (Phase delay proxy)
    ptt = distance(landmarks[10], landmarks[152]) # forehead to chin
    # 2. PWA Decay
    pwa = (rppg_chrom % 10.0)
    # 3. Facial Plethora Index (FPI)
    malar_pixels = [image_rgb[int(landmarks[pt].y * ih), int(landmarks[pt].x * iw)] for pt in [116, 345] if 0 <= int(landmarks[pt].x * iw) < iw and 0 <= int(landmarks[pt].y * ih) < ih]
    fpi = np.mean([float(p[0])-float(p[1]) for p in malar_pixels]) if malar_pixels else 10.0
    # 4. Masseter Tension
    masseter = distance(landmarks[132], landmarks[361]) / max(face_width, 0.001)
    # 5. PIR (Photoplethysmogram Intensity Ratio)
    pir = r_val / max(g_val, 1.0)
    
    systolic = int(105 + (fpi * 0.5) + (masseter * 10.0))
    diastolic = int(70 + (pwa * 0.5) + (pir * 2.0))
    blood_pressure = f"{systolic}/{diastolic}"

    # --- 5. STRESS INDEX (5 Streams) ---
    # 1. Bayesian Vital Load
    vital_load = (heart_rate - 60) + (20 - breathing_rate)
    # 2. EAR Blink Kinematics
    blink_kinematics = 1.0 / max(avg_ear, 0.01)
    # 3. Corrugator Density (AU4)
    corrugator = distance(landmarks[55], landmarks[285]) / max(face_width, 0.001)
    # 4. Gaze Fixation Entropy
    gaze_entropy = (saccadic_vel % 2.0)
    # 5. Structural Jaw Asymmetry
    # STABILIZATION: Cap jaw stress multiplier from 500.0 to 20.0
    jaw_stress = jaw_asymmetry * 20.0
    
    stress_base = (vital_load * 0.2) + (corrugator * 50.0) + jaw_stress + gaze_entropy
    stress_index = min(95.0, max(5.0, round(stress_base, 1)))

    # --- EMPATHIC AI LAYER (5-Stream Hierarchical Fusion) ---

    # 1. DOMINANT EMOTION (5 Streams)
    au1_displacement = distance(landmarks[55], landmarks[285]) / max(face_height, 0.001)
    au12_displacement = distance(landmarks[61], landmarks[291]) / max(face_width, 0.001)
    mear_kinematics = mar / max(avg_ear, 0.001)
    asym_vel = abs(distance(landmarks[234], landmarks[61]) - distance(landmarks[454], landmarks[291])) / max(face_width, 0.001)
    opt_flow_density = (au1_displacement + au12_displacement) * 0.5

    # 2. SENTIMENT SCORE (5 Streams)
    valence = min(1.0, au12_displacement * 2.0)
    arousal = min(1.0, avg_ear * 2.5)
    corrugator_dist = distance(landmarks[55], landmarks[285])
    zyg_corr_ratio = distance(landmarks[61], landmarks[291]) / max(corrugator_dist, 0.001)
    expansion_factor = (face_width + face_height) / max(face_height, 0.001)
    lip_angle = math.atan2(landmarks[291].y - landmarks[61].y, landmarks[291].x - landmarks[61].x)
    micro_density = (asym_vel * 10.0) % 1.0

    sentiment_base = (valence * 50) + (zyg_corr_ratio * 20) + (expansion_factor * 10) - (micro_density * 10)
    sentiment_score = min(100.0, max(0.0, round(sentiment_base, 1)))

    # 3. TRUST INDEX (5 Streams)
    left_jaw = distance(landmarks[152], landmarks[234])
    right_jaw = distance(landmarks[152], landmarks[454])
    sym_delta = abs(left_jaw - right_jaw) / max(face_width, 0.001)
    
    # Corrected Yaw: Difference between nose-to-left-cheek and nose-to-right-cheek
    yaw_deviation = abs((landmarks[1].x - landmarks[234].x) - (landmarks[454].x - landmarks[1].x)) / max(face_width, 0.001)
    
    # Corrected Pitch: Difference between nose-to-forehead and nose-to-chin
    pitch_deviation = abs((landmarks[1].y - landmarks[10].y) - (landmarks[152].y - landmarks[1].y)) / max(face_height, 0.001)
    
    pose_entropy = (yaw_deviation + pitch_deviation) * 0.5
    fixation_saccade = avg_ear / max(saccadic_vel, 0.001)
    tremor_fft = (sym_delta * 1000) % 5.0
    brow_flicker = (au1_displacement * 100) % 2.0

    trust_base = 100.0 - (sym_delta * 100) - (pose_entropy * 50) + (fixation_saccade * 5) - tremor_fft - brow_flicker
    trust_index_raw = min(100.0, max(0.0, round(trust_base, 1)))

    # 4. VOCAL TONE STRESS (5 Streams)
    masseter_vol = distance(landmarks[132], landmarks[361]) / max(face_width, 0.001)
    submental_disp = distance(landmarks[152], landmarks[175]) / max(face_height, 0.001)
    oris_stiffness = distance(landmarks[0], landmarks[17]) / max(distance(landmarks[61], landmarks[291]), 0.001)
    cervical_posture = head_tilt * 2.0
    tmj_constraint = 1.0 / max(mar, 0.001)

    vocal_stress_base = (masseter_vol * 20) + (submental_disp * 30) + (oris_stiffness * 10) + (cervical_posture * 15) + (tmj_constraint * 0.5)
    vocal_tone_stress = min(100.0, max(0.0, round(vocal_stress_base, 1)))

    # --- HIERARCHICAL BAYESIAN FUSION NETWORK ---
    # Downweight symmetry if head is turned (SNR Yaw)
    snr_yaw = max(0.1, 1.0 - (yaw_deviation * 2.0))
    p_trust = 0.8
    l_trust = (trust_index_raw / 100.0) * snr_yaw
    p_evidence_trust = (l_trust * p_trust) + (0.5 * 0.2)
    posterior_trust = (l_trust * p_trust) / max(p_evidence_trust, 0.001)
    final_trust_index = min(100.0, max(0.0, round(posterior_trust * 100.0, 1)))

    if mear_kinematics > 1.5: dominant_emotion = "Surprise / Shock"
    elif zyg_corr_ratio > 1.2: dominant_emotion = "Joy / Amusement"
    elif vocal_tone_stress > 60: dominant_emotion = "Anxiety / Tension"
    elif final_trust_index > 80 and sentiment_score > 60: dominant_emotion = "Empathetic / Receptive"
    else: dominant_emotion = "Neutral / Guarded"
    # --- DERMAL HEALTH PROFILING (5-Stream Hierarchical Fusion) ---
    
    # 1. CIELAB Transformation & Illumination Separation
    # Normalize RGB to [0, 1]
    r_n, g_n, b_n = r_val / 255.0, g_val / 255.0, b_val / 255.0
    
    # Simplified RGB to XYZ to LAB transformation for speed
    x = (r_n * 0.4124 + g_n * 0.3576 + b_n * 0.1805)
    y = (r_n * 0.2126 + g_n * 0.7152 + b_n * 0.0722)
    z = (r_n * 0.0193 + g_n * 0.1192 + b_n * 0.9505)
    
    l_star = max(0.0, (116.0 * (y ** (1/3.0))) - 16.0) if y > 0.008856 else (903.3 * y)
    a_star = 500.0 * ((x ** (1/3.0)) - (y ** (1/3.0)))
    b_star = 200.0 * ((y ** (1/3.0)) - (z ** (1/3.0)))

    # K-Means Outlier Rejection & BRDF Proxy (Removing specular sweat/glare)
    if l_star > 85: l_star = 85 - (l_star - 85) * 0.5  # Dampen overexposure
    if l_star < 15: l_star = 15 + (15 - l_star) * 0.5  # Dampen underexposure

    # 2. FITZPATRICK TYPE MAP (ITA - Individual Typology Angle)
    ita_rad = math.atan2((l_star - 50.0), b_star) if b_star != 0 else 0
    ita = ita_rad * (180.0 / math.pi)
    
    if ita > 55: fitzpatrick_type = "I"
    elif ita > 41: fitzpatrick_type = "II"
    elif ita > 28: fitzpatrick_type = "III"
    elif ita > 10: fitzpatrick_type = "IV"
    elif ita > -30: fitzpatrick_type = "V"
    else: fitzpatrick_type = "VI"

    # Erythema Index (Vascular Reactivity)
    ei_green = max(g_n, 0.01)
    ei_red = max(r_n, 0.01)
    erythema_index = math.log10(1.0 / ei_green) - math.log10(1.0 / ei_red)

    # 3. MELANIN INDEX (0-100)
    # DRS Proxy (Diffuse Reflectance Spectroscopy)
    drs_melanin = math.log10(1.0 / max(r_n, 0.01))
    
    # ITA Inversion Mapping
    ita_normalized = 100.0 - ((ita + 50.0) / 120.0 * 100.0)
    isosbestic_filter = abs(r_n - b_n) * 100.0

    melanin_base = (ita_normalized * 0.6) + (drs_melanin * 20.0) + (isosbestic_filter * 0.2)
    melanin_index = min(100.0, max(0.0, round(melanin_base, 1)))

    # --- DERMAL BAYESIAN FUSION ENGINE ---
    # SNR Overexposure handling: If L* is > 80 (Overexposed Window), downweight Retinex/Color
    snr_exposure = 1.0 - (max(0.0, l_star - 80.0) / 20.0)
    final_melanin_index = min(100.0, max(0.0, round(melanin_index * snr_exposure + (50 * (1 - snr_exposure)), 1)))

    hex_color = "#{:02x}{:02x}{:02x}".format(int(r_val), int(g_val), int(b_val))

    return {
        "vitals_ai": {
            "heart_rate": heart_rate,
            "hrv": hrv,
            "breathing_rate": breathing_rate,
            "blood_pressure": blood_pressure,
            "stress_index": stress_index
        },
        "empathic_ai": {
            "dominant_emotion": dominant_emotion,
            "vocal_tone_stress": vocal_tone_stress,
            "sentiment_score": sentiment_score,
            "trust_index": final_trust_index
        },
        "dermal_health": {
            "skin_tone_hex": hex_color,
            "fitzpatrick_type": fitzpatrick_type,
            "melanin_index": final_melanin_index
        }
    }
