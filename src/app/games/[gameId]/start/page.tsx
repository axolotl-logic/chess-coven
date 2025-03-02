// NextJS
import { notFound } from "next/navigation";

// Game
import { getFlavor } from "@/games";
import Link from "next/link";

type HasParams = {
  params: Promise<{
    gameId: string;
  }>;
};

export default async function Page(props: HasParams) {
  const params = await props.params;

  const {
    gameId
  } = params;

  const flavor = getFlavor(gameId);
  if (flavor == null) {
    return notFound();
  }
  const { rules, story, title } = flavor;

  return (
    <main className="flex min-h-[90dvh] flex-col justify-center gap-4 bg-backdrop p-6">
      <h1 className="text-center text-4xl">{title}</h1>
      <div>
        <div className="mb-1 text-center text-xl font-bold">Story</div>
        <p className="text-justify indent-6 text-lg">{story}</p>
      </div>
      <div>
        <div className="mb-1 text-center text-xl font-bold">Rules</div>
        <p className="text-justify indent-6 text-lg">{rules}</p>
      </div>
      <Link
        href={`/games/${gameId}/play`}
        className="mt-2 self-center rounded bg-amber-600 px-6 py-2 text-white hover:bg-amber-700"
      >
        Play
      </Link>
    </main>
  );
}
