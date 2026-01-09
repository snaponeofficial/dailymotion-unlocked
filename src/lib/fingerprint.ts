// Browser fingerprinting utility for trial abuse prevention

export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];
  
  // Screen info
  components.push(`screen:${screen.width}x${screen.height}x${screen.colorDepth}`);
  
  // Timezone
  components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  // Language
  components.push(`lang:${navigator.language}`);
  
  // Platform
  components.push(`platform:${navigator.platform}`);
  
  // Hardware concurrency
  components.push(`cores:${navigator.hardwareConcurrency || 0}`);
  
  // Device memory (if available)
  const nav = navigator as Navigator & { deviceMemory?: number };
  components.push(`memory:${nav.deviceMemory || 0}`);
  
  // Touch support
  components.push(`touch:${navigator.maxTouchPoints || 0}`);
  
  // WebGL renderer
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(`gpu:${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`);
      }
    }
  } catch {
    components.push('gpu:unknown');
  }
  
  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('DailyWatch fingerprint', 2, 2);
      components.push(`canvas:${canvas.toDataURL().slice(-50)}`);
    }
  } catch {
    components.push('canvas:unknown');
  }
  
  // Audio fingerprint
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    oscillator.connect(analyser);
    components.push(`audio:${audioContext.sampleRate}`);
    audioContext.close();
  } catch {
    components.push('audio:unknown');
  }
  
  // Generate hash
  const fingerprintString = components.join('|');
  const hash = await hashString(fingerprintString);
  
  return hash;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
