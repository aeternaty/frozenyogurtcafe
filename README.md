# Get Yo Frozen Yogurt Cafe

Premium frozen yogurt cafe website with 14 delicious flavors, dairy-free options, and fresh toppings. Serving Marlboro and New Providence, New Jersey.

## Features

- **14 Flavors**: Dairy-free, no sugar added, non-fat, and low-fat options
- **Fresh Toppings**: Wide variety of fresh fruits, nuts, and sweet treats  
- **Two Locations**: Marlboro (Kosher Certified) and New Providence
- **Rewards Program**: Ounce&Bounce points-based loyalty program
- **Online Forms**: Contact Form and job applications
- **Mobile Responsive**: Optimized for all devices

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript with Tailwind CSS
- **Backend**: Supabase (Database & Edge Functions)
- **Deployment**: Vercel
- **Forms**: reCAPTCHA protected with Supabase integration
- **Analytics**: Google Analytics 4

## Local Development

### Prerequisites
- Node.js 18+
- Supabase CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/aeternaty/frozenyogurtcafe
cd web
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Start Supabase local development
```bash
npm run supabase:start
```

5. Serve the website locally
```bash
npm run dev
```

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run migrations:
```bash
supabase db push
```

3. Deploy edge functions:
```bash
npm run deploy
```

## Deployment to Vercel

### Method 1: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Method 2: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on git push

### Environment Variables (Vercel)
Add these in your Vercel dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `GA_TRACKING_ID`

## Project Structure

```
├── assets/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   └── images/        # Images and assets
├── components/        # HTML components
├── config/           # Configuration files
├── supabase/         # Supabase configuration
│   ├── functions/    # Edge functions
│   └── migrations/   # Database migrations
├── index.html        # Main page
└── vercel.json       # Vercel configuration
```

## Contact Information

**Marlboro Location**
- Address: 450 Union Hill Road, Morganville, NJ 07751
- Phone: (732) 617-6332
- Kosher Certified

**New Providence Location**  
- Address: 12 South Street, New Providence, NJ 07974
- Phone: (908) 219-4338

## License

All rights reserved - Get Yo Frozen Yogurt Cafe
