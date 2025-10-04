"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FetchState } from "./types";

type QueryKey = string;

type QueryController<TData> = {
  key: QueryKey;
  state: FetchState<TData>;
  subscribers: Set<() => void>;
  fetcher: () => Promise<TData>;
  inflight: Promise<void> | null;
};

type QueryResult<TData> = FetchState<TData> & {
  refetch: () => Promise<void>;
};

const controllers = new Map<QueryKey, QueryController<unknown>>();

function ensureController<TData>(key: QueryKey, fetcher: () => Promise<TData>) {
  if (!controllers.has(key)) {
    controllers.set(key, {
      key,
      fetcher,
      inflight: null,
      subscribers: new Set(),
      state: { data: null, isLoading: false, error: null },
    });
  }
  return controllers.get(key)! as QueryController<TData>;
}

function notify<TData>(controller: QueryController<TData>) {
  controller.subscribers.forEach((callback) => callback());
}

async function run<TData>(controller: QueryController<TData>) {
  if (controller.inflight) return controller.inflight;
  controller.state = { ...controller.state, isLoading: true, error: null };
  notify(controller);
  controller.inflight = controller
    .fetcher()
    .then((data) => {
      controller.state = { data, isLoading: false, error: null };
    })
    .catch((error) => {
      controller.state = {
        data: controller.state.data,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    })
    .finally(() => {
      controller.inflight = null;
      notify(controller);
    });

  return controller.inflight;
}

export function useQuery<TData>(key: QueryKey, fetcher: () => Promise<TData>): QueryResult<TData> {
  const [, rerender] = useState(0);
  const controllerRef = useRef<QueryController<TData>>();

  if (!controllerRef.current) {
    controllerRef.current = ensureController(key, fetcher);
  }
  const controller = controllerRef.current;

  useEffect(() => {
    const update = () => rerender((value) => value + 1);
    controller.subscribers.add(update);
    if (!controller.state.data && !controller.state.isLoading) {
      run(controller).catch(() => null);
    }
    return () => {
      controller.subscribers.delete(update);
    };
  }, [controller]);

  const refetch = useCallback(async () => {
    await run(controller);
  }, [controller]);

  return { ...controller.state, refetch };
}

export function hydrateQuery<TData>(key: QueryKey, data: TData) {
  const controller = ensureController<TData>(key, async () => data);
  controller.state = { data, isLoading: false, error: null };
  notify(controller);
}

export function clearQuery(key: QueryKey) {
  const controller = controllers.get(key);
  if (!controller) return;
  controller.state = { data: null, isLoading: false, error: null };
  controller.inflight = null;
  notify(controller as QueryController<never>);
}

export function updateQueryData<TData>(
  key: QueryKey,
  updater: (current: TData | null) => TData | null,
) {
  const controller = ensureController<TData>(key, async () => {
    throw new Error("Query has not been initialised");
  });
  controller.state = {
    data: updater(controller.state.data),
    isLoading: controller.state.isLoading,
    error: controller.state.error,
  };
  notify(controller);
}