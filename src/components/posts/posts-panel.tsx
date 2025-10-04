"use client";

// 지속가능성 게시물을 리스트·필터·낙관적 CRUD 흐름으로 관리하는 핵심 패널입니다.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DropdownSelect } from "../ui/dropdown";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { usePostsQuery, useCompaniesQuery } from "../../lib/api-hooks";
import { useFiltersStore } from "../../lib/store";
import {
  useDeletePostMutation,
  useUpsertPostMutation,
} from "../../lib/mutations";
import type { Post } from "../../lib/types";
import { cn } from "../../lib/cn";

type DraftState = {
  id?: string;
  title: string;
  resourceUid: string;
  dateTime: string;
  content: string;
  author: string;
  createdAt: string;
};

const EMPTY_POST: DraftState = {
  id: "",
  title: "",
  resourceUid: "",
  dateTime: "",
  content: "",
  author: "",
  createdAt: "",
};

const formatDateOnly = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
};

const formatDateTimeLabel = (value: string) => {
  if (!value) return "저장 시 자동 기록";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

// 게시물 목록과 작성 폼 사이를 전환하기 위한 뷰 모드입니다.
type ViewMode = "list" | "form";

export function PostsPanel() {
  const selectedCompanyIds = useFiltersStore(
    (state) => state.selectedCompanyIds
  );
  const { data: posts, isLoading, error, refetch } = usePostsQuery();
  const { data: companies } = useCompaniesQuery();
  const upsert = useUpsertPostMutation();
  const remove = useDeletePostMutation();

  // 폼 초안과 선택 상태, 신규 작성 여부, 현재 뷰 모드를 관리합니다.
  const [draft, setDraft] = useState<DraftState>(EMPTY_POST);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const companyLookup = useMemo(() => {
    if (!companies) return new Map<string, string>();
    return new Map(companies.map((company) => [company.id, company.name]));
  }, [companies]);

  const companyOptions = useMemo(() => {
    return (companies ?? []).map((company) => ({
      value: company.id,
      label: company.name,
    }));
  }, [companies]);

  const sortedPosts = useMemo(() => {
    if (!posts) return [] as Post[];
    return [...posts].sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!sortedPosts.length) return [] as Post[];
    if (!selectedCompanyIds.length) return sortedPosts;
    return sortedPosts.filter((post) =>
      selectedCompanyIds.includes(post.resourceUid)
    );
  }, [sortedPosts, selectedCompanyIds]);

  const defaultCompanyId = selectedCompanyIds[0] ?? companies?.[0]?.id ?? "";

  // 목록 모드일 때 기본으로 선택할 카드가 유지되도록 동기화합니다.
  useEffect(() => {
    if (viewMode !== "list") return;
    if (!filteredPosts.length) {
      setActiveId(null);
      return;
    }
    if (isCreatingNew) return;
    if (!activeId || !filteredPosts.some((post) => post.id === activeId)) {
      setActiveId(filteredPosts[0].id);
    }
  }, [viewMode, filteredPosts, activeId, isCreatingNew]);

  // 폼 모드로 전환되면 신규 초안 혹은 선택된 게시물 내용을 폼에 채웁니다.
  useEffect(() => {
    if (viewMode !== "form") {
      return;
    }
    if (isCreatingNew) {
      setDraft({
        ...EMPTY_POST,
        resourceUid: defaultCompanyId,
        dateTime: new Date().toISOString().slice(0, 10),
        createdAt: "",
      });
      return;
    }
    if (activeId) {
      const match = posts?.find((post) => post.id === activeId);
      if (match) {
        setDraft({
          id: match.id ?? "",
          title: match.title ?? "",
          resourceUid: match.resourceUid ?? defaultCompanyId,
          dateTime: match.dateTime ?? "",
          content: match.content ?? "",
          author: match.author ?? "",
          createdAt: match.createdAt ?? "",
        });
      }
    }
  }, [viewMode, isCreatingNew, activeId, posts, defaultCompanyId]);

  const handleSelect = useCallback((id: string) => {
    setIsCreatingNew(false);
    setActiveId(id);
    setViewMode("form");
  }, []);

  const handleCreateNew = useCallback(() => {
    setIsCreatingNew(true);
    setActiveId(null);
    setDraft({
      ...EMPTY_POST,
      resourceUid: defaultCompanyId,
      dateTime: new Date().toISOString().slice(0, 10),
      createdAt: "",
    });
    setViewMode("form");
  }, [defaultCompanyId]);

  const handleCancelForm = useCallback(() => {
    setIsCreatingNew(false);
    setViewMode("list");
  }, []);

  const handleChange = (field: keyof DraftState, value: string) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title || !draft.resourceUid || !draft.dateTime || !draft.author)
      return;
    try {
      const payload = {
        ...draft,
        id: activeId ?? undefined,
        createdAt: isCreatingNew ? undefined : draft.createdAt,
      };
      const saved = await upsert.mutate(payload);
      setIsCreatingNew(false);
      setActiveId(saved.id);
      setViewMode("list");
    } catch (mutationError) {
      console.warn("Post save failed", mutationError);
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      await remove.mutate(activeId);
      setIsCreatingNew(false);
      setActiveId(null);
      setDraft({ ...EMPTY_POST, resourceUid: defaultCompanyId });
      setViewMode("list");
    } catch (mutationError) {
      console.warn("Post delete failed", mutationError);
    }
  };

  const totalCount = posts?.length ?? 0;
  const filteredCount = filteredPosts.length;
  const isFiltered = Boolean(selectedCompanyIds.length);
  const activeCompanyName = draft.resourceUid
    ? companyLookup.get(draft.resourceUid) ?? draft.resourceUid
    : "";
  const isEditing = !isCreatingNew && Boolean(activeId);

  return (
    <Card className="flex h-full flex-col gap-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">
            행동 로그
          </p>
          <h3 className="text-xl font-semibold text-slate-50">
            게시물 & 조치 기록
          </h3>
          <p className="mt-1 text-xs text-slate-300/70">
            회사별 감축 계획, 이슈, 의사결정을 기록해 팀이 동일한 정보를
            공유하도록 유지하세요.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="text-xs text-slate-400/80">
            총 {totalCount}건 · 표시 중 {filteredCount}건
          </div>
          {isFiltered ? (
            <Badge tone="neutral" className="text-[11px]">
              회사 필터 적용됨
            </Badge>
          ) : null}
        </div>
      </header>

      {viewMode === "list" ? (
        <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-100">
              최근 업데이트
            </div>
            <Button variant="ghost" size="sm" onClick={handleCreateNew}>
              새 게시물
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-200">
              <p className="font-semibold">게시물을 불러오지 못했습니다</p>
              <p className="mt-1">{error}</p>
              <Button
                className="mt-3"
                variant="ghost"
                size="sm"
                onClick={refetch}
              >
                다시 시도
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex flex-1 flex-col gap-3 overflow-hidden">
              {filteredPosts.length > 0 ? (
                <ul className="flex flex-1 flex-col gap-3 overflow-auto pr-1">
                  {filteredPosts.map((post) => {
                    const isActive = post.id === activeId;
                    const companyName =
                      companyLookup.get(post.resourceUid) ?? post.resourceUid;
                    const periodLabel = post.dateTime
                      ? formatDateOnly(post.dateTime)
                      : "-";
                    const createdLabel = formatDateTimeLabel(post.createdAt);
                    const preview = post.content
                      ? `${post.content.slice(0, 80)}${
                          post.content.length > 80 ? "…" : ""
                        }`
                      : "내용 없음";
                    return (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(post.id)}
                          className={cn(
                            "w-full rounded-2xl border px-4 py-3 text-left transition",
                            isActive
                              ? "border-sky-400/70 bg-sky-500/20 text-sky-50"
                              : "border-white/10 bg-white/5 text-slate-200 hover:border-sky-400/40 hover:bg-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-300/80">
                            <span>{companyName}</span>
                            <span>{periodLabel}</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-current">
                            {post.title}
                          </p>
                          <p className="mt-1 text-xs text-current/70">
                            {preview}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400/80">
                            <span>작성자 {post.author}</span>
                            <span>{createdLabel}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-xs text-slate-300/70">
                  선택한 조건에 해당하는 게시물이 없습니다.
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <form
          className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-300/70">
                {isCreatingNew ? "새 게시물 작성" : "게시물 편집"}
              </p>
              <p className="text-sm font-semibold text-slate-50">
                {isCreatingNew
                  ? "신규 초안"
                  : activeCompanyName || "회사 미지정"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs text-slate-400/80">
              <span>
                작성일{" "}
                {isCreatingNew
                  ? "저장 시 자동 기록"
                  : formatDateTimeLabel(draft.createdAt)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
                제목
              </label>
              <Input
                placeholder="분기별 업데이트"
                value={draft.title}
                onChange={(event) => handleChange("title", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
                작성자
              </label>
              <Input
                placeholder="작성자 이름"
                value={draft.author}
                onChange={(event) => handleChange("author", event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
                회사
              </label>
              <DropdownSelect
                value={draft.resourceUid}
                onChange={(next) => handleChange("resourceUid", next)}
                options={companyOptions}
                placeholder="회사를 선택하세요"
                menuLabel="회사 선택"
                disabled={companyOptions.length === 0}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
                기간
              </label>
              <Input
                type="date"
                value={draft.dateTime}
                onChange={(event) =>
                  handleChange("dateTime", event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
              본문
            </label>
            <Textarea
              placeholder="주요 조치, 의존성, 요청 사항을 기록하세요"
              value={draft.content}
              onChange={(event) => handleChange("content", event.target.value)}
            />
          </div>

          {(upsert.error || remove.error) && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
              {upsert.error ?? remove.error}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelForm}
            >
              취소
            </Button>
            <Button type="submit" loading={upsert.isPending}>
              {isCreatingNew ? "게시물 등록" : "저장"}
            </Button>
            {isEditing ? (
              <Button
                type="button"
                variant="danger"
                loading={remove.isPending}
                onClick={handleDelete}
              >
                삭제
              </Button>
            ) : null}
          </div>
        </form>
      )}
    </Card>
  );
}
