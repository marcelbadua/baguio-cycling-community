import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with the Baguio Cycling Community team.',
    alternates: { canonical: '/contact' },
    openGraph: {
        title: 'Contact Us | BCC',
        description: 'Get in touch with the Baguio Cycling Community team.',
    },
    twitter: {
        title: 'Contact Us | BCC',
        description: 'Get in touch with the Baguio Cycling Community team.',
    },
}

export default function ContactPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10 prose dark:prose-invert">

            <article className="mx-auto max-w-3xl px-6 py-12">
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Contact Us
                </h1>

                <p className="text-muted-foreground mb-8">
                    We'd love to hear from you. Whether you have questions, feedback, bug
                    reports, or suggestions, feel free to reach out.
                </p>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            General Inquiries
                        </h2>

                        <p className="text-muted-foreground">
                            For questions about the platform, community, or your account.
                        </p>

                        <p className="mt-2">
                            📧 thirdkraft+baguiocyclingcommunityapp@gmail.com
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Report Issues
                        </h2>

                        <p className="text-muted-foreground">
                            Found a bug or something isn't working? We'd appreciate your report so
                            we can improve the platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Community Concerns
                        </h2>

                        <p className="text-muted-foreground">
                            If you need to report inappropriate content, abusive behavior, or other
                            community concerns, please contact us immediately.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Response Time
                        </h2>

                        <p className="text-muted-foreground">
                            We aim to respond to inquiries within 2–5 business days.
                        </p>
                    </div>
                </div>
            </article>

        </main>
    )
}


