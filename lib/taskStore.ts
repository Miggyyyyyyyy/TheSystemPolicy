import { create } from 'zustand';

export interface Task {
    id: string;
    time: string;
    title: string;
    intent: 'Vitality' | 'Discipline' | 'Intellect' | 'Spirit';
    xp: number;
    duration: number; // in seconds
    instructions: string[];
    completed: boolean;
    failed: boolean;
}

interface TaskState {
    tasks: Task[];
    penaltyActive: boolean;
    penaltyTask: Task | null;

    // Actions
    setTasks: (tasks: Task[]) => void;
    completeTask: (taskId: string) => void;
    failTask: (taskId: string) => void;
    clearPenalty: () => void;
}

const DEFAULT_TASKS: Task[] = [
    {
        id: '1',
        time: '06:00',
        title: 'Morning Ritual',
        intent: 'Spirit',
        xp: 20,
        duration: 10 * 60,
        instructions: ['Cold Shower', 'Journal 3 Goals', 'Set Intention'],
        completed: false,
        failed: false,
    },
    {
        id: '2',
        time: '07:00',
        title: 'Strength Training',
        intent: 'Vitality',
        xp: 50,
        duration: 45 * 60,
        instructions: ['Dynamic Warm Up', 'Main Compound Lifts', 'Accessory Work'],
        completed: false,
        failed: false,
    },
    {
        id: '3',
        time: '12:00',
        title: 'Deep Work Block',
        intent: 'Intellect',
        xp: 40,
        duration: 90 * 60,
        instructions: ['Eliminate Distractions', 'Single Task Focus', 'No Phone'],
        completed: false,
        failed: false,
    },
    {
        id: '4',
        time: '18:00',
        title: 'Conditioning',
        intent: 'Vitality',
        xp: 30,
        duration: 30 * 60,
        instructions: ['Zone 2 Cardio', 'Breathwork', 'Cooldown Stretch'],
        completed: false,
        failed: false,
    },
    {
        id: '5',
        time: '22:00',
        title: 'Night Ritual',
        intent: 'Spirit',
        xp: 20,
        duration: 15 * 60,
        instructions: ['Reflect on Day', 'Plan Tomorrow', 'Screen Off'],
        completed: false,
        failed: false,
    },
];

const PENALTY_TASK: Task = {
    id: 'penalty-1',
    time: 'NOW',
    title: 'Penalty Quest',
    intent: 'Discipline',
    xp: 10,
    duration: 5 * 60,
    instructions: ['50 Burpees', 'OR 5 min Wall Sit', 'No Excuses'],
    completed: false,
    failed: false,
};

export const useTaskStore = create<TaskState>()((set, get) => ({
    tasks: DEFAULT_TASKS,
    penaltyActive: false,
    penaltyTask: null,

    setTasks: (tasks: Task[]) => set({ tasks }),

    completeTask: (taskId: string) => {
        const { tasks } = get();
        set({
            tasks: tasks.map((t) =>
                t.id === taskId ? { ...t, completed: true } : t
            ),
        });
    },

    failTask: (taskId: string) => {
        const { tasks } = get();
        set({
            tasks: tasks.map((t) =>
                t.id === taskId ? { ...t, failed: true } : t
            ),
            penaltyActive: true,
            penaltyTask: PENALTY_TASK,
        });
    },

    clearPenalty: () => {
        set({ penaltyActive: false, penaltyTask: null });
    },
}));
