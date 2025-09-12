-- Create contact_submissions table
CREATE TABLE contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Create job_applications table
CREATE TABLE job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_age INTEGER NOT NULL CHECK (applicant_age >= 16 AND applicant_age <= 99),
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    preferred_location VARCHAR(100) NOT NULL CHECK (preferred_location IN ('marlboro', 'new-providence', 'any')),
    position_type VARCHAR(50) NOT NULL CHECK (position_type IN ('full-time', 'part-time')),
    availability VARCHAR(50) NOT NULL CHECK (availability IN ('weekdays', 'weekends', 'both')),
    experience TEXT,
    why_join TEXT NOT NULL,
    terms_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewed', 'hired', 'rejected'))
);

-- Create newsletter_subscribers table
CREATE TABLE newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) DEFAULT 'unknown',
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_email ON job_applications(applicant_email);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role to do everything, restrict anon access)
CREATE POLICY "Allow service role all access on contact_submissions" ON contact_submissions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role all access on job_applications" ON job_applications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role all access on newsletter_subscribers" ON newsletter_subscribers
    FOR ALL USING (auth.role() = 'service_role');