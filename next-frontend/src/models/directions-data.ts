import { DirectionsResponseData, TravelMode } from "@googlemaps/google-maps-services-js"

export type DirectionsData = DirectionsResponseData & {
    request: {
        origin: {
            place_id: string,
            location: {
              lat: number,
              lng: number,
            },
          },
          destination: {
            place_id: string,
            location: {
              lat: number,
              lng: number,
            },
          },
          mode: TravelMode.driving,
    }
}

export interface SearchDirectionsData {
    directionData: DirectionsData | null,
    placeSourceId: string,
    placeDestinationId: string
}