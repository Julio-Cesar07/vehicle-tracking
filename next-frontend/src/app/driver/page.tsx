import { api } from "@/utils/fetch";
import { MapDriver } from "./MapDriver";
import { RoutesModel } from "@/models/routes-model";
import { StartRouteForm } from "./StartRouteForm";

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

export default async function DriverPage() {
    const routes = await getRoutes();

    return (
        <div className="flex flex-1 w-full h-screen">
            <div className="w-1/3 p-2 h-full">
                <h4 className="text-3xl text-contrast mb-2">Inicie uma rota</h4>
                <div className="flex flex-col">
                    <StartRouteForm>
                        <select id="route_id" name="route_id" className="mb-2 p-2 border rounded bg-default text-contrast">
                            <option key={"0"} value={""}>
                                Selecione uma rota
                            </option>
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
                    </StartRouteForm>
                </div>
            </div>
            <MapDriver routeIdElement={"route_id"} />
        </div>
    );
}