import { TierList } from "@/components/demo/TierList";

export default function TierListPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          Tier List Maker
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Rank your favorite foods! Drag items from the unranked pool into the tiers,
          or rearrange them within the tiers to create your perfect ranking.
        </p>
      </div>

      <TierList />
    </div>
  );
}
