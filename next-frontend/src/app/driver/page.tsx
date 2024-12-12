import { api } from "@/utils/fetch";
import { MapDriver } from "./MapDriver";
import { RouteModel, RoutesModel } from "@/models/routes-model";

export async function getRoutes() {
    try {
        const data = await api<RoutesModel>("/routes",
            "GET", undefined, true, ["routes"]
        );

        return data
    } catch {
        throw new Error("failed to get routes")
    }
}

export async function getRoute(route_id: string): Promise<RouteModel> {
    try {
        const data = await api<RouteModel>(`/routes/${route_id}`,
            "GET", undefined, 
        );

        return data
    } catch {
        throw new Error("failed to get route")
    }
}

export default async function DriverPage({ searchParams }: { searchParams: Promise<{route_id: string}>}) {
    const routes = await getRoutes();
    const { route_id } = await searchParams
    const route: RouteModel | null = route_id ? await getRoute(route_id) : null
    
    const { start_location, end_location } = route ? route.directions.routes[0].legs[0] : {
        start_location: null,
        end_location: null
    }

    return (
        <div className="flex flex-1 w-full h-screen">
            <div className="w-1/3 p-2 h-full">
                <h4 className="text-3xl text-contrast mb-2">Inicie uma rota</h4>
                <div className="flex flex-col">
                    <form className="flex flex-col space-y-4" method="get">
                        <select name="route_id" className="mb-2 p-2 border rounded bg-default text-contrast">
                            {routes.map((route) => (
                                <option key={route.id} value={route.id}>
                                    {route.name}
                                </option>
                            ))}
                        </select>
                        <button
                            className="bg-main text-primary p-2 rounded text-xl font-bold"
                            style={{ width: "100%" }}
                        >
                            Iniciar a viagem
                        </button>
                    </form>
                </div>
            </div>
            {route && <MapDriver route_id={route.id} start_location={start_location} end_location={end_location} />}
        </div>
    );
}