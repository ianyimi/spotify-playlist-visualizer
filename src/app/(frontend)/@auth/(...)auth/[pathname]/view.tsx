import { AuthView } from "@daveyplate/better-auth-ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import { Dialog, DialogContent } from "~/ui/dialog";

export default function AuthCard({ pathname }: { pathname: string }) {
	return (
		<main>
			<Dialog open>
				<VisuallyHidden>
					<DialogTitle />
				</VisuallyHidden>
				<DialogContent
					aria-describedby={undefined}
					className="grid place-items-center border-none bg-transparent shadow-none"
					showCloseButton={false}
				>
					<AuthView path={pathname} />
				</DialogContent>
			</Dialog>
		</main>
	);
}
