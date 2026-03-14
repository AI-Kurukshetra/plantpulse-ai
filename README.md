# PlantPulse AI

Smart Plant Intelligence Platform – AI-driven manufacturing analytics and sustainability (real-time monitoring, energy analytics, predictive maintenance, emissions, OEE, multi-plant).

## Stack

- **Next.js** (App Router)
- **Supabase** (Auth, DB)
- **TypeScript**, **Tailwind CSS**, **React Hook Form**, **Zod**, **Recharts**

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables and set your Supabase (and optional OpenAI) keys:

   ```bash
   cp .env.example .env.local
   ```

3. Run development server:

   ```bash
   npm run dev
   ```

4. (Optional) Seed the database:

   ```bash
   npm run seed
   ```

## Scripts

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – run ESLint
- `npm run seed` – seed PlantPulse data

## License

Private / hackathon project.
