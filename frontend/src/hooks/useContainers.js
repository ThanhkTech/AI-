import { useState, useEffect, useCallback } from 'react';

const API = '/api/containers';

export function useContainers(filters = {}) {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== undefined && filters.status !== '') params.set('status', filters.status);
      if (filters.location) params.set('location', filters.location);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`${API}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setContainers(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.location, filters.search]);

  useEffect(() => { fetchContainers(); }, [fetchContainers]);

  return { containers, loading, error, refetch: fetchContainers };
}

export function useKpi() {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKpi = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/stats/kpi`);
      setKpi(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKpi(); }, [fetchKpi]);

  return { kpi, loading, refetch: fetchKpi };
}

export async function createContainer(data) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create');
  }
  return res.json();
}

export async function updateContainer(id, data) {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update');
  }
  return res.json();
}

export async function deleteContainer(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

export async function getContainer(id) {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}
