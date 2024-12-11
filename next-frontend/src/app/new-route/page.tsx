import { api } from "@/utils/fetch"
import { NewRouteForm } from "./NewRouteForm"
import { PlaceData } from "@/interfaces/place-data";
import { MapNewRoute } from "./MapNewRoute";
import { DirectionsData, SearchDirectionsData } from "@/interfaces/directions-data";

export async function searchDirections(source: string, destination: string): Promise<SearchDirectionsData> {
    try {
        const [sourceResponse, destinationResponse] = await Promise.all([
            api<PlaceData>(`/places?text=${source}`,
                // "GET", undefined, true
            ),
            api<PlaceData>(`/places?text=${destination}`,
                // "GET", undefined, true
            )
        ])

        const placeSourceId = sourceResponse.candidates[0].place_id;
        const placeDestinationId = destinationResponse.candidates[0].place_id;

        const directionData = await api<DirectionsData>(`/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`, 
            // "GET", undefined, true
        )

        return {
            directionData,
            placeSourceId,
            placeDestinationId
        }
    } catch (error) {
        console.error(error)
        throw new Error("failed to fetch directions data")
    }
}

export default async function NewRoutePage({ searchParams }: {
    searchParams: Promise<{ source: string; destination: string }>
}) {
    const { destination, source } = await searchParams

    const { directionData, placeDestinationId, placeSourceId }: SearchDirectionsData = source && destination ? await searchDirections(source, destination) : {
        directionData: null,
        placeDestinationId: "",
        placeSourceId: ""
    }

    return (
        <div className="flex flex-1 w-full h-full">
            <div className="w-1/3 p-4 h-full">
                <h4 className="text-3xl text-contrast mb-2">Nova rota</h4>
                <form className="flex flex-col space-y-4" method="get">
                    <div className="relative">
                        <input
                            id="source"
                            name="source"
                            type="search"
                            placeholder=""
                            defaultValue={source}
                            className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-contrast bg-default border-0 border-b-2 border-contrast appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                        />
                        <label
                            htmlFor="source"
                            className="absolute text-contrast duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] start-2.5 peer-focus:text-secondary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                        >
                            Origem
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            id="destination"
                            name="destination"
                            type="search"
                            placeholder=""
                            defaultValue={destination}
                            className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-contrast bg-default border-0 border-b-2 border-contrast appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                        />
                        <label
                            htmlFor="destination"
                            className="absolute text-contrast duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] start-2.5 peer-focus:text-secondary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                        >
                            Destino
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="bg-main text-primary p-2 rounded text-xl font-bold"
                    >
                        Pesquisar
                    </button>
                </form>

                {directionData && (
                    <div className="mt-4 p-4 border rounded text-contrast">
                        <ul>
                            <li className="mb-2">
                                <strong>Origem:</strong>{" "}
                                {directionData.routes[0].legs[0].start_address}
                            </li>
                            <li className="mb-2">
                                <strong>Destino:</strong>{" "}
                                {directionData.routes[0].legs[0].end_address}
                            </li>
                            <li className="mb-2">
                                <strong>Distância:</strong>{" "}
                                {directionData.routes[0].legs[0].distance.text}
                            </li>
                            <li className="mb-2">
                                <strong>Duração:</strong>{" "}
                                {directionData.routes[0].legs[0].duration.text}
                            </li>
                        </ul>
                        <NewRouteForm>
                            {placeSourceId && (
                                <input type="hidden" name="sourceId" defaultValue={placeSourceId} />
                            )}
                            {placeDestinationId && (
                                <input type="hidden" name="destinationId" defaultValue={placeDestinationId} />
                            )}
                            <button type="submit" className="bg-main text-primary font-bold p-2 rounded mt-4">
                                Adicionar rota
                            </button>
                        </NewRouteForm>
                    </div>
                )}
            </div>
            {directionData && <MapNewRoute directionsData={directionData} />}
        </div>
    );
}