import { Archetype } from '@/types';

export const ARCHETYPES: Archetype[] = [
    {
        id: 'yujiro',
        name: 'Yujiro Hanma',
        epithet: 'The Ogre',
        description: 'Absolute dominance. You do not train to participate. You train to rule. Weakness is strictly prohibited.',
        doctrine: 'Strength is the only Truth.',
        color: '#8B0000', // Deep Red
        image: null,
        quote: 'Coin flip? If it lands on heads, I win. If it lands on tails, you lose.',
        requirements: ['Daily Max Effort', 'Zero Complaints', 'Reject Norms'],
    },
    {
        id: 'baki',
        name: 'Baki Hanma',
        epithet: 'The Champion',
        description: 'Infinite evolution. The goal is not to be the best, but to be better than you were yesterday. Imagination creates reality.',
        doctrine: 'Growth over Victory.',
        color: '#FF4500', // Orange Red
        image: null,
        quote: 'I don\'t need to be the strongest in the world. I just want to be slightly stronger than my father.',
        requirements: ['High Volume Training', 'Visualisation', 'Adaptability'],
    },
    {
        id: 'ohma',
        name: 'Ohma Tokita',
        epithet: 'The Ashura',
        description: 'Martial precision. Control the flow of power. Balance the fire inside with the water outside.',
        doctrine: 'Violence sublimated into Art.',
        color: '#2F4F4F', // Slate
        image: null,
        quote: 'You want to fight? Then bring it on.',
        requirements: ['Technical Mastery', 'Flow State', 'Deep Recovery'],
    },
    {
        id: 'jack',
        name: 'Jack Hanma',
        epithet: 'The Cyborg',
        description: 'Victory at any cost. Sacrifice your tomorrow for strength today. Pain is just a chemical reaction.',
        doctrine: 'I would give up my tomorrow.',
        color: '#4B0082', // Indigo
        image: null,
        quote: 'I never planned to live long. I traded my life for strength.',
        requirements: ['Extreme Agony', 'Chemical Assistance', 'Self Destruction'],
    },
];
