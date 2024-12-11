"use server";

import { ActionResponse } from "@/models/action-response";
import { DirectionsData } from "@/models/directions-data";
import { api } from "@/utils/fetch";
import { revalidateTag } from "next/cache";

export async function createRouteAction(state: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    try {
        const { sourceId, destinationId } = Object.fromEntries(formData)

        const directionData = await api<DirectionsData>(`/directions?originId=${sourceId}&destinationId=${destinationId}`,
            // "GET", undefined, true
        )

        const { start_address, end_address } = directionData.routes[0].legs[0]

        await api("/routes", "POST", {
            name: `${start_address} - ${end_address}`,
            source_id: directionData.request.origin.place_id.replace("place_id:", ""),
            destination_id: directionData.request.destination.place_id.replace("place_id:", "")
        })

        revalidateTag("routes")

        return {
            success: true
        }
    } catch (error) {
        return {
            error: JSON.stringify(error),
            success: false
        }
    }
}