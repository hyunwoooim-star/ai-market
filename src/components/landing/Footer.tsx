export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <span className="font-bold text-white">AI 에이전트 마켓</span>
        </div>
        <p className="text-sm text-zinc-600">
          © 2026 AI Agent Market. Built with AI, for humans.
        </p>
        <div className="flex gap-6 text-sm text-zinc-500">
          <a href="#" className="hover:text-zinc-300 transition-colors">이용약관</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">문의</a>
        </div>
      </div>
    </footer>
  );
}
