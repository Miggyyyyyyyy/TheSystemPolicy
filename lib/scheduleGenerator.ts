import { Task } from './taskStore';
import { CalibrationData } from './settingsStore';
import { ArchetypeId } from '@/types';

// Task templates based on archetype and training access
interface TaskTemplate {
    title: string;
    intent: 'Vitality' | 'Discipline' | 'Intellect' | 'Spirit';
    duration: number; // minutes
    xp: number;
    instructions: string[];
    requires?: ('gym' | 'home' | 'dojo')[];
}

const ARCHETYPE_TASKS: Record<ArchetypeId, TaskTemplate[]> = {
    yujiro: [
        {
            title: 'Primal Strength',
            intent: 'Vitality',
            duration: 60,
            xp: 60,
            instructions: ['Heavy Compounds', 'Max Effort Sets', 'No Rest'],
            requires: ['gym'],
        },
        {
            title: 'Dominance Training',
            intent: 'Vitality',
            duration: 45,
            xp: 50,
            instructions: ['Explosive Movements', 'Plyometrics', 'Power'],
        },
        {
            title: 'Mental Conquest',
            intent: 'Intellect',
            duration: 60,
            xp: 40,
            instructions: ['Strategic Reading', 'Problem Solving', 'No Weakness'],
        },
        {
            title: 'Cold Exposure',
            intent: 'Spirit',
            duration: 15,
            xp: 30,
            instructions: ['Cold Shower', 'Breath Control', 'Endure'],
        },
    ],
    baki: [
        {
            title: 'Shadow Boxing',
            intent: 'Vitality',
            duration: 30,
            xp: 35,
            instructions: ['Visualize Opponent', 'Full Speed', 'Imagination'],
        },
        {
            title: 'Technical Drilling',
            intent: 'Vitality',
            duration: 45,
            xp: 45,
            instructions: ['Perfect Form', 'Slow to Fast', 'Mind-Muscle'],
            requires: ['dojo', 'home'],
        },
        {
            title: 'Strength Circuit',
            intent: 'Vitality',
            duration: 40,
            xp: 40,
            instructions: ['Compound Lifts', 'Supersets', 'Volume'],
            requires: ['gym'],
        },
        {
            title: 'Recovery Protocol',
            intent: 'Spirit',
            duration: 30,
            xp: 25,
            instructions: ['Stretch', 'Foam Roll', 'Breathwork'],
        },
        {
            title: 'Skill Development',
            intent: 'Intellect',
            duration: 45,
            xp: 35,
            instructions: ['Watch Technique Videos', 'Take Notes', 'Plan Training'],
        },
    ],
    ohma: [
        {
            title: 'Niko Style Kata',
            intent: 'Vitality',
            duration: 45,
            xp: 45,
            instructions: ['Flowing Movements', 'Breath Control', 'Precision'],
            requires: ['dojo', 'home'],
        },
        {
            title: 'Conditioning Flow',
            intent: 'Vitality',
            duration: 30,
            xp: 30,
            instructions: ['Zone 2 Cardio', 'Steady State', 'Meditation in Motion'],
        },
        {
            title: 'Deep Recovery',
            intent: 'Spirit',
            duration: 45,
            xp: 40,
            instructions: ['Ice Bath', 'Meditation', 'Sleep Preparation'],
        },
        {
            title: 'Technical Study',
            intent: 'Intellect',
            duration: 60,
            xp: 40,
            instructions: ['Analyze Fights', 'Note Patterns', 'Deep Learning'],
        },
        {
            title: 'Strength Foundation',
            intent: 'Vitality',
            duration: 40,
            xp: 35,
            instructions: ['Functional Movements', 'Core Work', 'Balance'],
            requires: ['gym', 'home'],
        },
    ],
    jack: [
        {
            title: 'Brutal Volume',
            intent: 'Vitality',
            duration: 90,
            xp: 80,
            instructions: ['Maximum Sets', 'No Rest', 'Destroy Muscles'],
            requires: ['gym'],
        },
        {
            title: 'Pain Tolerance',
            intent: 'Spirit',
            duration: 30,
            xp: 50,
            instructions: ['Cold Exposure', 'Hold Discomfort', 'Embrace Pain'],
        },
        {
            title: 'Aggressive HIIT',
            intent: 'Vitality',
            duration: 45,
            xp: 55,
            instructions: ['Sprints', 'Burpees', 'Until Failure'],
        },
        {
            title: 'Mental Warfare',
            intent: 'Discipline',
            duration: 60,
            xp: 45,
            instructions: ['Brutal Self-Honesty', 'Identify Weakness', 'Plan Attack'],
        },
    ],
};

// Universal tasks for all archetypes
const UNIVERSAL_TASKS: TaskTemplate[] = [
    {
        title: 'Morning Ritual',
        intent: 'Spirit',
        duration: 15,
        xp: 20,
        instructions: ['Cold Water Face', 'Set Intention', 'Review Goals'],
    },
    {
        title: 'Night Ritual',
        intent: 'Spirit',
        duration: 15,
        xp: 20,
        instructions: ['Reflect on Day', 'Plan Tomorrow', 'Gratitude'],
    },
    {
        title: 'Deep Work',
        intent: 'Intellect',
        duration: 90,
        xp: 50,
        instructions: ['No Distractions', 'Single Focus', 'Timer On'],
    },
];

// Generate schedule based on calibration
export const generateSchedule = (
    archetypeId: ArchetypeId,
    calibration: CalibrationData
): Task[] => {
    const tasks: Task[] = [];
    const archetypeTasks = ARCHETYPE_TASKS[archetypeId];

    // Parse wake and sleep times
    const wakeHour = parseInt(calibration.wakeTime.split(':')[0], 10);
    const sleepHour = parseInt(calibration.sleepTime.split(':')[0], 10);

    // Parse work hours
    const [workStart, workEnd] = calibration.workHours.split('-').map(h => parseInt(h, 10));

    // Morning Ritual
    tasks.push({
        id: `task-${tasks.length + 1}`,
        time: calibration.wakeTime,
        title: 'Morning Ritual',
        intent: 'Spirit',
        xp: 20,
        duration: 15 * 60,
        instructions: ['Cold Water Face', 'Set Intention', 'Review Goals'],
        completed: false,
        failed: false,
    });

    // Morning Training (if time allows before work)
    if (wakeHour + 1 < workStart) {
        const morningTraining = archetypeTasks.find((t) => {
            if (!t.requires) return true;
            return t.requires.some((r) => calibration.trainingAccess.includes(r));
        });

        if (morningTraining) {
            tasks.push({
                id: `task-${tasks.length + 1}`,
                time: `${String(wakeHour + 1).padStart(2, '0')}:00`,
                title: morningTraining.title,
                intent: morningTraining.intent,
                xp: morningTraining.xp,
                duration: morningTraining.duration * 60,
                instructions: morningTraining.instructions,
                completed: false,
                failed: false,
            });
        }
    }

    // Deep Work (during work hours)
    const deepWorkHour = workStart + 2;
    if (deepWorkHour < workEnd) {
        tasks.push({
            id: `task-${tasks.length + 1}`,
            time: `${String(deepWorkHour).padStart(2, '0')}:00`,
            title: 'Deep Work Block',
            intent: 'Intellect',
            xp: 50,
            duration: 90 * 60,
            instructions: ['No Distractions', 'Single Focus', 'Timer On'],
            completed: false,
            failed: false,
        });
    }

    // Evening Training
    const eveningHour = workEnd + 1;
    if (eveningHour < sleepHour - 2) {
        const eveningTraining = archetypeTasks.find((t, i) => {
            if (i === 0) return false; // Skip first one (used for morning)
            if (!t.requires) return true;
            return t.requires.some((r) => calibration.trainingAccess.includes(r));
        }) || archetypeTasks[1];

        if (eveningTraining) {
            tasks.push({
                id: `task-${tasks.length + 1}`,
                time: `${String(eveningHour).padStart(2, '0')}:00`,
                title: eveningTraining.title,
                intent: eveningTraining.intent,
                xp: eveningTraining.xp,
                duration: eveningTraining.duration * 60,
                instructions: eveningTraining.instructions,
                completed: false,
                failed: false,
            });
        }
    }

    // Night Ritual
    const nightRitualHour = sleepHour - 1;
    tasks.push({
        id: `task-${tasks.length + 1}`,
        time: `${String(nightRitualHour).padStart(2, '0')}:00`,
        title: 'Night Ritual',
        intent: 'Spirit',
        xp: 20,
        duration: 15 * 60,
        instructions: ['Reflect on Day', 'Plan Tomorrow', 'Gratitude'],
        completed: false,
        failed: false,
    });

    // Sort by time
    tasks.sort((a, b) => {
        const timeA = parseInt(a.time.replace(':', ''), 10);
        const timeB = parseInt(b.time.replace(':', ''), 10);
        return timeA - timeB;
    });

    return tasks;
};
