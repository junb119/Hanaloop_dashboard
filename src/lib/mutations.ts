"use client";

import { useCallback, useState } from "react";
import { createOrUpdatePost, deletePost } from "./api";
import { queryKeys } from "./api-hooks";
import { updateQueryData } from "./queries";
import type { Post } from "./types";

type MutationState = {
  isPending: boolean;
  error: string | null;
};

type UpsertPayload = {
  id?: string;
  title: string;
  resourceUid: string;
  dateTime: string;
  content: string;
  author: string;
  createdAt?: string;
};

export function useUpsertPostMutation() {
  const [state, setState] = useState<MutationState>({ isPending: false, error: null });

  const mutate = useCallback(async (input: UpsertPayload) => {
    setState({ isPending: true, error: null });

    const isUpdate = Boolean(input.id);
    const optimisticId = input.id ?? `temp-${Date.now()}`;
    const optimistic: Post = {
      id: optimisticId,
      title: input.title,
      resourceUid: input.resourceUid,
      dateTime: input.dateTime,
      content: input.content,
      author: input.author,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };

    let snapshot: Post[] | null = null;
    updateQueryData<Post[]>(queryKeys.posts, (current) => {
      snapshot = current ? [...current] : null;
      const next = current ? [...current] : [];
      const index = next.findIndex((item) => item.id === optimisticId);
      if (index >= 0) {
        next[index] = optimistic;
      } else {
        next.unshift(optimistic);
      }
      return next;
    });

    try {
      const saved = await createOrUpdatePost({ ...input });
      updateQueryData<Post[]>(queryKeys.posts, (current) => {
        const next = current ? [...current] : [];
        const index = next.findIndex((item) => item.id === optimisticId);
        if (index >= 0) {
          next[index] = saved;
        } else {
          next.unshift(saved);
        }
        if (!isUpdate) {
          return next.filter((item, position) => position === next.findIndex((candidate) => candidate.id === item.id));
        }
        return next;
      });
      setState({ isPending: false, error: null });
      return saved;
    } catch (error) {
      updateQueryData<Post[]>(queryKeys.posts, () => (snapshot !== null ? snapshot : null));
      const message = error instanceof Error ? error.message : "Failed to save post";
      setState({ isPending: false, error: message });
      throw error;
    }
  }, []);

  return { ...state, mutate };
}

export function useDeletePostMutation() {
  const [state, setState] = useState<MutationState>({ isPending: false, error: null });

  const mutate = useCallback(async (id: string) => {
    setState({ isPending: true, error: null });
    let snapshot: Post[] | null = null;

    updateQueryData<Post[]>(queryKeys.posts, (current) => {
      snapshot = current ? [...current] : null;
      return current ? current.filter((item) => item.id !== id) : [];
    });

    try {
      await deletePost(id);
      setState({ isPending: false, error: null });
    } catch (error) {
      updateQueryData<Post[]>(queryKeys.posts, () => (snapshot !== null ? snapshot : null));
      const message = error instanceof Error ? error.message : "Failed to delete post";
      setState({ isPending: false, error: message });
      throw error;
    }
  }, []);

  return { ...state, mutate };
}