# Frontend

## Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Select the Frontend directory as the root directory
4. Set the environment to "Static Site"
5. Set the build command to `npm install && npm run build`
6. Set the publish directory to `dist`
7. Add the environment variable: `VITE_API_BASE_URL=https://careersync-mvp-final-backend.onrender.com`
8. Deploy the site

The frontend will now connect to your deployed backend at https://careersync-mvp-final-backend.onrender.com 
