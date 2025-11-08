import { Suspense } from 'react'

import { getSession } from '~/auth/server'

import SignInClient from './client'
import SignInLoader from "./loading"

export default async function SignInButton() {
	const session = await getSession()
	return (
		<Suspense fallback={<SignInLoader />}>
			<SignInClient auth={session} />
		</Suspense>
	)
}

