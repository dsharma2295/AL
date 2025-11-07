import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Recording {
  id: string;
  uri: string;
  duration: number;
  date: Date;
  customName?: string;
}

interface RecordingsContextType {
  recordings: Recording[];
  setRecordings: (recordings: Recording[]) => void;
  addRecording: (recording: Recording) => Promise<void>;
  updateRecording: (id: string, updates: Partial<Recording>) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  isLoading: boolean;
}

const RecordingsContext = createContext<RecordingsContextType | undefined>(undefined);

export function RecordingsProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordingsState] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recordings on app start
  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const stored = await AsyncStorage.getItem('recordings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const loadedRecordings = parsed.map((rec: any) => ({
          ...rec,
          date: new Date(rec.date),
        }));
        setRecordingsState(loadedRecordings);
      }
    } catch (err) {
      console.error('Load recordings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = async (updatedRecordings: Recording[]) => {
    try {
      await AsyncStorage.setItem('recordings', JSON.stringify(updatedRecordings));
    } catch (err) {
      console.error('Save recordings error:', err);
    }
  };

  const setRecordings = (newRecordings: Recording[]) => {
    setRecordingsState(newRecordings);
    saveToStorage(newRecordings);
  };

  const addRecording = async (recording: Recording) => {
    const updated = [recording, ...recordings];
    setRecordingsState(updated);
    await saveToStorage(updated);
  };

  const updateRecording = async (id: string, updates: Partial<Recording>) => {
    const updated = recordings.map(rec => 
      rec.id === id ? { ...rec, ...updates } : rec
    );
    setRecordingsState(updated);
    await saveToStorage(updated);
  };

  const deleteRecording = async (id: string) => {
    const updated = recordings.filter(rec => rec.id !== id);
    setRecordingsState(updated);
    await saveToStorage(updated);
  };

  return (
    <RecordingsContext.Provider value={{
      recordings,
      setRecordings,
      addRecording,
      updateRecording,
      deleteRecording,
      isLoading,
    }}>
      {children}
    </RecordingsContext.Provider>
  );
}

export function useRecordings() {
  const context = useContext(RecordingsContext);
  if (!context) {
    throw new Error('useRecordings must be used within RecordingsProvider');
  }
  return context;
}