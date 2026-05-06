import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { UserCardWithCatalog } from '@/types';

export function useCollection() {
  const { user } = useAuth();
  const [items, setItems] = useState<UserCardWithCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await supabase
      .from('user_cards')
      .select('*, cards(*)')
      .eq('user_id', user.id);

    if (qErr) {
      setError(qErr.message);
      setItems([]);
    } else {
      setItems((data ?? []) as UserCardWithCatalog[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
