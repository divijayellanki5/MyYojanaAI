import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "./schemes";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null, loading };
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useSaveProfile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { error } = await supabase.from("profiles").upsert({ ...values, id: userId! });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", userId] }),
  });
}

export function useSavedSchemes(userId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["saved", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_schemes").select("scheme_id");
      if (error) throw error;
      return data.map((d) => d.scheme_id);
    },
  });
  const toggle = useMutation({
    mutationFn: async (schemeId: string) => {
      if (query.data?.includes(schemeId)) {
        const { error } = await supabase.from("saved_schemes").delete().eq("scheme_id", schemeId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("saved_schemes").insert({ scheme_id: schemeId, user_id: userId! });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved", userId] }),
  });
  return { saved: query.data ?? [], toggle };
}
