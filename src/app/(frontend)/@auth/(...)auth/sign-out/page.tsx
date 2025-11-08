"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { signOut } from "~/auth/client";

export default function Page() {
	const router = useRouter()
	useEffect(() => {
		async function signout() {
			await signOut()
			router.push("/")
		}
		void signout()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return null;
}
