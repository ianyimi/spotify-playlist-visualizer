"use client"

import { LogIn, LogOut } from "lucide-react"
import Link from "next/link"

import type { ServerAuthContext } from "~/auth/types"

import { Button } from '~/ui/button'

export default function SignInClient({ auth }: { auth: ServerAuthContext }) {
	return (
		<Link href={auth?.session ? "/auth/sign-out" : "/auth/sign-in"}>
			<Button className="justify-between cursor-pointer gap-2" variant="default">
				{!auth?.session ? (
					<LogOut size={20} />
				) : (
					<LogIn size={20} />
				)}
				<span>{auth?.session ? 'Sign Out' : 'Sign In'}</span>
			</Button>
		</Link>
	)
}


