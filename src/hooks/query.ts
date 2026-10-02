import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useDatabase } from "./database";
export function useQuery<T>(
  load: () => Promise<T>,
  dependencies: unknown[] = [],
) {
  const { revision } = useDatabase();
  const loader = useRef(load);
  useEffect(() => {
    loader.current = load;
  });
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const sequence = useRef(0);
  const signature = JSON.stringify(dependencies);
  const reload = useCallback(() => {
    const run = ++sequence.current;
    setLoading(true);
    setError(undefined);
    loader
      .current()
      .then((result) => {
        if (run === sequence.current) setData(result);
      })
      .catch((e: unknown) => {
        if (run === sequence.current)
          setError(
            e instanceof Error ? e.message : "Could not load local content.",
          );
      })
      .finally(() => {
        if (run === sequence.current) setLoading(false);
      });
  }, [signature, revision]); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {
        sequence.current++;
      };
    }, [reload]),
  );
  useEffect(
    () => () => {
      sequence.current++;
    },
    [],
  );
  return { data, error, loading, reload };
}
