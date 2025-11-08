import { redirect } from "next/navigation";

import { type DalError, type DalReturn, dalReturnOrThrow } from "./dal";

export function noAccessRedirect<T, E extends DalError>({
	dalReturn,
	redirectPath = "/",
}: {
	dalReturn: DalReturn<T, E>;
	redirectPath?: string;
}) {
	if (dalReturn.success) { return dalReturn; }
	if (dalReturn.error.type === "no-access") { return redirect(redirectPath); }
	return dalReturn as DalReturn<T, Exclude<E, { type: "no-access" }>>;
}

export function noUserRedirect<T, E extends DalError>({
	dalReturn,
}: {
	dalReturn: DalReturn<T, E>;
}) {
	if (dalReturn.success) { return dalReturn; }
	if (dalReturn.error.type === "no-user") { return redirect("/auth/sign-in"); }
	return dalReturn as DalReturn<T, Exclude<E, { type: "no-user" }>>;
}

export function verifySuccess<T, E extends DalError>({
	dalReturn,
	redirectPath,
}: {
	dalReturn: DalReturn<T, E>;
	redirectPath?: string;
}) {
	const res = dalReturnOrThrow(
		noAccessRedirect({
			dalReturn: noUserRedirect({
				dalReturn,
			}),
			redirectPath,
		}),
	);
	return res.data;
}
