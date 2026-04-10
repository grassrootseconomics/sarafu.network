ALTER TABLE personal_information ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE personal_information ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE personal_information ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE personal_information ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Mark existing users with names as already onboarded
UPDATE accounts SET onboarding_completed = TRUE
WHERE user_identifier IN (
  SELECT user_identifier FROM personal_information
  WHERE given_names IS NOT NULL AND given_names != ''
);
