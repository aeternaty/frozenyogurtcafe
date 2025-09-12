-- Seed data for Frozen Yogurt Cafe

-- Insert sample contact submissions for testing
INSERT INTO contact_submissions (name, email, subject, message, newsletter_subscribed, created_at, status) VALUES
('John Doe', 'john.doe@example.com', 'Question about flavors', 'Hi, I wanted to know if you have sugar-free options available?', true, NOW() - INTERVAL '2 days', 'pending'),
('Sarah Johnson', 'sarah.j@example.com', 'Birthday party inquiry', 'I would like to host a birthday party at your Marlboro location. Could you please provide more details?', false, NOW() - INTERVAL '1 day', 'pending');

-- Insert sample job applications for testing
INSERT INTO job_applications (
    applicant_name, 
    applicant_age, 
    applicant_email, 
    applicant_phone, 
    preferred_location, 
    position_type, 
    availability, 
    experience, 
    why_join, 
    terms_accepted, 
    created_at, 
    status
) VALUES
('Emma Wilson', 22, 'emma.wilson@example.com', '(555) 123-4567', 'marlboro', 'part-time', 'weekends', 'Previous experience working at a local ice cream shop for 2 summers.', 'I love working with people and creating great experiences for customers. Your focus on quality ingredients really appeals to me.', true, NOW() - INTERVAL '3 days', 'pending'),
('Michael Brown', 19, 'michael.brown@example.com', '(555) 987-6543', 'new-providence', 'part-time', 'both', 'No formal experience but very enthusiastic about customer service.', 'I am a student looking for part-time work and I really enjoy the friendly atmosphere at Get Yo. I would love to be part of your team.', true, NOW() - INTERVAL '1 day', 'pending');

-- Insert sample newsletter subscribers
INSERT INTO newsletter_subscribers (email, name, subscribed_at, source, is_active) VALUES
('subscriber1@example.com', 'Alice Cooper', NOW() - INTERVAL '10 days', 'website', true),
('subscriber2@example.com', 'Bob Smith', NOW() - INTERVAL '5 days', 'contact_form', true),
('subscriber3@example.com', 'Carol Davis', NOW() - INTERVAL '2 days', 'website', true);