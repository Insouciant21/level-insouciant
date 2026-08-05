# Level Insouciant

This is a pnpm-based Next.js application with shadcn/ui and PostgreSQL.

## Production with Docker Compose

The production deployment expects:

- Docker Engine with Docker Compose.
- An existing external Docker network named `1panel-network`.
- A PostgreSQL container reachable as `postgresql` on that network and published
  on the host as `127.0.0.1:5432` for the production image build.
- A populated, ignored `.env` based on `.env.example`.

Build the images, apply Prisma migrations, and start the application:

```bash
docker compose up --build -d
```

The application is available at <http://localhost:21544>.

Inspect service state and the one-shot migration result:

```bash
docker compose ps -a
```

Follow Web logs or inspect migration logs:

```bash
docker compose logs -f web
docker compose logs migrate
```

Run committed migrations again without restarting PostgreSQL:

```bash
docker compose run --rm migrate
```

Stop and remove only this project's containers and network attachments:

```bash
docker compose down
```

PostgreSQL and its volumes are external to this Compose project and are not
removed by that command. `NEXT_PUBLIC_SITE_URL` is embedded at build time; after
changing it, rebuild the Web image with `docker compose build web`.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
