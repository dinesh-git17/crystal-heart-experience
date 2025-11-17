// src/types/stateMachine.ts
// Type definitions for the application state machine that controls experience flow

export enum AppState {
  INTRO = 'INTRO',
  CRACKING = 'CRACKING',
  HEART_REVEAL = 'HEART_REVEAL',
  HEART_IDLE = 'HEART_IDLE',
  LETTER_TRANSITION = 'LETTER_TRANSITION',
  LETTER_TYPING = 'LETTER_TYPING',
  LETTER_DONE = 'LETTER_DONE',
}

export type CrackLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export enum EventType {
  TAP = 'TAP',
  CRACK_COMPLETE = 'CRACK_COMPLETE',
  REVEAL_COMPLETE = 'REVEAL_COMPLETE',
  TRANSITION_COMPLETE = 'TRANSITION_COMPLETE',
  TYPING_COMPLETE = 'TYPING_COMPLETE',
  RESET = 'RESET',
}

export interface StateTransition {
  from: AppState;
  to: AppState;
  event: EventType;
}

export interface StateMachineContext {
  currentState: AppState;
  crackLevel: CrackLevel;
  canTransition: boolean;
  lastTransitionTime: number;
}

export type StateTransitionMap = {
  [K in AppState]: Partial<Record<EventType, AppState>>;
};

export const VALID_TRANSITIONS: StateTransitionMap = {
  [AppState.INTRO]: {
    [EventType.TAP]: AppState.CRACKING,
  },
  [AppState.CRACKING]: {
    [EventType.TAP]: AppState.CRACKING,
    [EventType.CRACK_COMPLETE]: AppState.HEART_REVEAL,
  },
  [AppState.HEART_REVEAL]: {
    [EventType.REVEAL_COMPLETE]: AppState.HEART_IDLE,
  },
  [AppState.HEART_IDLE]: {
    [EventType.TAP]: AppState.LETTER_TRANSITION,
  },
  [AppState.LETTER_TRANSITION]: {
    [EventType.TRANSITION_COMPLETE]: AppState.LETTER_TYPING,
  },
  [AppState.LETTER_TYPING]: {
    [EventType.TYPING_COMPLETE]: AppState.LETTER_DONE,
  },
  [AppState.LETTER_DONE]: {
    [EventType.RESET]: AppState.INTRO,
  },
};

export const CRACK_THRESHOLD = 7;
export const MIN_TAP_INTERVAL = 200;
