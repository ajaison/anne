export interface Challenge {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    gameComponent: string; // Refers to the component name
}

export interface GameState {
    challenges: Challenge[];
    isUnlocked: boolean;
}
