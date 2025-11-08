export const DAL_ERRORS = {
	convex: {
		name: "ConvexError",
		type: "convex",
		message: "Convex Function Error"
	},
	noAccess: {
		name: "NoAccessAllowed",
		type: "no-access",
		message: "User not allowed to perform this action",
	},
	noAccount: {
		name: "AccountNotFound",
		type: "no-account",
		message: "Account Not Found",
	},
	noSession: {
		name: "SessionNotFound",
		type: "no-session",
		message: "Session Not Found",
	},
	notFound: {
		name: "Resource Not Found",
		type: "not-found",
		message: "Resource Not Found",
	},
	noUser: {
		name: "UserNotFound",
		type: "no-user",
		message: "User Not Found",
	},
	spotify: {
		name: "SpotifyApiError",
		type: "spotify",
		message: "Spotify Api Error"
	},
	unknown: {
		name: "UnknownError",
		type: "unknown",
		message: "Unknown Error",
	}
} as const;

export interface DalError extends Error {
	type: DalErrorType["type"];
}

export type DalErrorType = (typeof DAL_ERRORS)[keyof typeof DAL_ERRORS];

export type DalReturn<T, E extends DalError = DalError> =
	| {
		data: T;
		success: true;
	}
	| {
		error: E;
		success: false;
	};

export function dalReturnOrThrow<T, E extends DalError>(dalReturn: DalReturn<T, E>) {
	if (dalReturn.success) { return dalReturn; }

	throw dalReturn.error;
}

// Ergonomic helpers to infer success data type automatically
export const ok = <T>(data: T): DalReturn<T> => ({ data, success: true });
export const err = <T>(
	error: Partial<DalError> = { type: "unknown" },
): Extract<DalReturn<T, DalError>, { success: false }> => {
	for (const dalErr of Object.values(DAL_ERRORS)) {
		if (error.type === dalErr.type) {
			return {
				error: {
					...error,
					name: error.name ?? dalErr.name,
					type: error.type,
					message: error.message ?? dalErr.message
				} satisfies DalError,
				success: false,
			};
		}
	}

	return {
		error: {
			...error,
			name: error.name ?? DAL_ERRORS.unknown.name,
			type: "unknown",
			message: error.message ?? DAL_ERRORS.unknown.message,
		} satisfies DalError,
		success: false,
	};
};
