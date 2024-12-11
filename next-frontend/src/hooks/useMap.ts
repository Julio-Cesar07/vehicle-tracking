import { useEffect, useState } from "react";
import { Loader } from '@googlemaps/js-api-loader'
import { Map } from "@/utils/map";
import { getCurrentPosition } from "./geolocation";

export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
    const [map, setMap] = useState<Map>()

    useEffect(() => {
        (async () => {
            const loader = new Loader({
                apiKey: "",
                libraries: ["routes", "geometry", "marker"]
            })

            const [, , , position] = await Promise.all([
                loader.importLibrary("routes"),
                loader.importLibrary("geometry"),
                loader.importLibrary("marker"),
                getCurrentPosition({ enableHighAccuracy: true })
            ])

            const newMap = new Map(containerRef.current!, {
                mapId: "8e0a97af9386fef",
                zoom: 15,
                center: position
            })

            setMap(newMap)
        })();
    }, [containerRef])

    return map
}