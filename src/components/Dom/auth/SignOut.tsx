"use client"

import { useRouter } from "next/navigation";

import { authClient } from "~/auth/client";
import { Button } from "~/ui/button";

export default function SignOut() {
	const router = useRouter();

	async function handleSignOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
					router.refresh();
				},
			},
		});
	};

	return (
		<Button onClick={handleSignOut}>Sign Out</Button>
	)
}
