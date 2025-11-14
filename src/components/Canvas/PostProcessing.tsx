import { useThree } from "@react-three/fiber"

export default function PostProcessing() {
	const { viewport } = useThree()
	return (
		<group>
			<mesh scale={[viewport.width, viewport.height, 1]}>
				<planeGeometry />
				<meshStandardMaterial color="purple" />
			</mesh>
		</group>
	)
}
