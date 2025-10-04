// /posts 경로에 대한 임시 화면으로, 추후 게시물 관리 도구가 추가될 예정임을 알려줍니다.
export default function PostsPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-300/70">지식 베이스</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-50">게시물 작업 공간</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-300/80">
          지속가능성 업데이트와 실행 로그, 검토 내역을 관리하는 화면입니다.
        </p>
      </header>
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center text-sm text-slate-300/70">
        게시물 관리 인터페이스가 추가될 영역입니다.
      </section>
    </div>
  );
}

