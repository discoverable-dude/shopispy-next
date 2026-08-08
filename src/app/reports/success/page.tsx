import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AutoDownload } from "@/components/reports/AutoDownload";

export const dynamic = "force-dynamic";

// Stripe redirects here after a successful report purchase. The `next` param is
// the download path; we append the paid session_id so the gated route serves it.
export default async function ReportSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : "";
  const next = typeof sp.next === "string" ? sp.next : "";

  const downloadUrl =
    sessionId && next
      ? `${next}${next.includes("?") ? "&" : "?"}session_id=${encodeURIComponent(sessionId)}`
      : "";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Payment confirmed</h1>
          <p className="mt-3 text-muted-foreground">
            Thanks — your report is ready. The download should begin automatically.
          </p>

          {downloadUrl ? (
            <>
              <AutoDownload url={downloadUrl} />
              <a
                href={downloadUrl}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:brightness-110"
              >
                Download report
              </a>
              <p className="mt-4 text-xs text-muted-foreground">
                Didn&apos;t start? Use the button above. Keep this link to re-download.
              </p>
            </>
          ) : (
            <p className="mt-6 text-sm text-red-600">
              We couldn&apos;t build your download link. Please contact support with your receipt.
            </p>
          )}

          <div className="mt-8">
            <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
              Back to ShopiSpy
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
