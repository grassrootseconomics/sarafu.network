import { ArrowRight } from "lucide-react";

export function MigrationBanner() {
  return (
    <section
      aria-labelledby="migration-banner-title"
      className="relative z-20 flex h-[var(--migration-banner-height)] shrink-0 items-center border-b border-[#FBDB99]/40 bg-[#004844] px-3 text-white sm:px-4 md:px-6"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center gap-1 text-center md:flex-row md:gap-4 md:text-left">
        <p
          className="min-w-0 text-[11px] leading-[14px] sm:text-xs sm:leading-4 md:flex-1 md:text-sm md:leading-5"
          id="migration-banner-title"
        >
          <strong>
            Migrate your Sarafu account to Cosmo-Local Credit by{" "}
            <time dateTime="2026-10-30">30 October 2026</time>.
          </strong>{" "}
          Get the same features in an upgraded app with Google sign-in.
        </p>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] leading-4 sm:text-xs">
          <a
            className="inline-flex h-7 items-center gap-1 rounded-md bg-[#FBDB99] px-3 font-semibold text-[#004844] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href="https://cosmolocal.credit"
          >
            Migrate now
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </a>
          <span>
            Need help?{" "}
            <a
              className="font-semibold underline underline-offset-2 hover:text-[#FBDB99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href="mailto:info@grassecon.org"
            >
              info@grassecon.org
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
