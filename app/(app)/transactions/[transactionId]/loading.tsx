export default function Loading() {
    return (
        <div className="min-h-full bg-background relative overflow-hidden">
            <main className="relative z-10 mx-auto max-w-4xl px-4 pb-36 pt-12 md:px-6">
                <div className="space-y-12">
                    {/* STATUS SECTION SKELETON */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-24 w-24 animate-pulse rounded-[2.5rem] bg-muted/60" />
                        <div className="space-y-2">
                            <div className="h-10 w-64 animate-pulse rounded-lg bg-muted/60 lg:h-12 lg:w-80" />
                            <div className="h-4 w-48 animate-pulse rounded bg-muted/40 mx-auto" />
                        </div>
                    </div>

                    {/* AMOUNT CARD SKELETON */}
                    <div className="rounded-[3rem] border border-border/50 bg-card p-10 text-center shadow-xl">
                        <div className="h-3 w-32 animate-pulse rounded bg-muted/40 mx-auto mb-6" />
                        <div className="h-16 w-48 animate-pulse rounded-2xl bg-muted/60 mx-auto lg:h-20 lg:w-64" />
                        <div className="mt-8 flex justify-center">
                            <div className="h-10 w-40 animate-pulse rounded-2xl bg-muted/40" />
                        </div>
                    </div>

                    {/* DETAILS BOX SKELETON */}
                    <div className="rounded-[3rem] border border-border/50 bg-card/50 backdrop-blur-xl p-8 shadow-xl space-y-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between gap-6 px-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 animate-pulse rounded-xl bg-muted/40" />
                                    <div className="h-3 w-24 animate-pulse rounded bg-muted/30" />
                                </div>
                                <div className="h-5 w-32 animate-pulse rounded bg-muted/50" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
