# TransitionMaterial Component Example

## File: `src/components/Canvas/transitions/TransitionMaterial.tsx`

```tsx
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { ReactNode } from 'react'
import * as THREE from 'three'

// Define the shader material
const TransitionMaterialImpl = shaderMaterial(
  {
    map: null,
    map2: null,
    progress: 0,
    transitionType: 0, // 0 = fade, 1 = wipe, 2 = dissolve
  },
  // Vertex shader
  /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  /* glsl */ `
    uniform sampler2D map;
    uniform sampler2D map2;
    uniform float progress;
    uniform int transitionType;

    varying vec2 vUv;

    // Random function for dissolve effect
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec4 texA = texture2D(map, vUv);
      vec4 texB = texture2D(map2, vUv);

      float p = smoothstep(0.0, 1.0, progress);
      vec4 finalColor;

      if (transitionType == 0) {
        // Simple fade
        finalColor = mix(texA, texB, p);

      } else if (transitionType == 1) {
        // Circular wipe from center
        float dist = distance(vUv, vec2(0.5));
        float maxDist = distance(vec2(0.0), vec2(0.5));
        float normalizedDist = dist / maxDist;

        float reveal = smoothstep(p - 0.1, p + 0.1, 1.0 - normalizedDist);
        finalColor = mix(texA, texB, reveal);

      } else if (transitionType == 2) {
        // Dissolve/noise transition
        float noise = random(vUv);
        float threshold = p;
        float edge = 0.05;

        float alpha = smoothstep(threshold - edge, threshold + edge, noise);
        finalColor = mix(texA, texB, alpha);

      } else {
        // Fallback to fade
        finalColor = mix(texA, texB, p);
      }

      gl_FragColor = finalColor;
    }
  `
)

// Extend Three.js with the custom material
extend({ TransitionMaterial: TransitionMaterialImpl })

// TypeScript declaration for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      transitionMaterial: ReactNode & {
        map?: THREE.Texture | null
        map2?: THREE.Texture | null
        progress?: number
        transitionType?: number
        transparent?: boolean
        opacity?: number
        side?: THREE.Side
      }
    }
  }
}

interface TransitionMaterialProps {
  children?: ReactNode
  map?: THREE.Texture | null
  map2?: THREE.Texture | null
  progress: number
  transitionType?: 0 | 1 | 2 // 0 = fade, 1 = circular wipe, 2 = dissolve
  transparent?: boolean
  opacity?: number
  side?: THREE.Side
}

export default function TransitionMaterial({
  children,
  map,
  map2,
  progress,
  transitionType = 0,
  transparent = false,
  opacity = 1,
  side = THREE.FrontSide,
}: TransitionMaterialProps) {
  return (
    <transitionMaterial
      map={map}
      map2={map2}
      progress={progress}
      transitionType={transitionType}
      transparent={transparent}
      opacity={opacity}
      side={side}
    >
      {children}
    </transitionMaterial>
  )
}
```

## Usage Examples

### 1. With RenderTexture (recommended for your use case)

```tsx
import { RenderTexture } from '@react-three/drei'
import { useObservable } from '@legendapp/state/react'
import { $sceneStore } from '~/stores/scene'
import TransitionMaterial from './transitions/TransitionMaterial'

function TVScreen() {
  const transitionProgress = useObservable($sceneStore.sceneDepth.transitionProgress)

  return (
    <mesh>
      <planeGeometry args={[4, 3]} />
      <TransitionMaterial
        progress={transitionProgress}
        transitionType={1}  // Circular wipe
        transparent
      >
        {/* Scene A: Login form */}
        <RenderTexture attach="map" width={512} height={512}>
          <color attach="background" args={['#ffffff']} />
          <LoginScene />
        </RenderTexture>

        {/* Scene B: Playlists */}
        <RenderTexture attach="map2" width={1024} height={1024}>
          <color attach="background" args={['#000000']} />
          <PlaylistsScene />
        </RenderTexture>
      </TransitionMaterial>
    </mesh>
  )
}
```

### 2. With useTexture (for image files)

```tsx
import { useTexture } from '@react-three/drei'
import TransitionMaterial from './transitions/TransitionMaterial'

function ImageTransition() {
  const [texture1, texture2] = useTexture([
    '/images/scene1.jpg',
    '/images/scene2.jpg'
  ])

  const [progress, setProgress] = useState(0)

  return (
    <mesh>
      <planeGeometry args={[4, 3]} />
      <TransitionMaterial
        map={texture1}
        map2={texture2}
        progress={progress}
        transitionType={2}  // Dissolve effect
      />
    </mesh>
  )
}
```

### 3. With THREE.Texture directly

```tsx
import * as THREE from 'three'
import TransitionMaterial from './transitions/TransitionMaterial'

function CustomTextureTransition() {
  // Create textures from canvas or data
  const texture1 = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    // ... draw on canvas
    return new THREE.CanvasTexture(canvas)
  }, [])

  const texture2 = useMemo(() => {
    // Similar setup
  }, [])

  return (
    <mesh>
      <planeGeometry args={[4, 3]} />
      <TransitionMaterial
        map={texture1}
        map2={texture2}
        progress={0.5}
        transitionType={0}  // Simple fade
      />
    </mesh>
  )
}
```

## Transition Types

### 0 - Simple Fade
```glsl
finalColor = mix(texA, texB, p);
```
Linear blend between two textures.

### 1 - Circular Wipe
```glsl
float dist = distance(vUv, vec2(0.5));
float reveal = smoothstep(p - 0.1, p + 0.1, 1.0 - normalizedDist);
finalColor = mix(texA, texB, reveal);
```
Reveals from center outward in a circle.

### 2 - Dissolve/Noise
```glsl
float noise = random(vUv);
float alpha = smoothstep(threshold - edge, threshold + edge, noise);
finalColor = mix(texA, texB, alpha);
```
Random pixel-by-pixel dissolve effect.

## Adding Custom Transition Effects

Add more transition types by extending the shader:

```glsl
else if (transitionType == 3) {
  // Horizontal wipe
  float wipe = smoothstep(p - 0.05, p + 0.05, vUv.x);
  finalColor = mix(texA, texB, wipe);

} else if (transitionType == 4) {
  // Diagonal wipe
  float diagonal = (vUv.x + vUv.y) / 2.0;
  float wipe = smoothstep(p - 0.1, p + 0.1, diagonal);
  finalColor = mix(texA, texB, wipe);
}
```

## Animating with React-Spring

```tsx
import { useObservable } from '@legendapp/state/react'
import { $sceneStore } from '~/stores/scene'

function AnimatedTransition() {
  // This value is animated by react-spring in the store
  const progress = useObservable($sceneStore.sceneDepth.transitionProgress)

  return (
    <TransitionMaterial
      progress={progress}
      // ... other props
    />
  )
}

// Trigger animation in your controller:
$sceneStore.sceneDepth.transitionProgress.start(1, {
  config: { duration: 2000 }
})
```

## Performance Tips

1. **Texture Resolution**: Use lower resolution for static previews
   ```tsx
   <RenderTexture attach="map" width={512} height={512}>
   ```

2. **Conditional Rendering**: Only render when transitioning
   ```tsx
   {(transitionProgress > 0 && transitionProgress < 1) && (
     <TransitionMaterial progress={transitionProgress} />
   )}
   ```

3. **Texture Disposal**: Clean up when done
   ```tsx
   useEffect(() => {
     return () => {
       texture1?.dispose()
       texture2?.dispose()
     }
   }, [])
   ```

## Debugging

Add this to see the progress visually:

```tsx
import { Html } from '@react-three/drei'

function Debug() {
  const progress = useObservable($sceneStore.sceneDepth.transitionProgress)

  return (
    <Html position={[0, 2, 0]}>
      <div style={{ color: 'white', background: 'rgba(0,0,0,0.7)' }}>
        Progress: {progress.toFixed(2)}
      </div>
    </Html>
  )
}
```

## Simplified Camera Approach

Since you mentioned making each scene built around `[0,0,0]` for the camera:

```tsx
// Each scene has its own coordinate system centered at [0,0,0]

// Login Scene (Depth 0)
<PerspectiveCamera position={[0, 0, 5]} />

// Playlists Scene (Depth 1) - inside portal
<MeshPortalMaterial>
  <PerspectiveCamera position={[0, 0, 0]} makeDefault />
  <PlaylistsScene />  {/* Everything positioned relative to [0,0,0] */}
</MeshPortalMaterial>

// Tracks Scene (Depth 2) - inside nested portal
<MeshPortalMaterial>
  <PerspectiveCamera position={[0, 0, 0]} makeDefault />
  <TracksScene />  {/* Everything positioned relative to [0,0,0] */}
</MeshPortalMaterial>
```

This simplifies the math - no need to calculate world positions!
