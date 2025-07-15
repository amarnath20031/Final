# Deployment Guide for Laksha Budget App

## GitHub Setup

1. Create a new repository on GitHub
2. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - Laksha Budget App"
git branch -M main
git remote add origin https://github.com/yourusername/laksha-budget-app.git
git push -u origin main
```

## Render Deployment

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "PostgreSQL"
3. Configure database:
   - Name: `laksha-postgres`
   - Database Name: `laksha`
   - User: `laksha_user`
   - Plan: Starter ($7/month) - Includes 1GB storage with automatic backups
4. Click "Create Database"
5. Copy the connection string (External Database URL)

### Step 2: Create Replit App for Authentication

1. Go to [Replit](https://replit.com) and create a new app
2. Go to app settings and note your REPL_ID
3. Add your Render domain to allowed domains

### Step 3: Deploy Web Service

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure deployment:
   - Name: `laksha-budget-app`
   - Branch: `main`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Plan: Starter ($7/month)

### Step 4: Environment Variables

In Render Web Service settings, add these environment variables:

```
NODE_ENV=production
DATABASE_URL=[Use value from PostgreSQL database]
SESSION_SECRET=[Generate random 32-character string]
REPL_ID=[Your Replit app ID]
REPLIT_DOMAINS=[Your Render domain, e.g., laksha-budget-app.onrender.com]
ISSUER_URL=https://replit.com/oidc
```

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Once deployed, go to your app URL and test the login flow

## Using render.yaml (Alternative)

If you have a `render.yaml` file in your repository:

1. In Render Dashboard, click "New" → "Blueprint"
2. Connect your GitHub repository
3. Render will automatically create all services based on the YAML configuration
4. You'll still need to manually set the authentication environment variables

## Database Persistence

Your PostgreSQL database on Render Starter plan includes:
- 1GB storage
- Automatic daily backups
- 90-day backup retention
- SSL connections
- Connection pooling

This ensures your data is safe and persists indefinitely.

## Costs

- Web Service (Starter): $7/month
- PostgreSQL (Starter): $7/month
- **Total: $14/month**

## Post-Deployment Checklist

1. ✅ App loads without errors
2. ✅ User authentication works
3. ✅ Database connections are successful
4. ✅ Categories are pre-populated
5. ✅ Users can create budgets
6. ✅ Users can add expenses
7. ✅ Data persists between sessions
8. ✅ Voice input works (HTTPS required)
9. ✅ Camera capture works (HTTPS required)

## Troubleshooting

### Authentication Issues
- Verify REPL_ID is correct
- Ensure REPLIT_DOMAINS matches your Render domain
- Check that Replit app allows your domain

### Database Issues
- Verify DATABASE_URL is correct
- Check database connection in Render logs
- Ensure PostgreSQL service is running

### Build Issues
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Ensure TypeScript compiles without errors