"use client";

import { useEffect, useRef } from "react";
import { useMap } from "../../hooks/useMap";
import { socket } from "@/utils/socket-io";
import { ServerNewPointsList } from "@/models/server-new-points-list";

export type MapDriverProps = {
  route_id?: string | null;
  start_location: {
    lat: number;
    lng: number
  } | null;
  end_location: {
    lat: number;
    lng: number
  } | null;
}

export function MapDriver({ route_id, start_location, end_location }: MapDriverProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {
    if(!map || !route_id || !start_location || !end_location) return

    if(socket.disconnected) socket.connect()
      else socket.offAny()

    socket.on('connect', () => {
      console.log('connected')
      socket.emit(`client:new-points`, { route_id })
    })

    socket.on(`server:new-points/${route_id}:list`, ({ lat, lng, route_id}: ServerNewPointsList) => {
      if(!map.hasRoute(route_id)){
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

    return () => {
      socket.disconnect()
  }
  }, [route_id, start_location, end_location, map])

  return <div className="w-2/3 h-full" ref={mapContainerRef} />;
}
