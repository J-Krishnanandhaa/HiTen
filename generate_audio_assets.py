import os
import math
import struct
import wave
import numpy as np
import win32com.client

AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'public', 'audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

# ---------------------------------------------------------
# 1. GENERATE STUDIO VOICE CLIPS (SAPI.SpVoice, 44.1kHz WAV)
# ---------------------------------------------------------
speaker = win32com.client.Dispatch('SAPI.SpVoice')
# Adjust voice speed to energetic fitness coach pace (+1 or +2)
speaker.Rate = 1

voice_cues = {
    'voice_ready.wav': 'Ready to go!',
    'voice_3.wav': 'Three',
    'voice_2.wav': 'Two',
    'voice_1.wav': 'One',
    'voice_start.wav': 'Start!',
    'voice_rest.wav': 'Take a rest.',
    'voice_halfway.wav': 'Halfway there!',
    'voice_complete.wav': 'Workout complete! Great job!',
    'voice_sound_on.wav': 'Sound on.',
}

for filename, text in voice_cues.items():
    filepath = os.path.join(AUDIO_DIR, filename)
    stream = win32com.client.Dispatch('SAPI.SpFileStream')
    stream.Open(filepath, 3, False)
    speaker.AudioOutputStream = stream
    speaker.Speak(text)
    stream.Close()
    print(f"Generated {filename}: {os.path.getsize(filepath)} bytes")

# ---------------------------------------------------------
# 2. GENERATE HIGH-IMPACT STUDIO SFX (44.1kHz 16-bit Mono WAV)
# ---------------------------------------------------------
SAMPLE_RATE = 44100

def write_wav(filename, samples):
    filepath = os.path.join(AUDIO_DIR, filename)
    # Clip and convert to 16-bit PCM
    clipped = np.clip(samples, -1.0, 1.0)
    int_samples = (clipped * 32767).astype(np.int16)
    
    with wave.open(filepath, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(int_samples.tobytes())
    print(f"Generated {filename}: {os.path.getsize(filepath)} bytes")

# A. Digital Gym Countdown Tick (Crisp 880Hz / 1760Hz double click)
t = np.linspace(0, 0.08, int(SAMPLE_RATE * 0.08), endpoint=False)
envelope = np.exp(-t * 60)
tick_wave = (0.7 * np.sin(2 * np.pi * 880 * t) + 0.3 * np.sin(2 * np.pi * 1760 * t)) * envelope
write_wav('sfx_tick.wav', tick_wave)

# B. Professional Referee / Start Whistle (Rising 2-tone frequency modulated warble)
t = np.linspace(0, 0.45, int(SAMPLE_RATE * 0.45), endpoint=False)
envelope = np.sin(np.pi * t / 0.45) ** 0.5
# Frequency modulation for realistic whistle warble
fm = 15 * np.sin(2 * np.pi * 32 * t)
carrier = 1800 + (t / 0.45) * 400
whistle_wave = (0.6 * np.sin(2 * np.pi * (carrier + fm) * t) + 0.4 * np.sin(2 * np.pi * (carrier * 1.08 + fm) * t)) * envelope
write_wav('sfx_whistle.wav', whistle_wave * 0.9)

# C. Authentic Boxing Gym Gong / Round Bell
t = np.linspace(0, 1.2, int(SAMPLE_RATE * 1.2), endpoint=False)
envelope = np.exp(-t * 3.5)
# Complex metallic harmonics
harmonics = [
    (587.33, 0.5),   # D5
    (880.00, 0.3),   # A5
    (1174.66, 0.2),  # D6
    (1760.00, 0.15), # A6
    (2349.32, 0.1),  # D7
]
bell_wave = np.zeros_like(t)
for freq, amp in harmonics:
    bell_wave += amp * np.sin(2 * np.pi * freq * t)
write_wav('sfx_bell.wav', bell_wave * envelope * 0.95)

# D. Set Complete Rest Chime (Harmonic 2-chord ding)
t = np.linspace(0, 0.5, int(SAMPLE_RATE * 0.5), endpoint=False)
envelope1 = np.exp(-t * 8)
chime1 = np.sin(2 * np.pi * 659.25 * t) * envelope1 # E5
# Shifted second tone
t2 = np.linspace(0, 0.4, int(SAMPLE_RATE * 0.4), endpoint=False)
envelope2 = np.exp(-t2 * 6)
chime2 = np.sin(2 * np.pi * 880.00 * t2) * envelope2 # A5
# Combine
total_len = int(SAMPLE_RATE * 0.6)
rest_chime = np.zeros(total_len)
rest_chime[:len(chime1)] += chime1 * 0.45
offset = int(SAMPLE_RATE * 0.1)
rest_chime[offset:offset+len(chime2)] += chime2 * 0.5
write_wav('sfx_rest_chime.wav', rest_chime)

# E. Victory Celebration Fanfare (C major arpeggio triumph)
note_dur = 0.18
c_notes = [523.25, 659.25, 783.99, 1046.50] # C5, E5, G5, C6
total_fanfare_len = int(SAMPLE_RATE * 1.1)
fanfare_wave = np.zeros(total_fanfare_len)

for idx, freq in enumerate(c_notes):
    start_t = idx * note_dur
    start_idx = int(SAMPLE_RATE * start_t)
    dur = 0.5 if idx == len(c_notes) - 1 else 0.22
    t_note = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
    env = np.exp(-t_note * (4 if idx == len(c_notes) - 1 else 8))
    chord = (0.7 * np.sin(2 * np.pi * freq * t_note) + 0.3 * np.sin(2 * np.pi * (freq * 2) * t_note)) * env
    end_idx = min(start_idx + len(chord), total_fanfare_len)
    fanfare_wave[start_idx:end_idx] += chord[:end_idx - start_idx] * 0.85

write_wav('sfx_fanfare.wav', fanfare_wave)

print("\n--- ALL AUDIO ASSETS GENERATED SUCCESSFULLY ---")
