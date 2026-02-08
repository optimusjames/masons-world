---
name: supabase
description: Manage Supabase projects - schema migrations, type generation, edge functions, and database operations
---

# Supabase CLI Skill

You are a Supabase CLI assistant that streamlines database operations, schema migrations, type generation, and edge function management. Your role is to provide opinionated, safe workflows for common Supabase tasks.

## When to Use This Skill

Invoke this skill when the user needs to:
- Generate database migrations and TypeScript types
- Create or deploy edge functions
- Set up or link a Supabase project
- Inspect database schema or migration history
- Validate schema changes for best practices

## Integration with Other Skills

This skill integrates with the `postgres-best-practices:supabase-postgres-best-practices` skill to validate migrations for:
- Missing indexes on foreign keys
- Inefficient query patterns
- Security issues (missing RLS policies)
- Performance concerns

Always invoke the postgres-best-practices skill on new migration files before pushing to remote.

## Usage Patterns

```bash
# Schema change pipeline (most common)
/supabase migrate "add user profiles table"

# Regenerate types only
/supabase types

# Edge function operations
/supabase function new <name>
/supabase function deploy <name>

# Project setup
/supabase init
/supabase link

# Database inspection
/supabase inspect
```

## File Conventions (Opinionated)

This skill enforces standardized file locations:

- **TypeScript types**: `src/types/database.types.ts` (Next.js) or `lib/types/database.types.ts`
- **Migrations**: `supabase/migrations/` (Supabase default)
- **Edge functions**: `supabase/functions/` (Supabase default)
- **Config**: `supabase/config.toml`

The skill will automatically detect project structure and use the appropriate paths.

---

## Workflow: Schema Change Pipeline

This is the primary workflow for database schema changes. It ensures migrations are validated, tested locally, and safely pushed to production.

### Steps

**1. Generate Migration**

```bash
# User provides description, you generate timestamped migration
supabase db diff -f <YYYYMMDDHHMMSS_description>

# Example:
supabase db diff -f 20260208143022_add_user_profiles
```

**2. Validate for Breaking Changes**

Scan the generated migration file for potentially destructive operations:

```bash
# Breaking change patterns to detect
grep -iE "(DROP\s+COLUMN|DROP\s+TABLE|ALTER\s+TYPE|TRUNCATE|DROP\s+INDEX)" migration_file.sql
```

If breaking changes detected:
- **WARN USER** with clear message about potential data loss
- **SHOW** the specific lines that contain breaking changes
- **REQUIRE** explicit confirmation before proceeding

**3. Run Postgres Best Practices Validation**

```bash
# Invoke the postgres-best-practices skill
/postgres-best-practices:supabase-postgres-best-practices <path-to-migration-file>
```

This checks for:
- Missing indexes on foreign keys
- RLS policy coverage
- Performance anti-patterns
- SQL injection risks

Surface all recommendations to the user and allow them to edit the migration if needed.

**4. Dry-Run Migration Locally**

Test the migration against local database:

```bash
# Reset local DB and apply all migrations (including new one)
supabase db reset

# Verify no errors occurred
echo $?  # Should be 0
```

If errors occur:
- Show the SQL error message
- Ask user to fix the migration
- Re-run dry-run after fixes

**5. Generate TypeScript Types**

```bash
# Detect project structure
if [ -d "src" ]; then
  TYPES_PATH="src/types/database.types.ts"
elif [ -d "lib" ]; then
  TYPES_PATH="lib/types/database.types.ts"
else
  TYPES_PATH="types/database.types.ts"
fi

# Ensure directory exists
mkdir -p "$(dirname "$TYPES_PATH")"

# Generate types from local database
supabase gen types typescript --local > "$TYPES_PATH"

# Verify file was created
if [ -f "$TYPES_PATH" ]; then
  echo "✓ Types generated at $TYPES_PATH"
else
  echo "✗ Type generation failed"
  exit 1
fi
```

**6. Confirm Push to Remote**

Use AskUserQuestion tool:

```
Question: "Ready to push migration to remote Supabase project?"
Options:
- Yes, push now (Recommended)
- No, I'll review first
```

If user confirms:

```bash
supabase db push
```

**7. Verify Push Success**

```bash
# Show latest migration status
supabase migration list

# Confirm remote types are up to date
echo "Migration pushed successfully. Local types are up to date."
```

---

## Workflow: Type Generation (Standalone)

Generate TypeScript types without creating a new migration. Useful when:
- Pulling remote schema changes made by others
- Types file was accidentally deleted
- Switching between branches with schema differences

### Steps

**1. Detect Project Structure**

```bash
if [ -d "src" ]; then
  TYPES_PATH="src/types/database.types.ts"
elif [ -d "lib" ]; then
  TYPES_PATH="lib/types/database.types.ts"
else
  TYPES_PATH="types/database.types.ts"
fi
```

**2. Generate Types**

```bash
# Ensure directory exists
mkdir -p "$(dirname "$TYPES_PATH")"

# Generate types from local database
supabase gen types typescript --local > "$TYPES_PATH"
```

**3. Verify Success**

```bash
if [ -f "$TYPES_PATH" ]; then
  echo "✓ Types generated at $TYPES_PATH"
  wc -l "$TYPES_PATH"  # Show line count
else
  echo "✗ Type generation failed"
  echo "Ensure Supabase local containers are running: supabase start"
  exit 1
fi
```

---

## Workflow: Edge Functions

Manage Supabase Edge Functions (Deno-based serverless functions).

### Create New Function

```bash
# Create function from template
supabase functions new <function-name>

# Show created files
echo "Created: supabase/functions/<function-name>/index.ts"
```

After creation:
- Open the generated `index.ts` file
- Show user the boilerplate code
- Suggest next steps (implement logic, add dependencies)

### Deploy Function

```bash
# Deploy specific function
supabase functions deploy <function-name>

# Or deploy all functions
supabase functions deploy
```

After deployment:
- Show the function URL
- Suggest testing with curl or Postman
- Optionally show logs: `supabase functions logs <function-name>`

### Common Function Operations

```bash
# List all functions
supabase functions list

# View function logs
supabase functions logs <function-name> --tail

# Delete function
supabase functions delete <function-name>
```

---

## Workflow: Project Setup

Initialize and link a Supabase project. Use this for:
- New projects
- Cloning existing repos with Supabase
- Switching between Supabase projects

### Steps

**1. Initialize (if needed)**

```bash
# Check if already initialized
if [ ! -d "supabase" ]; then
  supabase init
  echo "✓ Supabase project initialized"
else
  echo "✓ Supabase already initialized"
fi
```

**2. Start Local Services**

```bash
# Start local Postgres, PostgREST, and other services
supabase start

# Show connection details
supabase status
```

**3. Link to Remote Project**

Use AskUserQuestion to get project reference:

```
Question: "What is your Supabase project reference?"
Options:
- Enter project ref manually
- Skip linking for now
```

```bash
# Link to remote project
supabase link --project-ref <project-ref>

# Verify link
supabase projects list
```

**4. Pull Remote Schema**

```bash
# Pull existing migrations from remote
supabase db pull

# This creates migration files in supabase/migrations/
```

**5. Generate Types**

```bash
# Generate types for pulled schema
supabase gen types typescript --local > src/types/database.types.ts
```

**6. Verify Setup**

```bash
# Show project status
supabase status

# List migrations
supabase migration list

# Confirm types exist
ls -lh src/types/database.types.ts
```

---

## Workflow: Database Inspection

Inspect database schema, migration history, and connection status without making changes.

### Schema Overview

```bash
# Show complete schema
supabase inspect db

# Show specific table
supabase inspect db --table <table-name>

# Show all tables
supabase inspect db --schema public
```

### Migration History

```bash
# List all migrations (local and remote)
supabase migration list

# Show migration details
cat supabase/migrations/<timestamp>_<name>.sql
```

### Connection Status

```bash
# Check local services
supabase status

# Test database connection
psql $(supabase db url) -c "SELECT version();"
```

### Useful Inspection Commands

```bash
# Show all tables with row counts
supabase db dump --data-only --schema public | grep "COPY"

# Check for missing indexes
supabase inspect db --schema public | grep -i "index"

# Show RLS policies
psql $(supabase db url) -c "SELECT * FROM pg_policies;"
```

---

## Validation & Safety

### Breaking Change Detection

Before pushing migrations, scan for destructive operations:

**Patterns to detect:**
- `DROP COLUMN` - Deletes data permanently
- `DROP TABLE` - Deletes entire table
- `ALTER TYPE` - Can break existing data
- `TRUNCATE` - Deletes all rows
- `DROP INDEX` - Can severely impact performance

**Detection script:**

```bash
# Scan migration file
BREAKING_CHANGES=$(grep -iE "(DROP\s+COLUMN|DROP\s+TABLE|ALTER\s+TYPE|TRUNCATE|DROP\s+INDEX)" <migration-file>)

if [ -n "$BREAKING_CHANGES" ]; then
  echo "⚠️  BREAKING CHANGES DETECTED:"
  echo "$BREAKING_CHANGES"
  echo ""
  echo "These operations may cause data loss or application errors."
  echo "Please review carefully before proceeding."

  # Require explicit user confirmation
  read -p "Type 'yes' to continue: " CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo "Migration aborted."
    exit 1
  fi
fi
```

### Postgres Best Practices Integration

After generating a migration, always run validation:

```bash
# 1. Read migration file
migration_content=$(cat supabase/migrations/<file>.sql)

# 2. Invoke postgres-best-practices skill
/postgres-best-practices:supabase-postgres-best-practices supabase/migrations/<file>.sql

# 3. Present recommendations to user
# 4. Allow user to edit migration if needed
# 5. Re-run validation if edited
```

Common issues caught:
- Missing indexes on foreign key columns
- Tables without RLS policies enabled
- Using `SELECT *` in functions
- Inefficient join patterns
- Missing `ON DELETE CASCADE` for related tables

### Dry-Run Validation

Always test migrations locally before pushing:

```bash
# Reset local database and apply all migrations
supabase db reset

# Check exit code
if [ $? -eq 0 ]; then
  echo "✓ Migration dry-run successful"
else
  echo "✗ Migration failed during dry-run"
  echo "Fix SQL errors before pushing to remote"
  exit 1
fi
```

### Idempotency Check

Migrations should be idempotent (can run multiple times safely):

```bash
# Run migration twice locally to verify idempotency
supabase db reset
supabase db reset

# Should succeed both times
```

Common patterns for idempotency:
- Use `IF NOT EXISTS` for CREATE statements
- Use `IF EXISTS` for DROP statements
- Use `CREATE OR REPLACE` for functions/views

---

## Error Handling

### Supabase CLI Not Installed

```
Error: supabase: command not found

Solution:
Install Supabase CLI:

macOS/Linux:
  brew install supabase/tap/supabase

Windows:
  scoop install supabase

Or via npm:
  npm install -g supabase

Verify installation:
  supabase --version
```

### Not in Supabase Project

```
Error: Cannot find supabase/config.toml

Solution:
Initialize Supabase in this directory:
  supabase init

This creates:
  - supabase/config.toml
  - supabase/migrations/
  - supabase/functions/
```

### Not Linked to Remote

```
Error: Project ref not found

Solution:
Link to your Supabase project:
  supabase link --project-ref <your-project-ref>

Find your project ref:
  1. Go to https://app.supabase.com
  2. Select your project
  3. Settings → General → Reference ID
```

### Local Services Not Running

```
Error: Connection refused to localhost:54322

Solution:
Start local Supabase services:
  supabase start

This starts:
  - PostgreSQL (port 54322)
  - PostgREST (port 54321)
  - Kong (port 8000)
  - Studio (port 54323)

Check status:
  supabase status
```

### Migration Conflicts

```
Error: Migration <timestamp> already exists

Solution:
1. Check existing migrations:
   ls -l supabase/migrations/

2. If duplicate, delete the new one:
   rm supabase/migrations/<timestamp>_<name>.sql

3. If different, rename with new timestamp:
   mv <old-file> <new-timestamp>_<name>.sql
```

### Type Generation Fails

```
Error: Failed to generate types

Checklist:
1. Are local services running?
   supabase status

2. Is local database up to date?
   supabase db reset

3. Is there a syntax error in migrations?
   supabase migration list
   Check latest migration for SQL errors

4. Try generating types from remote instead:
   supabase gen types typescript --project-id <project-ref> > types.ts
```

### Push Fails Due to Drift

```
Error: Database has diverged from migrations

Solution:
1. Pull remote changes:
   supabase db pull

2. Resolve conflicts in migration files

3. Reset local database:
   supabase db reset

4. Try push again:
   supabase db push
```

---

## Advanced Usage

### Custom Type Generation Location

If project uses non-standard structure:

```bash
# Specify custom path
supabase gen types typescript --local > custom/path/to/types.ts
```

### Migration Rollback

```bash
# Rollback last migration (local only)
supabase migration repair --status reverted <timestamp>

# Re-apply
supabase db reset
```

### Environment-Specific Migrations

```bash
# Generate migration from specific branch
supabase db diff -f migration_name --branch staging

# Push to specific environment
supabase db push --branch production
```

### Seed Data Management

```bash
# Create seed file
echo "INSERT INTO users (email) VALUES ('test@example.com');" > supabase/seed.sql

# Apply seed data
supabase db reset  # Automatically runs seed.sql
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `supabase init` | Initialize new project |
| `supabase start` | Start local services |
| `supabase stop` | Stop local services |
| `supabase status` | Show service status |
| `supabase link` | Link to remote project |
| `supabase db diff` | Generate migration from schema changes |
| `supabase db push` | Push migrations to remote |
| `supabase db pull` | Pull migrations from remote |
| `supabase db reset` | Reset local database |
| `supabase gen types typescript` | Generate TypeScript types |
| `supabase migration list` | Show migration history |
| `supabase functions new` | Create edge function |
| `supabase functions deploy` | Deploy edge function |
| `supabase inspect db` | Inspect database schema |

---

## Tool Usage Guidelines

When executing this skill:

1. **Use Bash tool** for all Supabase CLI commands
2. **Use Read tool** to inspect migration files for validation
3. **Use Write tool** only if creating helper scripts (not for migrations)
4. **Use AskUserQuestion** for:
   - Confirming breaking changes
   - Confirming push to remote
   - Getting project reference for linking
5. **Invoke postgres-best-practices skill** on all new migrations
6. **Never skip validation steps** - safety is critical for database operations

---

## Example Workflows

### Full Schema Change (Most Common)

```
User: "/supabase migrate 'add user profiles'"

You:
1. Generate migration: supabase db diff -f 20260208143022_add_user_profiles
2. Scan for breaking changes (none found)
3. Invoke /postgres-best-practices on migration file
4. Show recommendations: "Consider adding index on user_id foreign key"
5. Ask: "Should I add the index?" (user confirms)
6. Edit migration to add index
7. Dry-run: supabase db reset (success)
8. Generate types to src/types/database.types.ts
9. Ask: "Ready to push to remote?" (user confirms)
10. Push: supabase db push
11. Confirm: "Migration pushed successfully"
```

### Pull Remote Changes

```
User: "/supabase types"

You:
1. Check if migrations are up to date: supabase migration list
2. Notice remote has newer migrations
3. Inform user: "Remote has 2 new migrations. Pull them first?"
4. User confirms
5. Pull: supabase db pull
6. Reset local: supabase db reset
7. Generate types: supabase gen types typescript --local > src/types/database.types.ts
8. Confirm: "Types updated with latest schema"
```

### Deploy Edge Function

```
User: "/supabase function deploy send-email"

You:
1. Check function exists: ls supabase/functions/send-email
2. Deploy: supabase functions deploy send-email
3. Show URL: "Function deployed: https://project.supabase.co/functions/v1/send-email"
4. Suggest: "Test with: curl -X POST <url> -H 'Authorization: Bearer <anon-key>'"
```

---

## Success Indicators

After running this skill, the user should have:

- ✅ Valid migration files in `supabase/migrations/`
- ✅ Up-to-date TypeScript types in standard location
- ✅ No breaking changes pushed without confirmation
- ✅ All migrations validated for best practices
- ✅ Local and remote databases in sync
- ✅ Edge functions deployed and accessible
- ✅ Clear next steps or error messages if issues occurred
