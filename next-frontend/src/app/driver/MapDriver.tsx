"use client";

import { useEffect, useRef } from "react";
import { useMap } from "../../hooks/useMap";
import { socket } from "@/utils/socket-io";
import { ServerNewPointsList } from "@/models/server-new-points-list";
import { RouteModel } from "@/models/routes-model";
import { api } from "@/utils/fetch";
import { Map } from "@/utils/map";

export type MapDriverProps = {
  routeIdElement: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handler(event: any, map: Map) {
  const route_id = event.target?.value
  console.log(route_id)
      if (socket.disconnected) socket.connect()
      else socket.offAny()

      socket.on(`server:new-points/${route_id}:list`, async ({ lat, lng, route_id }: ServerNewPointsList) => {
        if (!map.hasRoute(route_id)) {
          const route = await api<RouteModel>(`${process.env.NEXT_PUBLIC_API_URL}/routes/${route_id}`)
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
      })
}

export function MapDriver({ routeIdElement }: MapDriverProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {
    if (!map || !routeIdElement) return

    const selectElementer = document.querySelector(`#${routeIdElement}`)
    
    selectElementer?.addEventListener("change", (event) => handler(event, map))

    return () => {
      selectElementer?.removeEventListener("change", (event) => handler(event, map))
      socket.disconnect()
    }
  }, [routeIdElement, map])

  return <div className="w-2/3 h-full" ref={mapContainerRef} />;
}
