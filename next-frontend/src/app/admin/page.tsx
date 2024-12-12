'use client';

import { useMap } from "@/hooks/useMap";
import { RouteModel } from "@/models/routes-model";
import { ServerNewPointsList } from "@/models/server-new-points-list";
import { api } from "@/utils/fetch";
import { socket } from "@/utils/socket-io";
import { useEffect, useRef } from "react";

export default function AdminPage() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    useEffect(() => {
        if (!map) return

        if(socket.disconnected) socket.connect()
            else socket.offAny()

        socket.on('server:new-points:list', async ({ lat, lng, route_id }: ServerNewPointsList) => {
            try {
                if (!map.hasRoute(route_id)) {
                    const route = await api<RouteModel>(`http://localhost:3000/api/routes/${route_id}`)
                    const { start_location, end_location } = route.directions.routes[0].legs[0]
                    map.addRouteWithIcons({
                        routeId: route_id,
                        startMarkerOptions: {
                            position: start_location
                        },
                        endMarkerOptions: {
                            position: end_location
                        },
                        carMarkerOptions: {
                            position: start_location
                        }
                    })
                }
                map.moveCar(route_id, { lat, lng })
            } catch {
            }
        })

        return () => {
            socket.disconnect()
        }
    }, [map])

    return <div className="w-full h-screen" ref={mapContainerRef} />;
}