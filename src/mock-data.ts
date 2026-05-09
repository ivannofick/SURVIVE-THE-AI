import { Player, Narration, Choice } from './types';

export const MOCK_PLAYERS: Player[] = [
  {
    id: '1',
    username: 'Ghost_Walker',
    hp: 85,
    hunger: 40,
    sanity: 75,
    trust: 90,
    isAlive: true,
    isReady: true,
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ghost',
  },
  {
    id: '2',
    username: 'Neon_Reckoner',
    hp: 45,
    hunger: 20,
    sanity: 30,
    trust: 50,
    isAlive: true,
    isReady: false,
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Neon',
  },
  {
    id: '3',
    username: 'Void_Seeker',
    hp: 100,
    hunger: 90,
    sanity: 95,
    trust: 10,
    isAlive: true,
    isReady: true,
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Void',
  }
];

export const MOCK_NARRATIONS: Narration[] = [
  {
    id: '1',
    text: 'Pintu baja berat dari bunker berdesis saat menutup rapat. Kamu terjebak di dalam bunker bawah tanah. Kadar oksigen saat ini stabil.',
    timestamp: '12:00 PM',
    type: 'ai',
  },
  {
    id: '2',
    text: 'Inisialisasi Sistem... Narator AI "XENON" sekarang aktif.',
    timestamp: '12:01 PM',
    type: 'system',
  },
  {
    id: '3',
    text: 'Suara garukan samar bergema melalui pipa ventilasi. Ada sesuatu yang tidak sendirian bersamamu.',
    timestamp: '12:05 PM',
    type: 'event',
  }
];

export const MOCK_CHOICES: Choice[] = [
  {
    id: 'c1',
    text: 'Selidiki suara garukan tersebut.',
    risk: 'high',
  },
  {
    id: 'c2',
    text: 'Barikade lubang ventilasi.',
    risk: 'medium',
  },
  {
    id: 'c3',
    text: 'Periksa inventaris darurat.',
    risk: 'low',
  }
];
