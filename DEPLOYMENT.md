# Vercel Deployment Guide

## Manual Deployment Steps

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Verify your email address

### Step 2: Import Project
1. Click "New Project" on your Vercel dashboard
2. Select "Import Git Repository"
3. Choose "TrustVaultLabs/stadium-secret-bets" from the list
4. Click "Import"

### Step 3: Configure Project Settings
1. **Project Name**: `stadium-secret-bets`
2. **Framework Preset**: Select "Vite"
3. **Root Directory**: Leave as default (./)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### Step 4: Environment Variables
Add the following environment variables in Vercel dashboard:

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
```

**To add environment variables:**
1. Go to Project Settings → Environment Variables
2. Add each variable with the exact values above
3. Make sure to select "Production", "Preview", and "Development" for each variable
4. Click "Save"

### Step 5: Deploy
1. Click "Deploy" button
2. Wait for the build process to complete (usually 2-3 minutes)
3. Your app will be available at the provided Vercel URL

### Step 6: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (up to 24 hours)

## Automatic Deployment

Once configured, Vercel will automatically deploy your app whenever you push changes to the main branch of your GitHub repository.

## Build Configuration

The project uses the following build configuration:
- **Framework**: Vite
- **Node.js Version**: 18.x (recommended)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are properly installed
2. **Environment Variables Not Working**: Ensure variables are prefixed with `NEXT_PUBLIC_`
3. **Wallet Connection Issues**: Verify WalletConnect Project ID is correct
4. **Network Issues**: Check that RPC URLs are accessible

### Support:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Contact TrustVaultLabs support for project-specific issues

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Wallet connection works
- [ ] Environment variables are properly set
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Performance is acceptable
- [ ] All features are functional

## Monitoring

Monitor your deployment through:
- Vercel Dashboard analytics
- Function logs
- Performance metrics
- Error tracking
