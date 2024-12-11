'use client';

import { useMap } from "@/hooks/useMap";
import { useRef } from "react";

export default function AdminPage() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    useMap(mapContainerRef);

    return <div className="w-full h-screen" ref={mapContainerRef} />;
}