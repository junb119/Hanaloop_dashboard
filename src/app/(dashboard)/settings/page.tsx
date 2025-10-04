// /settings 경로에 대한 임시 화면으로, 추후 관리 기능이 구축될 때까지 안내 역할을 합니다.
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-300/70">관리</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-50">조직 및 정책 설정</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-300/80">
          리포트 구조, 세금 가정, 운영 가드레일을 구성하는 화면입니다. 
        </p>
      </header>
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center text-sm text-slate-300/70">
        설정 폼이 추가될 영역입니다.
      </section>
    </div>
  );
}

