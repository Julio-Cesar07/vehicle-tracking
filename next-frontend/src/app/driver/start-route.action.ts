"use server";

import { ActionResponse } from "@/models/action-response";
import { api } from "@/utils/fetch";

export async function startRouteAction(state: ActionResponse | null, formData: FormData) {
    try {
        const { route_id } = Object.fromEntries(formData);

        console.log(route_id)
        if (!route_id) {
            return { error: "Route ID is required", success: false };
        }
        await api<object>(`/routes/${route_id}/start`, "POST")

        return { success: true };
    } catch (error) {
        console.log(error)
        return {
            error: JSON.stringify(error),
            success: false
        }
    }
}