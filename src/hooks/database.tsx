import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
} from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Repository } from "../db/repository";
const Context = createContext<{
  repo: Repository;
  revision: number;
  refresh: () => void;
} | null>(null);
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const repo = useMemo(() => new Repository(db), [db]);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((r) => r + 1), []);
  return (
    <Context.Provider value={{ repo, revision, refresh }}>
      {children}
    </Context.Provider>
  );
}
export function useDatabase() {
  const value = useContext(Context);
  if (!value) throw new Error("Database provider missing");
  return value;
}
