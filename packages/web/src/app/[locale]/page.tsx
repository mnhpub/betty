import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 text-center dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Betty
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        A community and group-management platform.
      </p>
      <div className="flex gap-4 text-base font-medium">
        <Link
          href="/login"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-5 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
