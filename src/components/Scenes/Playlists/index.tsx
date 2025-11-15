import Playlists from "~/components/Canvas/Playlists";

export default function PlaylistsScene() {
	return (
		<>
			<Playlists position={[0, 0, -10]} rotation={[0, 0, -Math.PI / 2]} />
			<ambientLight intensity={1} />
			<directionalLight intensity={1} position={[5, 5, 5]} />
			<color args={["#050505"]} attach="background" />
		</>
	)
}
