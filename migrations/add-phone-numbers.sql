ALTER TABLE personal_information ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE swap_pools ADD COLUMN IF NOT EXISTS phone_number TEXT;
