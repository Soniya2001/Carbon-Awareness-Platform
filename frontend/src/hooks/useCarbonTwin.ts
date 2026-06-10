'use client';

import { useState, useCallback } from 'react';
import { simulationApi } from '@/src/lib/api';
import type { SimulationResult, Scenario } from '@/src/types';

export function useCarbonTwin() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScenarios = useCallback(async () => {
    try {
      const res = await simulationApi.getScenarios();
      setScenarios((res.data ?? []) as Scenario[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenarios');
    }
  }, []);

  const runSimulation = useCallback(async (scenario: string, years = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await simulationApi.runSimulation(scenario, years);
      setResult(res.data as SimulationResult);
      return res.data as SimulationResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await simulationApi.getHistory();
      setHistory((res.data ?? []) as unknown[]);
    } catch {}
  }, []);

  const compareAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await simulationApi.compareScenarios();
      return res.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    scenarios,
    result,
    history,
    isLoading,
    error,
    fetchScenarios,
    runSimulation,
    fetchHistory,
    compareAll,
    setResult,
  };
}
