import { RouteModel } from "@/models/routes-model";
import { api } from "@/utils/fetch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ routeId: string }> }) {
    const { routeId } = await params

    console.log("response")
    const response = await api<RouteModel>(`/routes/${routeId}`,
        "GET", undefined, true, [`routes-${routeId}`, "routes"]
    )
    return NextResponse.json(response)
}