import { create } from 'zustand';

interface ErrorState {
    error: string | null;
    showError: (message: string) => void;
    clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return {
        error: null,
        showError: (message) => {
            // Clear previous timeout if any
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            set({ error: message });

            // Auto clear error after 5 seconds
            timeoutId = setTimeout(() => {
                set({ error: null });
            }, 5000);
        },
        clearError: () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            set({ error: null });
        },
    };
});
