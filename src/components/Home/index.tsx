import { Suspense } from "react";

import { getSession } from "~/auth/server";
import SignInButton from "~/components/auth/SignIn";

import HomeClient from "./client";
import HomeLoader from "./loading";

export default async function Home() {
	const session = await getSession()
	return (
		<Suspense fallback={<HomeLoader />}>
			<HomeClient auth={session}>
				<SignInButton />
			</HomeClient>
		</Suspense>
	);
}
