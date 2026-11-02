export function Footer() {
  return (
    <footer className="py-8 px-[5%] bg-statute text-paper-raised font-body">
      <div>
        <div className="mb-6">
          <img src="/wordmark-white.png" fetchPriority="high" alt="ProcVault Logo" className="h-8 mb-2" />
          <p className="text-sm text-paper-raised/80">
            GDPR vendor compliance tracking for lean legal and ops teams.
          </p>
        </div>
        <div className="pt-4 border-t border-statute-hover text-center text-xs text-paper-raised/70">
          © {new Date().getFullYear()} ProcVault
        </div>
      </div>
    </footer>
  );
}
