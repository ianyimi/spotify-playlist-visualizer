import { type PropsWithChildren } from "react";

import ConvexClientProvider from "./convex";

export default function ServerProviders({ children }: PropsWithChildren) {
	return (
		<ConvexClientProvider>
			{children}
		</ConvexClientProvider>
	)
}
