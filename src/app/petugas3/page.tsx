16:18:43.657 Running build in Washington, D.C., USA (East) – iad1
16:18:43.658 Build machine configuration: 2 cores, 8 GB
16:18:43.673 Cloning github.com/AzrilSadja/anjungan-mandiri-lapas (Branch: master, Commit: 9a3b098)
16:18:43.675 Skipping build cache, deployment was triggered without cache.
16:18:43.965 Cloning completed: 291.000ms
16:18:44.371 Running "vercel build"
16:18:44.400 Vercel CLI 53.3.2
16:18:44.755 Installing dependencies...
16:18:55.338 npm warn deprecated uuid@8.3.2: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
16:19:14.640 
16:19:14.640 > anjungan-mandiri-next@0.1.0 postinstall
16:19:14.640 > prisma generate
16:19:14.641 
16:19:15.963 Loaded Prisma config from prisma.config.ts.
16:19:15.964 
16:19:16.352 Prisma schema loaded from prisma/schema.prisma.
16:19:16.700 
16:19:16.701 ✔ Generated Prisma Client (v7.8.0) to ./node_modules/@prisma/client in 214ms
16:19:16.701 
16:19:16.701 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
16:19:16.701 
16:19:16.702 
16:19:16.762 
16:19:16.763 added 583 packages in 32s
16:19:16.764 
16:19:16.764 170 packages are looking for funding
16:19:16.764   run `npm fund` for details
16:19:16.881 Detected Next.js version: 16.2.4
16:19:16.892 Running "npm run build"
16:19:17.684 
16:19:17.685 > anjungan-mandiri-next@0.1.0 build
16:19:17.685 > next build
16:19:17.685 
16:19:18.429   Applying modifyConfig from Vercel
16:19:18.436 Attention: Next.js now collects completely anonymous telemetry regarding usage.
16:19:18.437 This information is used to shape Next.js' roadmap and prioritize features.
16:19:18.437 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
16:19:18.437 https://nextjs.org/telemetry
16:19:18.437 
16:19:18.465 ▲ Next.js 16.2.4 (Turbopack)
16:19:18.466 
16:19:18.515   Creating an optimized production build ...
16:19:32.559 ✓ Compiled successfully in 13.5s
16:19:32.565   Running TypeScript ...
16:19:39.686 Failed to type check.
16:19:39.687 
16:19:39.687 ./src/app/petugas3/page.tsx:1:10
16:19:39.688 Type error: Module '"@/components/queue/PetugasView"' has no exported member 'PetugasView'. Did you mean to use 'import PetugasView from "@/components/queue/PetugasView"' instead?
16:19:39.688 
16:19:39.688 > 1 | import { PetugasView } from "@/components/queue/PetugasView";
16:19:39.689     |          ^
16:19:39.689   2 |
16:19:39.689   3 | export default function Petugas3Page() {
16:19:39.689   4 |   return <PetugasView variant="v3" />;
16:19:39.754 Next.js build worker exited with code: 1 and signal: null
16:19:39.826 Error: Command "npm run build" exited with 1