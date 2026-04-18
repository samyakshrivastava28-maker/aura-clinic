import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_FILE = path.join(process.cwd(), 'clinic-settings.json');

function saveSettings(settings: any) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

function getSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  }
  return {};
}

let oauth2Client: any = null;

function getOAuth2Client() {
  if (!oauth2Client) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured in environment');
    }
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/auth/google/callback`
    );
  }
  return oauth2Client;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'AIzaSyABBMtcPErDUibNRsSoChBNXNdcIGIU0xw'], // Using provided key as demo fallback
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: 'none'
  }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Google Auth URL
  app.get('/api/auth/google/url', (req, res) => {
    try {
      const client = getOAuth2Client();
      const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
      ];

      const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
      });

      res.json({ url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Google Auth Callback
  app.get(['/auth/google/callback', '/auth/google/callback/'], async (req, res) => {
    const { code } = req.query;

    try {
      const client = getOAuth2Client();
      const { tokens } = await client.getToken(code as string);
      
      // Save tokens to our "database"
      const settings = getSettings();
      settings.googleTokens = tokens;
      saveSettings(settings);

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0fdfa;">
            <div style="text-align: center; background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <h2 style="color: #0d9488;">Authentication Successful</h2>
              <p>Your Google Calendar is now linked to Aura Clinic.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  setTimeout(() => window.close(), 2000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // Get Auth Status
  app.get('/api/auth/google/status', (req, res) => {
    const settings = getSettings();
    res.json({ 
      linked: !!settings.googleTokens,
      expiryDate: settings.googleTokens?.expiry_date
    });
  });

  // Get Busy Slots
  app.get('/api/calendar/busy-slots', async (req, res) => {
    const settings = getSettings();
    const tokens = settings.googleTokens;

    if (!tokens) {
      return res.json({ busy: [] });
    }

    try {
      const client = getOAuth2Client();
      client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: client });

      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: now.toISOString(),
          timeMax: nextWeek.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      const busy = response.data.calendars?.primary?.busy || [];
      res.json({ busy });
    } catch (error) {
      console.error('Error fetching freebusy:', error);
      res.json({ busy: [] });
    }
  });

  // Create Calendar Event
  app.post('/api/calendar/create-event', async (req, res) => {
    const settings = getSettings();
    const tokens = settings.googleTokens;

    if (!tokens) {
      return res.status(401).json({ error: 'Google Calendar not linked' });
    }

    try {
      const client = getOAuth2Client();
      client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: client });

      const { name, age, date, time, symptoms } = req.body;

      // Extract hours and minutes from time string (e.g. "10:00 AM")
      // This is a simple parser, might need hardening
      const [timePart, ampm] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const startDate = new Date(date);
      startDate.setHours(hours, minutes, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30); // 30 min duration

      const event = {
        summary: `Appointment: ${name}`,
        description: `Patient: ${name}\nAge: ${age}\nSymptoms: ${symptoms}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC',
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      res.json({ success: true, eventId: response.data.id });
    } catch (error) {
      console.error('Error creating calendar event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
