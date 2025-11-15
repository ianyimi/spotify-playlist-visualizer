"use client"

import type { ComponentPropsWithRef } from "react"

import { Loader2Icon, LogIn, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import { signOut, useSession } from "~/auth/client"
import { cn } from "~/styles/utils"
import { Button } from '~/ui/button'

export default function SignInButton({ className, loading, ...buttonProps }: ComponentPropsWithRef<"button"> & { loading: boolean }) {
	const { data: session } = useSession()
	const router = useRouter()

	if (loading) {
		return (
			<Button className="justify-between cursor-pointer gap-2" variant="default">
				<Loader2Icon className="animate-spin" />
				<span>Loading</span>
			</Button>
		)
	}

	async function handleAuth() {
		if (!session) {
			router.push("/auth/sign-in")
		} else {
			await signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/")
						router.refresh()
					}
				}
			})
		}
	}

	return (
		<Button className={cn("justify-between cursor-pointer gap-2", className)} onClick={handleAuth} variant="default" {...buttonProps}>
			{!session ? (
				<LogOut size={20} />
			) : (
				<LogIn size={20} />
			)
			}
			<span>{session ? 'Sign Out' : 'Sign In'}</span>
		</Button>
	)
}


