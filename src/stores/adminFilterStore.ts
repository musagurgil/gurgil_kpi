import { useSyncExternalStore, useCallback } from 'react';

export interface AdminFiltersState {
    startDate: string;
    endDate: string;
    department?: string;
    userId?: string;
}

const getDefaultFilters = (): AdminFiltersState => ({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
});

// Module-level shared state
let filters: AdminFiltersState = getDefaultFilters();
const listeners = new Set<() => void>();

function emitChange() {
    listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    return filters;
}

function setFiltersInternal(updater: AdminFiltersState | ((prev: AdminFiltersState) => AdminFiltersState)) {
    filters = typeof updater === 'function' ? updater(filters) : updater;
    emitChange();
}

export function useAdminFilters() {
    const currentFilters = useSyncExternalStore(subscribe, getSnapshot);

    const setFilters = useCallback((updater: AdminFiltersState | ((prev: AdminFiltersState) => AdminFiltersState)) => {
        setFiltersInternal(updater);
    }, []);

    return { filters: currentFilters, setFilters };
}
