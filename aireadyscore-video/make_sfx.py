import numpy as np, wave
SR = 48000
rng = np.random.default_rng(7)
out = np.zeros(int(45.5 * SR))

def add(t, s, g=1.0):
    i = int(t * SR); out[i:i + len(s)] += s[:len(out) - i] * g

def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(x / a, 1) * np.exp(-x / d)

def pop(f0=700, f1=320, dur=0.14):
    n = int(dur * SR); x = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-x * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.035)

def click():
    n = int(0.05 * SR); x = np.arange(n) / SR
    return (rng.standard_normal(n) * 0.5 + np.sin(2 * np.pi * 1800 * x)) * env(n, 0.0005, 0.008)

def swoosh(dur=0.55, up=True):
    # Smooth tonal glide (no noise): two soft sine voices a fifth apart sweeping together, hann-shaped.
    n = int(dur * SR); x = np.arange(n) / SR; u = x / dur
    f = 260 * (2.0 ** (1.15 * (u if up else 1 - u)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.5 * np.sin(1.5 * ph) + 0.18 * np.sin(2 * ph)
    w = np.sin(np.pi * u) ** 2.5
    return y * w * 0.9

def chime(f=1046.5, dur=0.9):
    n = int(dur * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.0 * x) + 0.25 * np.sin(2 * np.pi * f * 3.01 * x)) * env(n, 0.003, 0.28)

# scene 1
add(0.67, pop(), 0.8); add(3.3, swoosh(0.6), 0.5)
for i in range(8): add(5.5 + i * 0.133, pop(900, 500, 0.08), 0.35)
add(7.65, swoosh(0.5), 0.5)
# scene 2
add(8.95, pop(380, 160, 0.2), 0.9); add(10.0, chime(1046.5), 0.55); add(10.2, pop(900, 500, 0.1), 0.35)
add(11.6, swoosh(0.5), 0.35); add(13.65, swoosh(0.5), 0.5)
# scene 3
add(14.45, pop(), 0.7)
for i in range(5): add(15.5 + i * 0.44, pop(1000 + 80 * i, 700, 0.07), 0.3)
add(18.7, chime(1318.5), 0.5); add(20.65, swoosh(0.5), 0.5)
# scene 4
for i in range(8): add(21.8 + i * 0.147, pop(800, 400, 0.1), 0.45)
add(24.3, pop(1000, 600, 0.1), 0.5); add(26.87, click(), 0.8); add(27.0, pop(900, 500, 0.1), 0.4)
add(29.7, swoosh(0.45), 0.4); add(29.85, pop(), 0.5); add(30.1, pop(), 0.4)
add(31.63, click(), 0.8); add(31.7, chime(1174.7), 0.5); add(32.65, swoosh(0.5), 0.5)
# scene 5
add(33.7, pop(), 0.6); add(34.05, pop(), 0.6); add(35.3, swoosh(0.9), 0.4)
for t in (35.27, 35.37, 35.47): add(t, pop(900, 500, 0.08), 0.35)
add(38.65, swoosh(0.5), 0.5)
# scene 6
add(39.8, pop(380, 160, 0.2), 0.9); add(40.63, chime(1046.5), 0.6); add(41.33, pop(900, 500, 0.1), 0.3)

out /= max(1e-9, np.abs(out).max()); out *= 0.55
fade = np.ones_like(out); i0 = int(42.0 * SR); i1 = int(45.0 * SR)
fade[i0:i1] = np.linspace(1, 0, i1 - i0); fade[i1:] = 0
out *= fade
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open('public/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(out) / SR)
