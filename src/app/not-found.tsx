import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-8xl font-bold text-transparent">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Back to Home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
        >
          Dashboard
        </Link>
        <Link
          href="/contact"
          className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
