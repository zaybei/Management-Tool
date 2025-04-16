# Plooma

Plooma is a project management tool built with Next.js, Supabase, and Tailwind CSS. It allows users to organize, track, and manage their projects efficiently.

## Technologies Used

-   [Next.js](https://nextjs.org) - A React framework for building performant web applications.
-   [Supabase](https://supabase.com) - An open-source Firebase alternative for the backend.
-   [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework for styling the application.
-   [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript.

## Features

-   User authentication (Sign up, Sign in)
-   Dashboard for managing projects and members
-   Admin and member roles with different access levels
-   Create, read, update, and delete projects
-   Manage team members
-   Real-time updates

## Getting Started

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Set up Supabase:

    -   Create a new project on [Supabase](https://supabase.com).
    -   Update the `supabaseUrl` and `supabaseAnonKey` in `src/utils/supabaseClient.ts` with your Supabase credentials.
    -   Set the `SUPABASE_KEY` environment variable to your Supabase Anon Key.

4.  Run the development server:

    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, Supabase, and Tailwind CSS, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Supabase Documentation](https://supabase.com/docs)
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
