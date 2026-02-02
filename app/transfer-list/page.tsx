import { TransferList } from "@/components/demo/TransferList";

export default function TransferListPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          Transfer List
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Effortlessly move items between two categories. Ideal for configuration 
          wizards, permission management, or building a custom tech stack.
        </p>
      </div>

      <TransferList />
    </div>
  );
}