import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDb, saveDb } from './server/store';
import { User, Event, Project, Announcement, Opportunity, Resource } from './src/types';
import dotenv from 'dotenv';

dotenv.config();

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize DB store
let db = initDb();

  // Helper to sync db
  const persist = () => saveDb(db);

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'IET CONNECT API', time: new Date().toISOString() });
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, email, password, phone, gender, dob, city, institution } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ success: false, message: 'Username, Email and Password are required.' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const newUser: User & { passwordHash: string } = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        username: String(username).trim(),
        email: normalizedEmail,
        passwordHash: String(password),
        phone: String(phone || ''),
        gender: String(gender || 'Other'),
        dob: String(dob || ''),
        city: String(city || ''),
        institution: String(institution || 'IET Student Chapter'),
        role: 'member',
        bio: 'New IET CONNECT Member excited to learn and contribute.',
        skills: ['Engineering', 'Problem Solving'],
        interests: ['Technology', 'Networking'],
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        points: 50,
        joinedAt: new Date().toISOString().split('T')[0]
      };

      db.users.push(newUser);
      persist();

      const { passwordHash, ...safeUser } = newUser;
      const token = `iet_token_${newUser.id}`;

      res.status(201).json({
        success: true,
        user: safeUser,
        token,
        message: 'Account created successfully! Welcome to IET CONNECT.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error during registration.' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!user || user.passwordHash !== String(password)) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
      }

      const { passwordHash, ...safeUser } = user;
      const token = `iet_token_${user.id}`;

      res.json({
        success: true,
        user: safeUser,
        token,
        message: 'Welcome back to IET CONNECT!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error during login.' });
    }
  });

  // Auth: Get Current User profile
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = authHeader.replace('Bearer iet_token_', '').trim();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // Update Profile
  app.put('/api/users/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = authHeader.replace('Bearer iet_token_', '').trim();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      username, phone, gender, dob, city, institution, bio, skills, interests, githubUrl, linkedinUrl, avatarUrl
    } = req.body;

    const existingUser = db.users[userIndex];
    const updatedUser = {
      ...existingUser,
      username: username ?? existingUser.username,
      phone: phone ?? existingUser.phone,
      gender: gender ?? existingUser.gender,
      dob: dob ?? existingUser.dob,
      city: city ?? existingUser.city,
      institution: institution ?? existingUser.institution,
      bio: bio ?? existingUser.bio,
      skills: Array.isArray(skills) ? skills : existingUser.skills,
      interests: Array.isArray(interests) ? interests : existingUser.interests,
      githubUrl: githubUrl ?? existingUser.githubUrl,
      linkedinUrl: linkedinUrl ?? existingUser.linkedinUrl,
      avatarUrl: avatarUrl ?? existingUser.avatarUrl
    };

    db.users[userIndex] = updatedUser;
    persist();

    const { passwordHash, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser, message: 'Profile updated successfully!' });
  });

  // Get Members Directory
  app.get('/api/members', (_req, res) => {
    const safeMembers = db.users.map(({ passwordHash, ...member }) => member);
    res.json({ success: true, members: safeMembers });
  });

  // --- EVENTS API ---
  app.get('/api/events', (_req, res) => {
    res.json({ success: true, events: db.events });
  });

  app.post('/api/events', (req, res) => {
    const { title, description, category, date, time, location, isVirtual, virtualLink, speaker, speakerRole, organizer, bannerUrl, maxCapacity, tags } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ success: false, message: 'Title, description and date are required.' });
    }

    const newEvent: Event = {
      id: `evt_${Date.now()}`,
      title,
      description,
      category: category || 'Workshop',
      date,
      time: time || '10:00 AM - 12:00 PM',
      location: location || 'TBA',
      isVirtual: Boolean(isVirtual),
      virtualLink,
      speaker,
      speakerRole,
      organizer: organizer || 'IET Chapter',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      maxCapacity: Number(maxCapacity) || 100,
      registeredUserIds: [],
      tags: Array.isArray(tags) ? tags : ['IET', 'Event'],
      status: 'upcoming'
    };

    db.events.unshift(newEvent);
    persist();

    res.status(201).json({ success: true, event: newEvent, message: 'Event created successfully!' });
  });

  // Toggle Event Registration
  app.post('/api/events/:id/register', (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Please login to register for events.' });
    }

    const userId = authHeader.replace('Bearer iet_token_', '').trim();
    const event = db.events.find(e => e.id === id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registeredIndex = event.registeredUserIds.indexOf(userId);
    let isRegistered = false;

    if (registeredIndex === -1) {
      if (event.registeredUserIds.length >= event.maxCapacity) {
        return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
      }
      event.registeredUserIds.push(userId);
      isRegistered = true;
    } else {
      event.registeredUserIds.splice(registeredIndex, 1);
      isRegistered = false;
    }

    persist();

    res.json({
      success: true,
      registered: isRegistered,
      event,
      message: isRegistered ? 'Successfully registered for event!' : 'Unregistered from event.'
    });
  });

  // --- PROJECTS API ---
  app.get('/api/projects', (_req, res) => {
    res.json({ success: true, projects: db.projects });
  });

  app.post('/api/projects', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Please login to submit projects.' });
    }

    const userId = authHeader.replace('Bearer iet_token_', '').trim();
    const user = db.users.find(u => u.id === userId);

    const { title, tagline, description, domain, teamMembers, githubUrl, demoUrl, tags, imageUrl } = req.body;

    if (!title || !description || !githubUrl) {
      return res.status(400).json({ success: false, message: 'Title, description and GitHub repository URL are required.' });
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title,
      tagline: tagline || title,
      description,
      domain: domain || 'Web Development',
      authorId: userId,
      authorName: user ? user.username : 'IET Member',
      authorInstitution: user ? user.institution : 'IET Chapter',
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [user ? user.username : 'Author'],
      githubUrl,
      demoUrl,
      likes: 1,
      likedByUserIds: [userId],
      tags: Array.isArray(tags) ? tags : ['IET', domain || 'Tech'],
      createdAt: new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
    };

    db.projects.unshift(newProject);
    persist();

    res.status(201).json({ success: true, project: newProject, message: 'Project submitted successfully!' });
  });

  // Toggle Project Like
  app.post('/api/projects/:id/like', (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Please login to appreciate projects.' });
    }

    const userId = authHeader.replace('Bearer iet_token_', '').trim();
    const project = db.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const likedIndex = project.likedByUserIds.indexOf(userId);
    let liked = false;

    if (likedIndex === -1) {
      project.likedByUserIds.push(userId);
      project.likes += 1;
      liked = true;
    } else {
      project.likedByUserIds.splice(likedIndex, 1);
      project.likes = Math.max(0, project.likes - 1);
      liked = false;
    }

    persist();

    res.json({ success: true, liked, likesCount: project.likes, project });
  });

  // --- ANNOUNCEMENTS API ---
  app.get('/api/announcements', (_req, res) => {
    res.json({ success: true, announcements: db.announcements });
  });

  // --- OPPORTUNITIES API ---
  app.get('/api/opportunities', (_req, res) => {
    res.json({ success: true, opportunities: db.opportunities || [] });
  });

  app.post('/api/opportunities', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Please login to post opportunities.' });
    }

    const { title, companyOrOrg, type, location, stipendOrSalary, deadline, description, applyUrl, requirements, tags, logoUrl, bannerUrl, status, timeline } = req.body;

    if (!title || !companyOrOrg || !description || !applyUrl) {
      return res.status(400).json({ success: false, message: 'Title, Organization, Description, and Apply URL are required.' });
    }

    const newOpportunity: Opportunity = {
      id: `opp_${Date.now()}`,
      title,
      companyOrOrg,
      type: type || 'Internship',
      location: location || 'Remote',
      stipendOrSalary: stipendOrSalary || 'Stipend / Competitive',
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      description,
      applyUrl,
      requirements: Array.isArray(requirements) ? requirements : ['Active student / chapter member'],
      tags: Array.isArray(tags) ? tags : ['IET', 'Opportunity'],
      postedDate: new Date().toISOString().split('T')[0],
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      status: status || 'Open',
      timeline: timeline || 'present'
    };

    if (!db.opportunities) db.opportunities = [];
    db.opportunities.unshift(newOpportunity);
    persist();

    res.status(201).json({ success: true, opportunity: newOpportunity, message: 'Opportunity posted successfully!' });
  });

  // --- RESOURCES API ---
  app.get('/api/resources', (_req, res) => {
    res.json({ success: true, resources: db.resources || [] });
  });

  app.post('/api/resources', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Please login to share learning resources.' });
    }

    const { title, description, category, type, authorOrProvider, url, thumbnailUrl, tags, level, featured, timeline } = req.body;

    if (!title || !description || !url) {
      return res.status(400).json({ success: false, message: 'Title, description and resource URL are required.' });
    }

    const newResource: Resource = {
      id: `res_${Date.now()}`,
      title,
      description,
      category: category || 'Engineering & Tech',
      type: type || 'E-Book',
      authorOrProvider: authorOrProvider || 'IET Community',
      url,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80',
      tags: Array.isArray(tags) ? tags : ['Engineering', 'IET'],
      level: level || 'All Levels',
      featured: Boolean(featured),
      timeline: timeline || 'present',
      publishedYear: String(new Date().getFullYear())
    };

    if (!db.resources) db.resources = [];
    db.resources.unshift(newResource);
    persist();

    res.status(201).json({ success: true, resource: newResource, message: 'Resource shared with community!' });
  });

  // Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled Server Exception:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  });

  // Vite middleware / static files setup
  async function setupViteAndListen() {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
 
    if (!process.env.VERCEL) {
      app.listen(PORT, '127.0.0.1', () => {
        console.log(`IET CONNECT Full-Stack Server running on http://localhost:${PORT}`);
      });
    }
  }
 
  setupViteAndListen().catch(console.error);
