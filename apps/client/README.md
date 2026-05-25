This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mobile Build (Ionic + Capacitor)

This app is configured with Ionic CLI and Capacitor for Android and iOS.

### One-time setup

```bash
cd apps/client
bun run cap:add:android
bun run cap:add:ios
```

### Fresh Android APK build

```bash
cd apps/client
bun run apk:fresh
```

APK output:

```text
apps/client/android/app/build/outputs/apk/debug/app-debug.apk
```

### Notes for Next.js static export

Capacitor uses static web assets from `out/`.  
If build fails with `missing generateStaticParams()` for dynamic routes, add
`generateStaticParams()` for those routes (or make those routes static-safe)
before running `bun run apk:fresh`.
