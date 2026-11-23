import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { optionalUser } from "@/lib/auth";

export const metadata = { title: "Accedi" };

export default async function Accedi({ searchParams }: { searchParams: Promise<{ nuovo?: string }> }) {
  if (await optionalUser()) redirect("/app");
  const { nuovo } = await searchParams;
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-6 px-4 py-10">
      <div>
        <a href="/" className="font-display text-2xl text-accent">Filo &amp; Fantasia</a>
        <h1 className="mt-4 text-4xl">Il tuo quaderno di uncinetto</h1>
        <p className="mt-2 text-muted">Salva i progetti, spunta i passi e chiedi aiuto all&apos;assistente. Serve un account gratuito.</p>
      </div>
      <div className="card"><AuthForm initialTab={nuovo ? "register" : "login"} /></div>
    </main>
  );
}
