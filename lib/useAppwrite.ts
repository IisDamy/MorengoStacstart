import { useCallback, useEffect, useRef, useState } from "react";

interface UseAppwriteOptions<T, P extends Record<string, string | number>> {
    fn: (params: P, doc?: string) => Promise<T>;
    params?: P;
    doc?: string;
    skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams?: P) => Promise<void>;
    // Pass a predicate to filter; pass null to reset to the full fetched list.
    handleDataFilter: (predicate: ((item: T extends Array<infer U> ? U : never) => boolean) | null) => void;
}

export const useAppwrite = <T, P extends Record<string, string | number>>({
    fn,
    params = {} as P,
    skip = false,
    doc,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);

    // The authoritative unfiltered result — always up to date after every fetch.
    const originalData = useRef<T | null>(null);

    const fetchData = useCallback(
        async (fetchParams: P) => {
            setLoading(true);
            setError(null);
            try {
                const result = await fn({ ...fetchParams }, doc);
                // Always update the source of truth first.
                originalData.current = result;
                setData(result);
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "An unknown error occurred";
                setError(errorMessage);
                console.error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [fn]
    );

    useEffect(() => {
        if (!skip) {
            fetchData(params);
        }
    }, []);

    const refetch = async (newParams?: P) => await fetchData(newParams!);

    // Filter always runs against originalData.current (never against already-filtered state).
    // Pass null to restore the full list without re-fetching.
    const handleDataFilter = (
        predicate: ((item: any) => boolean) | null
    ) => {
        if (!originalData.current) return;
        if (predicate === null) {
            setData(originalData.current);
        } else {
            setData((originalData.current as any[]).filter(predicate) as unknown as T);
        }
    };

    return { data, loading, error, refetch, handleDataFilter };
};

export default useAppwrite;