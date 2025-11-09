import { NuqsAdapter } from "nuqs/adapters/next/app"
import { type PropsWithChildren } from "react";

import ConvexClientProvider from "./convex";

export default function ServerProviders({ children }: PropsWithChildren) {
	return (
		<ConvexClientProvider>
			<NuqsAdapter>
				{children}
			</NuqsAdapter>
		</ConvexClientProvider>
	)
}
