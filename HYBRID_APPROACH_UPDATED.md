# Hybrid Approach: RenderTexture Reveal → Portal Blend (React-Spring + useFrame)

## The Strategy

Combine both techniques for a seamless "TV inception" effect:

1. **Phase 1: Visual Reveal (RenderTexture + Custom Shader)**
   - Main camera animates toward TV screen (using useFrame lerp)
   - Custom shader reveals inner scene through the screen
   - User sees the transition happening

2. **Phase 2: Scene Switch (MeshPortalMaterial blend)**
   - At transition peak, flip blend: 0 → 1 (react-spring)
   - Camera "jumps" to portal camera position
   - User is now inside, can interact freely

## Component Structure

```tsx
<mesh ref={screenMesh}>
  {/* Layer 1: Custom shader material (for reveal animation) */}
  <TransitionShaderMaterial
    visible={transitionProgress < 1}
    map={loginTexture}
    map2={playlistsPreviewTexture}
    progress={transitionProgress}  {/* SpringValue */}
  />

  {/* Layer 2: Portal material (for actual scene entry) */}
  <MeshPortalMaterial
    visible={transitionProgress >= 0.99}
    blend={portalBlend}  {/* SpringValue: snaps 0 → 1 */}
  >
    <PlaylistsScene />
    <PerspectiveCamera
      ref={portalCameraRef}
      makeDefault
      position={[0, 0, 10]}
    />
  </MeshPortalMaterial>

  {/* Layer 3: Login form (outside, before transition) */}
  {transitionProgress < 0.1 && (
    <Html transform><AuthCard /></Html>
  )}
</mesh>
```

## Camera Animation with useFrame + Lerp

```tsx
// CameraController.tsx
import { useFrame, useThree } from '@react-three/fiber'
import { useObservable } from '@legendapp/state/react'
import { $sceneStore } from '~/stores/scene'
import { Vector3 } from 'three'

export function useCameraLerp() {
  const { camera } = useThree()
  const targetPosition = useObservable($sceneStore.camera.targetPosition)
  const isAnimating = useObservable($sceneStore.camera.isAnimating)

  useFrame(() => {
    if (isAnimating && targetPosition) {
      // Smooth lerp toward target
      camera.position.lerp(
        new Vector3(...targetPosition),
        0.05  // Lerp factor (adjust for speed)
      )

      // Check if close enough to target
      const distance = camera.position.distanceTo(
        new Vector3(...targetPosition)
      )

      if (distance < 0.01) {
        // Reached target
        $sceneStoreActions.setCameraAnimating(false)
        $sceneStore.camera.targetPosition.set(null)
      }
    }
  })
}
```

## SceneTransitionController with React-Spring

```tsx
// src/components/Canvas/transitions/SceneTransitionController.tsx
import { useThree } from '@react-three/fiber'
import { useObservable } from '@legendapp/state/react'
import { useEffect } from 'react'
import { $sceneStore, $sceneStoreActions } from '~/stores/scene'
import { $spotifyStore } from '~/stores/spotify'
import { useCameraLerp } from './useCameraLerp'

export default function SceneTransitionController() {
  const { camera } = useThree()

  const transitionState = useObservable($sceneStore.transition.state)
  const sceneDepth = useObservable($sceneStore.sceneDepth.current)
  const direction = useObservable($sceneStore.transition.direction)
  const playlistsReady = useObservable($spotifyStore.playlistsReady)
  const tracksReady = useObservable($spotifyStore.tracksReady)

  // Apply camera lerp animation
  useCameraLerp()

  // ENTRY: Depth 0 → 1 (Login → Playlists)
  useEffect(() => {
    if (
      sceneDepth === 0 &&
      playlistsReady &&
      transitionState === 'loading'
    ) {
      handleEntryTransition()
    }
  }, [sceneDepth, playlistsReady, transitionState])

  // EXIT: Depth 1 → 0 (Playlists → Login)
  useEffect(() => {
    if (
      direction === 'out' &&
      transitionState === 'transitioning'
    ) {
      handleExitTransition()
    }
  }, [direction, transitionState])

  async function handleEntryTransition() {
    $sceneStoreActions.setTransitionState('transitioning')

    // Set camera target for lerp
    $sceneStore.camera.targetPosition.set([0, -1.25, 0.5])
    $sceneStoreActions.setCameraAnimating(true)

    // Animate shader reveal with react-spring
    await $sceneStore.sceneDepth.transitionProgress.start(1, {
      config: { duration: 2000 }
    })

    // Shader animation complete
    // Camera sync and portal blend handled in SignInTV component
  }

  async function handleExitTransition() {
    // Camera already synced by SignInTV component
    // Now reverse shader progress
    await $sceneStore.sceneDepth.transitionProgress.start(0, {
      config: { duration: 2000 }
    })

    // Exit complete
    $sceneStoreActions.endTransition()
  }

  return null
}
```

## SignInTV with React-Spring

```tsx
// src/components/Canvas/SignInTV.tsx
import { MeshPortalMaterial, Html, useGLTF, RenderTexture, PerspectiveCamera } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useObservable } from '@legendapp/state/react'
import { useSpring, animated } from '@react-spring/three'
import { $sceneStore, $sceneStoreActions } from '~/stores/scene'
import { $spotifyStore } from '~/stores/spotify'
import { Vector3 } from 'three'
import TransitionMaterial from './transitions/TransitionMaterial'

export default function SignInTV(props) {
  const { nodes, materials } = useGLTF('tv.glb')
  const { camera: mainCamera } = useThree()

  const portalCameraRef = useRef()
  const screenMeshRef = useRef()
  const portalCameraTargetRef = useRef(new Vector3(0, 0, 10))

  const transitionProgress = useObservable($sceneStore.sceneDepth.transitionProgress)
  const portalBlend = useObservable($sceneStore.sceneDepth.portalBlend)
  const direction = useObservable($sceneStore.transition.direction)
  const playlistsReady = useObservable($spotifyStore.playlistsReady)

  // Animate portal camera with lerp when inside
  useFrame(() => {
    if (portalCameraRef.current && portalBlend > 0.5) {
      portalCameraRef.current.position.lerp(portalCameraTargetRef.current, 0.05)
    }

    // During exit, also lerp main camera back
    if (direction === 'out' && portalBlend < 0.5) {
      const exitTarget = new Vector3(0, 0, 5)
      mainCamera.position.lerp(exitTarget, 0.05)
    }
  })

  // ENTRY: Sync cameras and enter portal when shader completes
  useEffect(() => {
    if (
      direction === 'in' &&
      transitionProgress >= 0.99 &&
      portalBlend < 0.5 &&
      playlistsReady
    ) {
      // Copy main camera position to portal camera
      if (portalCameraRef.current) {
        portalCameraRef.current.position.copy(mainCamera.position)
        portalCameraRef.current.quaternion.copy(mainCamera.quaternion)
        portalCameraRef.current.updateProjectionMatrix()
      }

      // Enter portal (fast snap with react-spring)
      setTimeout(async () => {
        await $sceneStore.sceneDepth.portalBlend.start(1, {
          config: { duration: 100 }
        })

        // Once inside, move portal camera to comfortable position
        portalCameraTargetRef.current.set(0, 0, 10)
      }, 50)
    }
  }, [direction, transitionProgress, portalBlend, playlistsReady, mainCamera])

  // EXIT: Sync cameras and switch to shader layer
  useEffect(() => {
    if (
      direction === 'out' &&
      portalBlend > 0.5
    ) {
      // Copy portal camera to main camera
      if (portalCameraRef.current) {
        mainCamera.position.copy(portalCameraRef.current.position)
        mainCamera.quaternion.copy(portalCameraRef.current.quaternion)
        mainCamera.updateProjectionMatrix()
      }

      // Switch from portal to shader (instant with react-spring)
      $sceneStore.sceneDepth.portalBlend.start(0, {
        config: { duration: 100 }
      }).then(() => {
        // Set portal camera target to move toward exit
        portalCameraTargetRef.current.set(0, 0, 0.5)
      })
    }
  }, [direction, portalBlend, mainCamera])

  return (
    <group {...props} dispose={null}>
      {/* TV Frame */}
      <mesh
        geometry={nodes.TV.geometry}
        material={materials['TV_Chayka-206']}
        position={[-0.0011, 0.0054, -0.0071]}
        scale={5.0041}
      />

      {/* TV Screen */}
      <mesh
        ref={screenMeshRef}
        geometry={nodes.TVSCREEN.geometry}
        position={[-0.0011, 0.0054, -0.0071]}
        scale={5.0809}
      >
        {/* LAYER 1: Shader transition (visible during transitions) */}
        {(portalBlend < 0.1 || direction === 'out') && (
          <TransitionMaterial
            progress={transitionProgress}
            transparent
            opacity={portalBlend < 0.05 ? 1 : 1 - portalBlend}
          >
            {/* Login form texture */}
            <RenderTexture attach="map" width={512} height={512}>
              <color attach="background" args={['#fff']} />
              {/* Static preview of login */}
            </RenderTexture>

            {/* Playlists scene preview texture */}
            <RenderTexture attach="map2" width={1024} height={1024}>
              <color attach="background" args={['#000']} />
              {playlistsReady && <PlaylistsScenePreview />}
            </RenderTexture>
          </TransitionMaterial>
        )}

        {/* LAYER 2: Portal material */}
        {portalBlend > 0 && (
          <MeshPortalMaterial
            blend={portalBlend}
            blur={0.2}
            resolution={1024}
            events={portalBlend > 0.9}
            transparent
          >
            <color attach="background" args={['#000']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            <PlaylistsScene />

            {/* Portal camera - controlled by useFrame lerp */}
            <PerspectiveCamera
              ref={portalCameraRef}
              makeDefault
              fov={75}
            />
          </MeshPortalMaterial>
        )}

        {/* LAYER 3: Login form HTML */}
        {transitionProgress < 0.1 && portalBlend < 0.1 && (
          <Html
            transform
            occlude="blending"
            position={[0, 0, 0.01]}
            distanceFactor={0.5}
          >
            <AuthCard pathname="sign-in" />
          </Html>
        )}
      </mesh>

      {/* TV Bezel */}
      <mesh
        geometry={nodes.TVSCREENBEZEL.geometry}
        material={materials['TV_Chayka-206']}
        position={[-0.4388, 1.2966, 0.8396]}
        scale={[5.1008, 5.1032, 4.9647]}
      />
    </group>
  )
}

useGLTF.preload('tv.glb')
```

## Transition Timeline

```
ENTERING (in):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time:         0s          1s          2s        2.1s
              │           │           │           │
Shader        │◄──────────────────────►│          │
Progress      0 (react-spring)        1          1
              Login ────► Blend ────► Playlists   │
              │                        │           │
Main Camera   │◄──────────────────────►│          │
Position      z:5 (useFrame lerp)   z:0.5       z:0.5
              │                        │           │
              │                        ↓           │
              │                    SYNC CAMERAS    │
              │                        ↓           │
Portal        │                        │          ↓│
Blend         0 (react-spring)        0 ────────► 1
              │                        │           │
              Outside                  │        Inside!


EXITING (out):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time:         0s       0.1s          1s          2s
              │         │            │           │
Portal        │         ↓            │           │
Blend         1 (react-spring)       0           0
              │    SYNC CAMERAS      │           │
              │         ↓            │           │
              │    SWITCH TO SHADER  │           │
              │         │            │           │
Shader        │         │◄───────────────────────►│
Progress      1 (react-spring)                   0
              Playlists │ ◄──── Blend ◄──── Login │
              │         │                         │
Main Camera   │         │◄───────────────────────►│
Position    z:0.5 (useFrame lerp)              z:5
              │         │                         │
Portal Camera │         │◄───────────────────────►│
Position     z:10 (useFrame lerp)              z:0.5
              │         │                         │
              Inside    │                    Outside!
```

## React-Spring vs useFrame Lerp

### React-Spring (SpringValue):
- ✅ `transitionProgress` - Shader reveal animation
- ✅ `portalBlend` - Portal material blend (instant switch)
- ✅ Precise timing control with `config: { duration }`

### useFrame Lerp:
- ✅ Main camera position - Smooth continuous movement
- ✅ Portal camera position - Smooth continuous movement
- ✅ Frame-perfect synchronization
- ✅ Natural easing with lerp factor

## Store Actions Updated

```typescript
// src/stores/scene.ts
export const $sceneStoreActions = observable<SceneStoreActions>({
  incept: async () => {
    const currentDepth = $sceneStore.sceneDepth.current.get()
    const maxDepth = $sceneStore.sceneDepth.max.get()

    if (currentDepth < maxDepth) {
      $sceneStore.transition.direction.set('in')
      $sceneStoreActions.startTransition((currentDepth + 1) as SceneDepth)

      // Set camera target for useFrame lerp
      $sceneStore.camera.targetPosition.set([0, -1.25, 0.5])
      $sceneStoreActions.setCameraAnimating(true)

      // Animate shader with react-spring
      await $sceneStore.sceneDepth.transitionProgress.start(1, {
        config: { duration: 2000 }
      })
    }
  },

  regress: async () => {
    const currentDepth = $sceneStore.sceneDepth.current.get()

    if (currentDepth > 0) {
      $sceneStore.transition.direction.set('out')
      $sceneStoreActions.startTransition((currentDepth - 1) as SceneDepth)

      // Camera sync happens in component
      // Then reverse shader with react-spring
      await $sceneStore.sceneDepth.transitionProgress.start(0, {
        config: { duration: 2000 }
      })
    }
  },

  // ... other actions ...
})
```

## React-Spring Config Options

```tsx
import { config } from '@react-spring/three'

// Fast instant switch
$sceneStore.sceneDepth.portalBlend.start(1, {
  config: { duration: 100 }
})

// Smooth timed transition
$sceneStore.sceneDepth.transitionProgress.start(1, {
  config: { duration: 2000 }
})

// Physics-based (not recommended for precise timing)
$sceneStore.sceneDepth.transitionProgress.start(1, {
  config: config.slow
})
```

## useFrame Lerp Factors

```tsx
// Adjust lerp factor for different speeds:

// Slow smooth (0.01 - 0.03)
camera.position.lerp(target, 0.02)

// Medium (0.04 - 0.07)
camera.position.lerp(target, 0.05)

// Fast (0.08 - 0.15)
camera.position.lerp(target, 0.1)

// Very fast (0.15+)
camera.position.lerp(target, 0.2)
```

## Key Benefits

1. ✅ **React-spring for discrete animations** - Shader reveal, portal blend
2. ✅ **useFrame lerp for continuous motion** - Camera movement
3. ✅ **No extra camera spring state** - Simple targetPosition in store
4. ✅ **Frame-perfect** - useFrame ensures smooth 60fps
5. ✅ **Easy to debug** - Check targetPosition and lerp visually

## Implementation Checklist

- [x] Add `portalBlend` SpringValue to store
- [ ] Create `TransitionMaterial.tsx` component
- [ ] Create `useCameraLerp` hook for camera animation
- [ ] Update `SceneTransitionController` with react-spring
- [ ] Update `SignInTV` with hybrid approach
- [ ] Update `CameraShake` to respect isAnimating
- [ ] Test entry transition (shader + camera lerp)
- [ ] Test camera sync at peak
- [ ] Test portal blend switch
- [ ] Test exit transition (reverse)
- [ ] Fine-tune lerp factors and timing
