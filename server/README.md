# TECHALVES API

This backend currently uses a local JSON datastore at `server/data/store.json`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm start`
- `npm run create:admin`

## Current default state

- empty categories
- empty products
- empty blog posts
- no default admin account

## First-time setup

1. Copy `server/.env.example` to `server/.env`
2. Fill in real values
3. Run:

```bash
npm run create:admin
```

## Example backend environment

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:8080
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_DIST_DIR=
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=ChangeThisPassword123!
ADMIN_BOOTSTRAP_NAME=Site Admin
```

## Production reminders

- Do not ship `server/.env`
- Do not leave bootstrap placeholder credentials in `server/data/store.json`
- Rebuild `server/dist` from clean source before production if you use compiled output
- Keep `CORS_ORIGIN` aligned with your real domain
