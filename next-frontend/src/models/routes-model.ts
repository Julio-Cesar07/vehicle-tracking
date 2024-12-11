import { DirectionsData } from "./directions-data";

export type RouteModel = {
    id: string;
    name: string;
    distance: number;
    duration: number;
    directions: DirectionsData;
    created_at: Date;
    updated_at: Date;
    source: {
        name: string;
    } & {
        location: {
            lat: number;
            lng: number;
        };
    };
    destination: {
        name: string;
    } & {
        location: {
            lat: number;
            lng: number;
        };
    };
}

export type RoutesModel = RouteModel[]