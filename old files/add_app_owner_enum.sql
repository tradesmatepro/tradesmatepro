-- Add APP_OWNER to the user_role_enum if it doesn't exist
ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'APP_OWNER';
