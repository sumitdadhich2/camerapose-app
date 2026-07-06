import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

const STORAGE_KEY = 'overlayState';

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.1;
const ROTATION_STEP = 15;
const MOVE_STEP = 20;

export interface OverlayPersistedState {
  scale: number;
  rotation: number;
  x: number;
  y: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  lastPoseId: string | null;
}

interface OverlayState extends OverlayPersistedState {
  hydrated: boolean;
  loadState: () => Promise<void>;
  setLastPoseId: (id: string) => void;

  increaseSize: () => void;
  decreaseSize: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  setPosition: (x: number, y: number) => void;
  setScale: (scale: number) => void;
  setRotation: (rotation: number) => void;
  resetPosition: () => void;
  resetRotation: () => void;
  resetSize: () => void;
  toggleLocked: () => void;
  setLocked: (locked: boolean) => void;
  toggleVisible: () => void;
  setVisible: (visible: boolean) => void;
  setOpacity: (opacity: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function persist(state: OverlayPersistedState) {
  StorageService.setItem(STORAGE_KEY, state);
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  scale: 1,
  rotation: 0,
  x: 0,
  y: 0,
  opacity: 1,
  locked: false,
  visible: true,
  lastPoseId: null,
  hydrated: false,

  loadState: async () => {
    const saved = await StorageService.getItem<OverlayPersistedState>(STORAGE_KEY);
    if (saved) {
      set({ ...saved, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  setLastPoseId: (id) => {
    set({ lastPoseId: id });
    persist({ ...persistableSnapshot(get()), lastPoseId: id });
  },

  increaseSize: () => {
    if (get().locked) return;
    const scale = clamp(get().scale + SCALE_STEP, MIN_SCALE, MAX_SCALE);
    set({ scale });
    persist({ ...persistableSnapshot(get()), scale });
  },
  decreaseSize: () => {
    if (get().locked) return;
    const scale = clamp(get().scale - SCALE_STEP, MIN_SCALE, MAX_SCALE);
    set({ scale });
    persist({ ...persistableSnapshot(get()), scale });
  },
  setScale: (scale) => {
    if (get().locked) return;
    const clamped = clamp(scale, MIN_SCALE, MAX_SCALE);
    set({ scale: clamped });
    persist({ ...persistableSnapshot(get()), scale: clamped });
  },

  rotateLeft: () => {
    if (get().locked) return;
    const rotation = get().rotation - ROTATION_STEP;
    set({ rotation });
    persist({ ...persistableSnapshot(get()), rotation });
  },
  rotateRight: () => {
    if (get().locked) return;
    const rotation = get().rotation + ROTATION_STEP;
    set({ rotation });
    persist({ ...persistableSnapshot(get()), rotation });
  },
  setRotation: (rotation) => {
    if (get().locked) return;
    set({ rotation });
    persist({ ...persistableSnapshot(get()), rotation });
  },

  moveUp: () => {
    if (get().locked) return;
    const y = get().y - MOVE_STEP;
    set({ y });
    persist({ ...persistableSnapshot(get()), y });
  },
  moveDown: () => {
    if (get().locked) return;
    const y = get().y + MOVE_STEP;
    set({ y });
    persist({ ...persistableSnapshot(get()), y });
  },
  moveLeft: () => {
    if (get().locked) return;
    const x = get().x - MOVE_STEP;
    set({ x });
    persist({ ...persistableSnapshot(get()), x });
  },
  moveRight: () => {
    if (get().locked) return;
    const x = get().x + MOVE_STEP;
    set({ x });
    persist({ ...persistableSnapshot(get()), x });
  },
  setPosition: (x, y) => {
    if (get().locked) return;
    set({ x, y });
    persist({ ...persistableSnapshot(get()), x, y });
  },

  resetPosition: () => {
    set({ x: 0, y: 0 });
    persist({ ...persistableSnapshot(get()), x: 0, y: 0 });
  },
  resetRotation: () => {
    set({ rotation: 0 });
    persist({ ...persistableSnapshot(get()), rotation: 0 });
  },
  resetSize: () => {
    set({ scale: 1 });
    persist({ ...persistableSnapshot(get()), scale: 1 });
  },

  toggleLocked: () => {
    const locked = !get().locked;
    set({ locked });
    persist({ ...persistableSnapshot(get()), locked });
  },
  setLocked: (locked) => {
    set({ locked });
    persist({ ...persistableSnapshot(get()), locked });
  },

  toggleVisible: () => {
    const visible = !get().visible;
    set({ visible });
    persist({ ...persistableSnapshot(get()), visible });
  },
  setVisible: (visible) => {
    set({ visible });
    persist({ ...persistableSnapshot(get()), visible });
  },

  setOpacity: (opacity) => {
    const clamped = clamp(opacity, 0, 1);
    set({ opacity: clamped });
    persist({ ...persistableSnapshot(get()), opacity: clamped });
  },
}));

function persistableSnapshot(state: OverlayState): OverlayPersistedState {
  return {
    scale: state.scale,
    rotation: state.rotation,
    x: state.x,
    y: state.y,
    opacity: state.opacity,
    locked: state.locked,
    visible: state.visible,
    lastPoseId: state.lastPoseId,
  };
}

export const OVERLAY_LIMITS = { MIN_SCALE, MAX_SCALE, SCALE_STEP, ROTATION_STEP, MOVE_STEP };
