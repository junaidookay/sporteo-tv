# 🎬 Prime Fight - START HERE

Welcome to Prime Fight! This is a complete, production-ready PPV combat sports streaming platform.

## ⚡ Quick Start (5 minutes)

👉 **Read this first:** [`QUICK_SETUP.md`](./QUICK_SETUP.md)

It walks you through:
1. Installing dependencies
2. Setting up credentials (Supabase, Stripe)
3. Creating the database
4. Adding sample data
5. Starting the dev server

**That's it!** You'll have a fully functional app running.

## 📚 Documentation Map

Choose based on what you need:

### 🚀 Getting Started
- **[QUICK_SETUP.md](./QUICK_SETUP.md)** - 5-minute setup (START HERE!)
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed step-by-step instructions
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Overview of what's built

### 📖 Full Documentation  
- **[README.md](./README.md)** - Complete project documentation
- **[FEATURES.md](./FEATURES.md)** - Complete feature checklist
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Technical architecture guide

### 🌍 Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to production
- **.env.example** - Environment variables reference

### 🛠️ Development
- **scripts/setup-all.sql** - Database schema
- **scripts/populate-demo-data.js** - Add sample events
- **scripts/seed-data.sql** - Alternative sample data

---

## 🎯 What You Need to Know

### This App Includes:
✅ Fully functional homepage with featured events  
✅ Event browsing and detailed pages  
✅ User authentication (signup/login)  
✅ Payment processing (Stripe integration)  
✅ Subscription management  
✅ Admin dashboard  
✅ Video player ready for streaming  
✅ Light/Dark theme switcher  
✅ Responsive design (mobile/tablet/desktop)  
✅ Database with security (Row Level Security)  
✅ Sample data (12 events included)  

### What You Need:
- Node.js 18+
- Supabase account (free tier works)
- Stripe account (free tier works, test mode included)

### Setup Time:
⏱️ **5 minutes** with QUICK_SETUP.md
⏱️ **15 minutes** with SETUP_GUIDE.md (if you want more details)

---

## 🚦 Choose Your Path

### Path 1: I Want to Get Running NOW
1. Open [`QUICK_SETUP.md`](./QUICK_SETUP.md)
2. Follow the 5 steps
3. Open http://localhost:3000
4. Done! 🎉

### Path 2: I Want to Understand Everything
1. Read [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md) (overview)
2. Read [`README.md`](./README.md) (complete docs)
3. Read [`FEATURES.md`](./FEATURES.md) (what's included)
4. Follow [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) (detailed setup)
5. Check [`DEPLOYMENT.md`](./DEPLOYMENT.md) (for production)

### Path 3: I'm a Developer Who Knows What They're Doing
1. Copy `.env.example` → `.env.local`
2. Add your Supabase/Stripe credentials
3. Run `scripts/setup-all.sql` in Supabase
4. Run `node scripts/populate-demo-data.js`
5. Run `npm install && npm run dev`
6. Done! 🚀

---

## 🎨 What You'll See

### Homepage
- Featured event banner with large image
- Secondary featured events
- Boxing events section
- MMA events section
- K-1 Kickboxing section
- Subscription plans with pricing
- "Why Choose Us" benefits
- Full footer with links
- Sun/Moon icon in navbar for theme toggle

### Features Working
✅ Click events to see details  
✅ Toggle light/dark theme  
✅ Sign up for an account  
✅ Test subscription checkout  
✅ View admin dashboard  

---

## 🔑 Key Credentials You'll Need

### Supabase (Database & Auth)
- Go to: https://supabase.com
- Create account → New project
- Get from Settings → API:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Stripe (Payments)
- Go to: https://stripe.com
- Create account → Dashboard → Developers → API Keys
- Get:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`

---

## 💳 Test Payment Information

For testing Stripe payments (won't actually charge):
- **Card Number:** 4242 4242 4242 4242
- **Expiry:** 12/25 (any future date)
- **CVC:** 123 (any 3 digits)

---

## 🐛 Troubleshooting

### "I'm getting errors after setup"
→ See **QUICK_SETUP.md** "Troubleshooting" section

### "Events aren't showing"
→ Run: `node scripts/populate-demo-data.js`

### "I don't know what to do"
→ Open **SETUP_GUIDE.md** for step-by-step help

### "Something broke"
→ Check **DOCUMENTATION.md** for architecture help

---

## 📁 Project Structure

```
primefight/
├── app/                    ← Main app pages
├── components/             ← Reusable components
├── lib/                    ← Database, Stripe, etc.
├── scripts/                ← Database setup
├── public/                 ← Images & assets
├── QUICK_SETUP.md         ← 5-min setup ⭐
├── SETUP_GUIDE.md         ← Detailed guide
├── README.md              ← Full docs
├── FEATURES.md            ← Feature list
├── DEPLOYMENT.md          ← Production setup
└── .env.example           ← Variables template
```

---

## 🎬 Let's Go!

### First Time? 
👉 **Read: [`QUICK_SETUP.md`](./QUICK_SETUP.md)**

### Want Details?
👉 **Read: [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)**

### Ready for Production?
👉 **Read: [`DEPLOYMENT.md`](./DEPLOYMENT.md)**

### Want to Understand Everything?
👉 **Read: [`README.md`](./README.md)**

---

## ✨ Pro Tips

1. **Use Stripe test mode** while developing (free, no charges)
2. **Check Supabase SQL Editor** if you want to see your data
3. **Click the theme icon** (sun/moon) to test light/dark mode
4. **Try all pages** - homepage, events, profile, checkout, admin
5. **Use sample events** included in the database

---

## 🚀 After Setup

1. **Explore the app** - see what's included
2. **Customize** - change colors, text, images
3. **Add real events** - replace sample data
4. **Set up Bunny.net** - for actual video streaming
5. **Deploy to Vercel** - make it live

---

## 📞 Need Help?

1. **Quick questions?** → Check `QUICK_SETUP.md`
2. **Setup problems?** → Check `SETUP_GUIDE.md` Troubleshooting
3. **Understanding architecture?** → Read `DOCUMENTATION.md`
4. **Ready to deploy?** → Read `DEPLOYMENT.md`
5. **Want feature list?** → See `FEATURES.md`

---

## 🎉 Final Checklist

Before you start:
- [ ] You have Node.js 18+ installed
- [ ] You've created a Supabase account
- [ ] You've created a Stripe account
- [ ] You have your credentials ready
- [ ] You've read QUICK_SETUP.md

Ready? Let's build! 🚀

---

**Next Step:** Open [`QUICK_SETUP.md`](./QUICK_SETUP.md) →
