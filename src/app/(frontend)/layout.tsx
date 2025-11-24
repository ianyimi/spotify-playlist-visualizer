import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import SceneLoader from "~/components/Canvas/SceneLoader";
import ClientProviders from "~/components/Dom/Providers/client";
import ServerProviders from "~/components/Dom/Providers/server";

export const metadata: Metadata = {
	description: "Spotify Playlist Visualizer",
	icons: [{ rel: "icon", url: "/favicons/favicon.ico" }],
	title: "playlistviz.com",
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	auth,
	children,
}: Readonly<{ auth: React.ReactNode; children: React.ReactNode }>) {
	return (
		<html className={`${geist.variable}`} lang="en">
			<head>
				{/* Favicons */}
				<link
					href="/favicons/favicon-57x57.png"
					rel="apple-touch-icon"
					sizes="57x57"
				/>
				<link
					href="/favicons/favicon-60x60.png"
					rel="apple-touch-icon"
					sizes="60x60"
				/>
				<link
					href="/favicons/favicon-72x72.png"
					rel="apple-touch-icon"
					sizes="72x72"
				/>
				<link
					href="/favicons/favicon-76x76.png"
					rel="apple-touch-icon"
					sizes="76x76"
				/>
				<link
					href="/favicons/favicon-114x114.png"
					rel="apple-touch-icon"
					sizes="114x114"
				/>
				<link
					href="/favicons/favicon-120x120.png"
					rel="apple-touch-icon"
					sizes="120x120"
				/>
				<link
					href="/favicons/favicon-144x144.png"
					rel="apple-touch-icon"
					sizes="144x144"
				/>
				<link
					href="/favicons/favicon-152x152.png"
					rel="apple-touch-icon"
					sizes="152x152"
				/>
				<link
					href="/favicons/favicon-180x180.png"
					rel="apple-touch-icon"
					sizes="180x180"
				/>
				<link
					href="/favicons/favicon-16x16.png"
					rel="icon"
					sizes="16x16"
					type="image/png"
				/>
				<link
					href="/favicons/favicon-32x32.png"
					rel="icon"
					sizes="32x32"
					type="image/png"
				/>
				<link
					href="/favicons/favicon-96x96.png"
					rel="icon"
					sizes="96x96"
					type="image/png"
				/>
				<link
					href="/favicons/favicon-192x192.png"
					rel="icon"
					sizes="192x192"
					type="image/png"
				/>
				<link
					href="/favicons/favicon.ico"
					rel="shortcut icon"
					type="image/x-icon"
				/>
				<link href="/favicons/favicon.ico" rel="icon" type="image/x-icon" />
				<meta
					content="/favicons/favicon-144x144.png"
					name="msapplication-TileImage"
				/>
			</head>
			<body className="bg-[#15160c]">
				<ServerProviders>
					<ClientProviders>
						{children}
						{auth}
						<SceneLoader />
					</ClientProviders>
				</ServerProviders>
			</body>
		</html>
	);
}
