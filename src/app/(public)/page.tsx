import Link from "next/link";

import { FeedList } from "@/features/feed/components/feed-list";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

      {/* Hero */}
      <section className="text-center space-y-5 py-12">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm">
          🚴 Community Driven Cycling
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Ride.
          <br />
          Report.
          <br />
          Connect.
        </h1>

        <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
          Join cyclists across Baguio City. Share rides, discover events,
          report road hazards, help recover missing bikes, and grow the local
          cycling community.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium"
          >
            Join Free
          </Link>

          <Link
            href="/feed"
            className="rounded-lg border px-6 py-3 font-medium hover:bg-muted"
          >
            Browse Feed
          </Link>
        </div>
      </section>

      {/* Feed */}

      <section className="max-w-2xl mx-auto space-y-6">

        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Latest Community Posts
          </h2>

          <p className="text-muted-foreground mt-2">
            See what cyclists around Baguio are sharing.
          </p>
        </div>

        <FeedList publicView />

      </section>

    </div>
  );
}