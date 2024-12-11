'use client';

import { PropsWithChildren, useActionState } from "react";
import { createRouteAction } from "./create-route.action";
import { ActionResponse } from "@/models/action-response";

export function NewRouteForm({ children }: PropsWithChildren) {
    const [state, formAction, isPending] = useActionState<
        ActionResponse | null,
        FormData
    >(createRouteAction, null)

    return (
        <form action={formAction}>
            {isPending ? (
                <div className="p-4 border rounded text-contrast bg-success">
                    Carregando
                </div>
            ) :
                state?.error ? (
                    <div className="p-4 border rounded text-contrast bg-error">
                        {state.error}
                    </div>
                ) :
                    state?.success ? (
                        <div className="p-4 border rounded text-contrast bg-success">
                            Rota criada com sucesso!
                        </div>
                    )
                        : undefined}

            {children}
        </form>
    )
}