# Creating Database Migration

To apply the strategy schema changes, run:

```bash
cd apps/api
npx prisma migrate dev --name add-strategy-tables
```

This will:
1. Create a new migration file
2. Apply the migration to your database
3. Generate the updated Prisma client

If you haven't set up the database yet, first run:
```bash
docker-compose up -d postgres
npx prisma migrate dev --name init
```
