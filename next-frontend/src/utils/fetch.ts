export async function api<T = object>(
    url: string,
    method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH" = "GET",
    body?: Record<string, unknown>,
    cached: boolean = false,
    cacheTag?: string[]
): Promise<T> {
    const isUrldomain = url.startsWith("http") ? true : false 
    const newUrl = isUrldomain ? url :`${process.env.NEST_API_URL}${url}`
    const response = await fetch(newUrl, {
        method: method,
        headers: body ? { 'Content-Type': 'application/json'} : undefined,
        body: body ? JSON.stringify(body) : undefined,
        cache: cached ? "force-cache" : undefined,
        next: cached ? {
            revalidate: 1 * 60 * 60 * 24, // 1 day
            tags: cacheTag
        } : undefined
    })

    if(!response.ok) {
        const errBody = await response.json()
        throw new Error(`Erro ${response.status}\n${errBody}`)
    }

    const responseData = await response.json().catch(() => ({}));
    return responseData;
}