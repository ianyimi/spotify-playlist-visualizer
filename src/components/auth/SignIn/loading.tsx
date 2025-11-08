import { Loader2Icon } from "lucide-react"

import { Button } from '~/ui/button'

export default function SignInLoader() {
	return (
		<Button className="justify-between cursor-pointer gap-2" disabled variant="default">
			<Loader2Icon className="animate-spin" />
		</Button>
	)
}


