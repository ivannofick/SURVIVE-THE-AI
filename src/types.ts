export interface Player {
  id: string;
  username: string;
  hp: number;
  hunger: number;
  sanity: number;
  trust: number;
  isAlive: boolean;
  isReady: boolean;
  avatar: string;
}

export interface Narration {
  id: string;
  text: string;
  timestamp: string;
  type: 'system' | 'ai' | 'event';
}

export interface Choice {
  id: string;
  text: string;
  risk: 'low' | 'medium' | 'high';
}

export type GameTheme = 'bunker' | 'zombie' | 'virus_mlw';

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  status: 'lobby' | 'playing' | 'ended';
  theme: GameTheme;
}

export type Action = {
  playerId: string;
  actionText: string;
  timestamp: string;
};
