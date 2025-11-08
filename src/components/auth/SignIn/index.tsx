"use client"

import { Loader2Icon, LogIn, LogOut } from "lucide-react"
import Link from "next/link"

import { useSession } from "~/auth/client"
import { Button } from '~/ui/button'

export default function SignInButton({ loading }: { loading: boolean }) {
	const { data: session } = useSession()

	if (loading) {
		return (
			<Button className="justify-between cursor-pointer gap-2" variant="default">
				<Loader2Icon className="animate-spin" />
				<span>Loading</span>
			</Button>
		)
	}

	return (
		<Link href={session ? "/auth/sign-out" : "/auth/sign-in"}>
			<Button className="justify-between cursor-pointer gap-2" variant="default">
				{!session ? (
					<LogOut size={20} />
				) : (
					<LogIn size={20} />
				)
				}
				<span>{session ? 'Sign Out' : 'Sign In'}</span>
			</Button>
		</Link>
	)
}


