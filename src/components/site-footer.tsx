import { Link } from "@tanstack/react-router";
import { LogoWord } from "@/components/logo";
import { t } from "@/lib/i18n";
import { useSite } from "@/lib/site-store";

export function SiteFooter() {
  const copy = t();
  const site = useSite();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <LogoWord />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.tagline}</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">{copy.footer.product}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link to="/markets" className="hover:text-foreground">
              {site.navMarkets}
            </Link>
            <Link to="/features" className="hover:text-foreground">
              {site.navFeatures}
            </Link>
            <Link to="/security" className="hover:text-foreground">
              {site.navSecurity}
            </Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">{copy.footer.company}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link to="/login" className="hover:text-foreground">
              {site.navOpenWallet}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted">{site.footerLegal}</p>
      </div>
    </footer>
  );
}
