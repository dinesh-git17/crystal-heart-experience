// src/types/stateMachine.ts
// Type definitions for the application state machine that controls experience flow with Phase 4 enhancements

export enum AppState {
  INTRO = 'INTRO',
  CRACKING = 'CRACKING',
  HEART_REVEAL = 'HEART_REVEAL',
  HEART_IDLE = 'HEART_IDLE',
  LETTER_TRANSITION = 'LETTER_TRANSITION',
  LETTER_TYPING = 'LETTER_TYPING',
  LETTER_DONE = 'LETTER_DONE',
}

export type CrackLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export enum EventType {
  TAP = 'TAP',
  CRACK_COMPLETE = 'CRACK_COMPLETE',
  SHATTER_START = 'SHATTER_START',
  SHATTER_COMPLETE = 'SHATTER_COMPLETE',
  REVEAL_START = 'REVEAL_START',
  REVEAL_COMPLETE = 'REVEAL_COMPLETE',
  TRANSITION_COMPLETE = 'TRANSITION_COMPLETE',
  TYPING_COMPLETE = 'TYPING_COMPLETE',
  RESET = 'RESET',
  HEART_PULSE_START = 'HEART_PULSE_START',
  TAP_HEART = 'TAP_HEART',
  INTERACTION_HINT_SHOWN = 'INTERACTION_HINT_SHOWN',
  LETTER_TRANSITION_START = 'LETTER_TRANSITION_START',
}

export interface StateTransition {
  from: AppState;
  to: AppState;
  event: EventType;
}

export interface StateMachineContext {
  currentState: AppState;
  crackLevel: CrackLevel;
  tapCount: number;
  canTransition: boolean;
  lastTransitionTime: number;
  isShattered: boolean;
  heartRevealed: boolean;
  transitionPhase: string;
  heartPulsing: boolean;
  letterVisible: boolean;
  interactionHintActive: boolean;
  timeSinceHeartRevealed: number;
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
    [EventType.SHATTER_START]: AppState.HEART_REVEAL,
  },
  [AppState.HEART_REVEAL]: {
    [EventType.REVEAL_COMPLETE]: AppState.HEART_IDLE,
    [EventType.TRANSITION_COMPLETE]: AppState.HEART_IDLE,
  },
  [AppState.HEART_IDLE]: {
    [EventType.TAP]: AppState.LETTER_TRANSITION,
    [EventType.TAP_HEART]: AppState.LETTER_TRANSITION,
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

export const CRACK_THRESHOLD = 6;
export const MIN_TAP_INTERVAL = 200;
export const SHATTER_DURATION = 1800;
export const PAUSE_DURATION = 300;
export const HEART_REVEAL_DURATION = 1200;
export const TOTAL_TRANSITION_DURATION = 3300;
export const HEART_PULSE_BPM = 140;
export const INTERACTION_HINT_DELAY = 5000;
