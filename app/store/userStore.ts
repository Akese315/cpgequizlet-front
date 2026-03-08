import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
    id: string;
    token: string;
    email?: string;
    pseudo?: string;
    firstName?: string;
    lastName?: string;
    role?: 'student' | 'teacher' | 'admin' | string; // 'admin' pourrait avoir le droit de créer des quiz
}

interface UserState {
    user: User | null;
    setUser: (user: User) => void;
    updateUser: (updates: Partial<User>) => void;
    clearUser: () => void;
    isAuthenticated: () => boolean;
    canCreateQuiz: () => boolean;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,

            // Remplace l'utilisateur entier (au moment du login par exemple)
            setUser: (user) => set({ user }),

            // Met à jour un ou plusieurs champs spécifiquement (changement de pseudo par ex)
            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),

            // Vide le store (lors d'une déconnexion)
            clearUser: () => set({ user: null }),

            // Helper pour savoir si on est connecté (présence du token)
            isAuthenticated: () => {
                const state = get();
                return !!state.user?.token;
            },

            // Helper conditionnel pour déterminer le droit de créer des quiz
            canCreateQuiz: () => {
                const state = get();
                // Ex: Seul l'admin a le droit de créer un quiz (à adapter selon ta logique cible)
                return state.user?.role === 'admin';
            }
        }),
        {
            name: 'quizlet-user-storage', // Le nom de la clé sous laquelle ça s'enregistre dans le localStorage
            storage: createJSONStorage(() => localStorage), // Par défaut, utilise le localStorage du navigateur
        }
    )
);
