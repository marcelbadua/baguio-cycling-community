import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'How Baguio Cycling Community collects, uses, and protects your data.',
    alternates: { canonical: '/privacy' },
    openGraph: {
        title: 'Privacy Policy | BCC',
        description: 'How Baguio Cycling Community collects, uses, and protects your data.',
    },
    twitter: {
        title: 'Privacy Policy | BCC',
        description: 'How Baguio Cycling Community collects, uses, and protects your data.',
    },
}

export default function PrivacyPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10 prose dark:prose-invert">

            {/* Your policy here */}
            <article className="mx-auto max-w-4xl px-6 py-12">
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Privacy Policy
                </h1>

                <p className="text-sm text-muted-foreground mb-8">
                    <strong>Last Updated:</strong> July 3, 2026
                </p>

                <p className="mb-6 leading-7 text-muted-foreground">
                    Welcome to <strong>Baguio Cycling Community</strong> ("we," "our," or
                    "us"). Your privacy is important to us. This Privacy Policy explains how
                    we collect, use, store, and protect your information when you use our
                    website and services.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    1. Information We Collect
                </h2>

                <h3 className="mt-6 mb-2 text-lg font-semibold">
                    Account Information
                </h3>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                    <li>Name or display name</li>
                    <li>Email address</li>
                    <li>Username</li>
                    <li>Profile photo (optional)</li>
                </ul>

                <h3 className="mt-6 mb-2 text-lg font-semibold">
                    Content You Share
                </h3>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                    <li>Posts and comments</li>
                    <li>Ride information</li>
                    <li>Community events</li>
                    <li>Road hazard reports</li>
                    <li>Missing bike reports</li>
                    <li>Photos and other uploaded media</li>
                </ul>

                <h3 className="mt-6 mb-2 text-lg font-semibold">
                    Technical Information
                </h3>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
                    <li>IP address</li>
                    <li>Browser type</li>
                    <li>Device information</li>
                    <li>Operating system</li>
                    <li>Pages visited</li>
                    <li>Usage analytics</li>
                    <li>Cookies and similar technologies</li>
                </ul>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    2. How We Use Your Information
                </h2>

                <p className="mb-4 leading-7 text-muted-foreground">
                    We use your information to:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
                    <li>Create and manage your account.</li>
                    <li>Allow you to participate in the community.</li>
                    <li>Display your posts and reports.</li>
                    <li>Improve the platform and user experience.</li>
                    <li>Maintain platform security.</li>
                    <li>Prevent spam, abuse, and fraudulent activity.</li>
                    <li>Communicate important updates.</li>
                    <li>Respond to support requests.</li>
                </ul>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    3. Community Content
                </h2>

                <p className="mb-4 leading-7 text-muted-foreground">
                    Information you voluntarily post, including rides, events, comments,
                    hazard reports, missing bike alerts, and profile information that you
                    choose to make public, may be visible to other users.
                </p>

                <p className="mb-8 leading-7 text-muted-foreground">
                    Please avoid posting sensitive personal information that you do not wish
                    to share publicly.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    4. Cookies and Analytics
                </h2>

                <p className="mb-4 leading-7 text-muted-foreground">
                    We use cookies and similar technologies to:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                    <li>Keep you signed in.</li>
                    <li>Remember your preferences.</li>
                    <li>Improve website performance.</li>
                    <li>Understand how visitors use the platform.</li>
                </ul>

                <p className="mb-8 leading-7 text-muted-foreground">
                    We may use analytics services, including Vercel Analytics, to understand
                    website traffic and improve user experience.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    5. Sharing Your Information
                </h2>

                <p className="mb-4 font-semibold text-red-600">
                    We do not sell your personal information.
                </p>

                <p className="mb-4 leading-7 text-muted-foreground">
                    Your information may only be shared:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
                    <li>
                        With trusted service providers that operate the platform, such as
                        hosting, authentication, cloud storage, email delivery, and analytics.
                    </li>
                    <li>When required by law.</li>
                    <li>
                        To protect the safety, rights, and security of our users or the
                        platform.
                    </li>
                </ul>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    6. Data Security
                </h2>

                <p className="mb-8 leading-7 text-muted-foreground">
                    We implement reasonable administrative, technical, and organizational
                    safeguards to protect your personal information. However, no method of
                    transmitting or storing data over the internet is completely secure, and
                    we cannot guarantee absolute security.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    7. Your Rights
                </h2>

                <p className="mb-4 leading-7 text-muted-foreground">
                    You may request to:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
                    <li>Access your personal information.</li>
                    <li>Correct inaccurate information.</li>
                    <li>Delete your account.</li>
                    <li>Request deletion of your personal data where applicable.</li>
                    <li>Withdraw consent where legally permitted.</li>
                </ul>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    8. Data Retention
                </h2>

                <p className="mb-4 leading-7 text-muted-foreground">
                    We retain your information only for as long as necessary to operate the
                    platform, comply with legal obligations, resolve disputes, and enforce our
                    policies.
                </p>

                <p className="mb-8 leading-7 text-muted-foreground">
                    If you delete your account, some community content may remain where
                    necessary to preserve discussions or comply with legal obligations.
                    Personal identifiers will be removed where reasonably possible.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    9. Children's Privacy
                </h2>

                <p className="mb-8 leading-7 text-muted-foreground">
                    Baguio Cycling Community is not intended for children under 13 years of
                    age. We do not knowingly collect personal information from children under
                    13.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    10. Third-Party Services
                </h2>

                <p className="mb-8 leading-7 text-muted-foreground">
                    We use trusted third-party services to operate the platform, including
                    hosting, authentication, analytics, email delivery, and cloud storage.
                    These providers have their own privacy policies governing the processing
                    of your information.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    11. Changes to This Privacy Policy
                </h2>

                <p className="mb-8 leading-7 text-muted-foreground">
                    We may update this Privacy Policy from time to time. Any changes will be
                    posted on this page with a revised "Last Updated" date.
                </p>

                <h2 className="mt-10 mb-4 text-2xl font-semibold">
                    12. Contact Us
                </h2>

                <p className="mb-10 leading-7 text-muted-foreground">
                    If you have any questions, concerns, or requests regarding this Privacy
                    Policy, please contact us through the contact information provided on the
                    Baguio Cycling Community platform.
                </p>

                <hr className="my-10 border-border" />

                <p className="text-sm text-muted-foreground leading-7">
                    By using <strong>Baguio Cycling Community</strong>, you acknowledge that
                    you have read and understood this Privacy Policy and agree to the
                    collection and use of your information as described herein.
                </p>
            </article>

        </main>
    )
}


