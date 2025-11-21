import { useValue } from "@legendapp/state/react";
import { useThree } from "@react-three/fiber";
import { type RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { type Group, Vector2, Vector3 } from "three";

import { useFramerate } from "~/hooks/useFramerate";
import { $spotifyStore, $spotifyStoreActions } from "~/stores/spotify";

import { getInstancePosition } from ".";

const HOVER_POLL_INTERVAL = 50; // Check hover every 50ms
const HOVER_DETECTION_THRESHOLD = 0.25 // Match portfolio project threshold (screen space)
// const HOVER_DETECTION_THRESHOLD = 0.05 // Match portfolio project threshold (screen space)
const MOUSE_MOVEMENT_THRESHOLD = 0.001; // Minimum mouse movement to trigger new hover detection

export function useTrackHoveredInstance({ count, groupRef }: { count: number, groupRef: RefObject<Group | null> }) {
	const { camera } = useThree()
	const mouseRef = useRef(new Vector2(999, 999));
	const lastMousePositionRef = useRef(new Vector2(999, 999));
	const lastHoverCheckRef = useRef<number>(0);

	const positions = useMemo(() => {
		const result = []
		for (let i = 0; i < count; i++) {
			result.push(getInstancePosition({ index: i, offsets: [-0.25, 1.25, 0], total: count }))
		}
		return result
	}, [count])

	const detectHoveredParticle = useCallback((): null | number => {
		// Precise hover detection threshold
		let closestDistance = Infinity;
		let closestIndex: null | number = null;
		const tempVector = new Vector3();

		// Check all particles (no sampling)
		for (let i = 0; i < count; i++) {

			tempVector.copy(positions[i]!);
			if (groupRef.current) {
				tempVector.applyMatrix4(groupRef.current.matrixWorld);
			}
			tempVector.project(camera);

			const screenDistance = Math.sqrt(
				Math.pow(tempVector.x - mouseRef.current.x, 2) +
				Math.pow(tempVector.y - mouseRef.current.y, 2)
			);

			if (screenDistance < closestDistance) {
				closestDistance = screenDistance;
				closestIndex = i;
			}
		}

		// Only return the particle if it's within the threshold
		// This ensures hover is cleared when mouse moves too far away
		if (closestDistance < HOVER_DETECTION_THRESHOLD) {
			return closestIndex;
		}

		return null;
	}, [camera, groupRef, positions, count]);

	const isMobileDevice = useRef(
		typeof navigator !== 'undefined' &&
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	);

	// Mouse event handling - CRITICAL: This updates mouseRef with actual mouse position
	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			// Use requestAnimationFrame to throttle updates
			requestAnimationFrame(() => {
				mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
				mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
			});
		};

		window.addEventListener("mousemove", handleMouseMove, { passive: true });
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	const hoveredPlaylist = useValue($spotifyStore.hoveredPlaylist)
	const spotifyStoreActions = useValue($spotifyStoreActions)
	useFramerate(30, () => {
		if (!isMobileDevice.current) {
			const now = Date.now();
			if (now - lastHoverCheckRef.current > HOVER_POLL_INTERVAL) {
				lastHoverCheckRef.current = now;

				// Calculate mouse movement since last check
				const mouseDeltaX = Math.abs(mouseRef.current.x - lastMousePositionRef.current.x);
				const mouseDeltaY = Math.abs(mouseRef.current.y - lastMousePositionRef.current.y);
				const mouseHasMoved = mouseDeltaX > MOUSE_MOVEMENT_THRESHOLD || mouseDeltaY > MOUSE_MOVEMENT_THRESHOLD;

				// Only detect new hover if mouse has moved
				if (mouseHasMoved) {
					lastMousePositionRef.current.copy(mouseRef.current);
					const detected = detectHoveredParticle();
					if (detected !== hoveredPlaylist) {
						spotifyStoreActions.setHoveredPlaylist(detected)
					}
				}
				// If mouse hasn't moved, keep current hover state (don't call onHover)
			}
		}
	})
}
