import { create } from 'zustand';

export interface Recording {
  id: string;
  fileURL: string;
  duration: string;
  timestamp: string;
  tags: string[];
  name: string;
}

interface RecordingsState {
  recordings: Recording[];
  isLoading: boolean;
  error: string | null;
  setRecordings: (recordings: Recording[]) => void;
  addRecording: (recording: Recording) => void;
  updateRecording: (id: string, data: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRecordingsStore = create<RecordingsState>((set) => ({
  recordings: [],
  isLoading: false,
  error: null,
  setRecordings: (recordings) => set({ recordings }),
  addRecording: (recording) => 
    set((state) => ({ recordings: [...state.recordings, recording] })),
  updateRecording: (id, data) =>
    set((state) => ({
      recordings: state.recordings.map((rec) =>
        rec.id === id ? { ...rec, ...data } : rec
      ),
    })),
  deleteRecording: (id) =>
    set((state) => ({
      recordings: state.recordings.filter((rec) => rec.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
