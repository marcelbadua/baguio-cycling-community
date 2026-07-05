import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Community Guidelines',
    description:
        'Learn the community guidelines for participating in the Baguio Cycling Community.',
    alternates: { canonical: '/community-guidelines' },
    openGraph: {
        title: 'Community Guidelines | BCC',
        description:
            'Help us build a respectful, safe, and trustworthy cycling community.',
    },
    twitter: {
        title: 'Community Guidelines | BCC',
        description:
            'Help us build a respectful, safe, and trustworthy cycling community.',
    },
}

export default function CommunityGuidelinesPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10 prose dark:prose-invert">
            <article className="mx-auto max-w-3xl px-6 py-12">
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Community Guidelines
                </h1>

                <p className="text-muted-foreground mb-8">
                    The Baguio Cycling Community is built by cyclists, for cyclists.
                    Our goal is to create a friendly, informative, and supportive
                    platform where everyone feels welcome. By participating, you
                    agree to follow these guidelines.
                </p>

                <div className="space-y-8">

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Be Respectful
                        </h2>

                        <p className="text-muted-foreground">
                            Treat every member with courtesy and respect. Harassment,
                            hate speech, discrimination, bullying, threats, or abusive
                            behavior will not be tolerated.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Share Accurate Information
                        </h2>

                        <p className="text-muted-foreground">
                            Please post information that is truthful and accurate.
                            Deliberately posting false or misleading information,
                            especially regarding road hazards, missing bikes, rides,
                            or events, may result in content removal or account
                            suspension.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Report Road Hazards Responsibly
                        </h2>

                        <p className="text-muted-foreground">
                            Include the correct location whenever possible, provide
                            clear photos, and update or remove reports if the hazard
                            has already been resolved.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Missing Bike Reports
                        </h2>

                        <p className="text-muted-foreground">
                            Only report bicycles that are genuinely missing or stolen.
                            Provide accurate descriptions and avoid making accusations
                            against individuals without evidence.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Keep Content Cycling Related
                        </h2>

                        <p className="text-muted-foreground">
                            Posts should relate to cycling, including rides, events,
                            maintenance, safety, advocacy, routes, local news, road
                            conditions, and community activities.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Respect Privacy
                        </h2>

                        <p className="text-muted-foreground">
                            Do not post personal information such as addresses, phone
                            numbers, government IDs, or private conversations without
                            permission.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            No Spam or Misleading Content
                        </h2>

                        <p className="text-muted-foreground">
                            Repeated advertisements, fake giveaways, scams,
                            misleading links, or excessive self-promotion are not
                            permitted.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Ride Safely
                        </h2>

                        <p className="text-muted-foreground">
                            Do not encourage dangerous, reckless, or illegal riding
                            behavior. Help promote safe and responsible cycling in
                            Baguio and beyond.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Moderator Actions
                        </h2>

                        <p className="text-muted-foreground">
                            Our moderators may remove content or suspend accounts that
                            violate these guidelines. Repeated or serious violations
                            may result in permanent removal from the platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Help Build the Community
                        </h2>

                        <p className="text-muted-foreground">
                            Every member contributes to making this platform better.
                            Share helpful information, support fellow cyclists, report
                            inappropriate content, and help create a welcoming
                            environment for everyone.
                        </p>
                    </div>

                    <div>
    <h2 className="text-xl font-semibold mb-2">
        Remember
    </h2>

    <p className="text-muted-foreground">
        Ride with respect. Share responsibly. Support one another.
        Together, we can build a safer, stronger, and more connected
        cycling community in Baguio.
    </p>
</div>

                </div>
            </article>
        </main>
    )
}