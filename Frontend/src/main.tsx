import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

// Use a properly configured client ID with authorized origins
const GOOGLE_CLIENT_ID = "155532480840-tcnt4mt94cnkst6qloe98o4v7f83mive.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} onScriptLoadError={() => console.error("Google OAuth script failed to load")}>
    <App />
  </GoogleOAuthProvider>
);