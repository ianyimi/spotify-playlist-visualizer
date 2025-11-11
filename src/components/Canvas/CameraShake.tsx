import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Quaternion, Vector2, Vector3 } from "three";

export default function CameraShake({ dragControls = false, shakiness = 1 }: { dragControls?: boolean; shakiness?: number, }) {

	const [baseQuaternion] = useState(() => new Quaternion());
	const [targetQuaternion] = useState(() => new Quaternion());
	const { camera } = useThree();

	useEffect(() => {

		const mouse = new Vector2();
		baseQuaternion.copy(camera.quaternion);

		function handleMouseMove(event: MouseEvent) {

			event = event || window.event as MouseEvent;
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

			const intensity = shakiness / 20;

			// Create rotation around Y axis (horizontal mouse movement)
			const yRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -mouse.x * intensity);

			// Create rotation around X axis (vertical mouse movement)
			const xRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), mouse.y * intensity);

			// Combine rotations: base * yRotation * xRotation
			targetQuaternion.copy(baseQuaternion)
				.multiply(yRotation)
				.multiply(xRotation);

			camera.quaternion.slerp(targetQuaternion, 0.1);

		}

		document.addEventListener('mousemove', handleMouseMove);

		return () => {

			document.removeEventListener("mousemove", handleMouseMove);

		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return dragControls ? <OrbitControls /> : <></>;

}
