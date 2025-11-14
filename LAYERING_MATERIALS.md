# Layering TransitionMaterial + MeshPortalMaterial

## The Problem

You can't have two materials on one mesh directly. Instead, you need to:
1. Use TransitionMaterial during the reveal (progress: 0 → 1)
2. Switch to MeshPortalMaterial when progress hits ~0.99
3. Animate portalBlend: 0 → 1 to enter the portal

## Solution: Conditional Material Rendering

```tsx
import { MeshPortalMaterial, RenderTexture, PerspectiveCamera } from '@react-three/drei'
import { useObservable } from '@legendapp/state/react'
import { useEffect, useRef } from 'react'
import { $sceneStore, $sceneStoreActions } from '~/stores/scene'
import TransitionMaterial from './transitions/TransitionMaterial'

export default function SignInTV(props) {
  const { nodes, materials } = useGLTF('tv.glb')
  const portalCameraRef = useRef()

  const transitionProgress = useObservable($sceneStore.sceneDepth.transitionProgress)
  const portalBlend = useObservable($sceneStore.sceneDepth.portalBlend)
  const direction = useObservable($sceneStore.transition.direction)

  // When transition shader completes, switch to portal
  useEffect(() => {
    if (transitionProgress >= 0.99 && portalBlend < 0.5 && direction === 'in') {
      // Sync cameras first
      if (portalCameraRef.current && camera) {
        portalCameraRef.current.position.copy(camera.position)
        portalCameraRef.current.quaternion.copy(camera.quaternion)
      }

      // Then switch to portal (fast)
      $sceneStore.sceneDepth.portalBlend.start(1, {
        config: { duration: 100 }
      })
    }
  }, [transitionProgress, portalBlend, direction])

  // Determine which material to use
  const usePortal = portalBlend > 0.01
  const useTransition = !usePortal || direction === 'out'

  return (
    <group {...props}>
      <mesh geometry={nodes.TV.geometry} material={materials['TV_Chayka-206']} />

      {/* TV Screen - only ONE material active at a time */}
      <mesh geometry={nodes.TVSCREEN.geometry}>

        {/* OPTION A: Transition Material (during reveal) */}
        {useTransition && (
          <TransitionMaterial
            progress={transitionProgress}
            transitionType={1}
            transparent
            opacity={portalBlend > 0 ? 1 - portalBlend : 1}
          >
            {/* Scene A: Login */}
            <RenderTexture attach="map" width={512} height={512}>
              <color attach="background" args={['#fff']} />
              <PerspectiveCamera position={[0, 0, 5]} />
              {/* Your login scene */}
            </RenderTexture>

            {/* Scene B: Playlists Preview */}
            <RenderTexture attach="map2" width={1024} height={1024}>
              <color attach="background" args={['#000']} />
              <PerspectiveCamera position={[0, 0, 10]} />
              {/* Preview of playlists scene */}
            </RenderTexture>
          </TransitionMaterial>
        )}

        {/* OPTION B: Portal Material (after reveal completes) */}
        {usePortal && (
          <MeshPortalMaterial
            blend={portalBlend}
            blur={0.2}
            resolution={1024}
            events={portalBlend > 0.9}
          >
            <color attach="background" args={['#000']} />
            <ambientLight intensity={0.5} />

            {/* Real interactive playlists scene */}
            <PlaylistsScene />

            {/* Portal camera - centered at [0,0,0] in portal space */}
            <PerspectiveCamera
              ref={portalCameraRef}
              makeDefault
              position={[0, 0, 0]}
              fov={75}
            />
          </MeshPortalMaterial>
        )}
      </mesh>
    </group>
  )
}
```

## Timeline: How Materials Switch

```
Time:       0s         1s         2s       2.05s      2.1s
            │          │          │          │          │
Transition  │◄─────────────────────►│         │          │
Progress    0                       1         1          1
            │                       │         │          │
            │                       ↓         │          │
Material    TRANSITION         CHECK: >= 0.99│          │
Active      (showing)               │         │          │
            │                       │         │          │
            │                  SYNC CAMERAS   │          │
            │                       │         ↓          │
Portal      │                       │    START BLEND     │
Blend       0 ──────────────────────0 ──────► 1 ────────► 1
            │                       │         │          │
Material    TRANSITION         TRANSITION  PORTAL     PORTAL
Active      (opacity=1)        (opacity→0) (blend=1)  (blend=1)
```

## Alternative: Crossfade Both Materials

If you want a smoother handoff, render both and crossfade:

```tsx
<mesh geometry={nodes.TVSCREEN.geometry}>
  {/* Layer 1: Transition Material (fades out) */}
  <TransitionMaterial
    progress={transitionProgress}
    transitionType={1}
    transparent
    opacity={Math.max(0, 1 - portalBlend)}
  >
    <RenderTexture attach="map" width={512} height={512}>
      {/* Scene A */}
    </RenderTexture>
    <RenderTexture attach="map2" width={1024} height={1024}>
      {/* Scene B preview */}
    </RenderTexture>
  </TransitionMaterial>

  {/* Layer 2: Portal Material (fades in) */}
  {portalBlend > 0 && (
    <MeshPortalMaterial
      blend={portalBlend}
      blur={0.2}
    >
      {/* Real scene */}
      <PlaylistsScene />
      <PerspectiveCamera ref={portalCameraRef} makeDefault position={[0, 0, 0]} />
    </MeshPortalMaterial>
  )}
</mesh>
```

**Problem:** You can't have two materials on one mesh in Three.js.

## Best Solution: Use Two Overlapping Meshes

```tsx
<group>
  {/* Mesh 1: Transition Material */}
  <mesh
    geometry={nodes.TVSCREEN.geometry}
    position={[0, 0, 0]}
    visible={portalBlend < 0.99}
  >
    <TransitionMaterial
      progress={transitionProgress}
      transparent
      opacity={1 - portalBlend}
    >
      <RenderTexture attach="map" width={512} height={512}>
        {/* Scene A */}
      </RenderTexture>
      <RenderTexture attach="map2" width={1024} height={1024}>
        {/* Scene B */}
      </RenderTexture>
    </TransitionMaterial>
  </mesh>

  {/* Mesh 2: Portal Material (slightly in front) */}
  <mesh
    geometry={nodes.TVSCREEN.geometry}
    position={[0, 0, 0.001]}  // Slightly forward to avoid z-fighting
    visible={portalBlend > 0}
  >
    <MeshPortalMaterial
      blend={portalBlend}
      blur={0.2}
      resolution={1024}
      events={portalBlend > 0.9}
    >
      <color attach="background" args={['#000']} />
      <PlaylistsScene />
      <PerspectiveCamera
        ref={portalCameraRef}
        makeDefault
        position={[0, 0, 0]}
      />
    </MeshPortalMaterial>
  </mesh>
</group>
```

## Recommended: Simple Material Swap (Cleanest)

```tsx
export default function SignInTV(props) {
  const transitionProgress = useObservable($sceneStore.sceneDepth.transitionProgress)
  const portalBlend = useObservable($sceneStore.sceneDepth.portalBlend)
  const direction = useObservable($sceneStore.transition.direction)

  // Auto-switch when transition completes
  useEffect(() => {
    if (
      transitionProgress >= 0.99 &&
      portalBlend === 0 &&
      direction === 'in'
    ) {
      // Small delay for visual continuity
      setTimeout(() => {
        $sceneStore.sceneDepth.portalBlend.start(1, {
          config: { duration: 100 }
        })
      }, 50)
    }
  }, [transitionProgress, portalBlend, direction])

  // Simple boolean: which material to render?
  const showPortal = portalBlend > 0.5

  return (
    <mesh geometry={nodes.TVSCREEN.geometry}>
      {showPortal ? (
        // After transition: Show portal
        <MeshPortalMaterial blend={portalBlend}>
          <PlaylistsScene />
          <PerspectiveCamera makeDefault position={[0, 0, 0]} />
        </MeshPortalMaterial>
      ) : (
        // During transition: Show shader
        <TransitionMaterial progress={transitionProgress}>
          <RenderTexture attach="map" width={512} height={512}>
            {/* Scene A */}
          </RenderTexture>
          <RenderTexture attach="map2" width={1024} height={1024}>
            {/* Scene B */}
          </RenderTexture>
        </TransitionMaterial>
      )}
    </mesh>
  )
}
```

## Key Points

1. **TransitionMaterial shows RenderTexture preview** of both scenes
2. **When progress >= 0.99**: Switch to MeshPortalMaterial
3. **MeshPortalMaterial.blend animates 0 → 1**: Enter the real scene
4. **Scenes are centered at [0,0,0]**: Simple camera math

## Testing the Switch

Add debug info:

```tsx
import { Html } from '@react-three/drei'

function Debug() {
  const transitionProgress = useObservable($sceneStore.sceneDepth.transitionProgress)
  const portalBlend = useObservable($sceneStore.sceneDepth.portalBlend)

  return (
    <Html position={[0, 3, 0]}>
      <div style={{ color: 'white', background: 'rgba(0,0,0,0.8)', padding: 10 }}>
        <div>Transition Progress: {transitionProgress.toFixed(3)}</div>
        <div>Portal Blend: {portalBlend.toFixed(3)}</div>
        <div>Material: {portalBlend > 0.5 ? 'PORTAL' : 'TRANSITION'}</div>
      </div>
    </Html>
  )
}
```

## Triggering the Sequence

```tsx
// User logs in, playlists load
$spotifyStoreActions.setLoadingPlaylists(false)
$spotifyStore.playlistsReady.set(true)

// This triggers transition
$sceneStoreActions.incept()

// Which does:
// 1. transitionProgress: 0 → 1 (2 seconds)
// 2. When >= 0.99: portalBlend: 0 → 1 (100ms)
// 3. User is now inside portal!
```

Would you like me to show the complete SignInTV component with all the pieces integrated?
