ALTER TABLE categories
ADD COLUMN slug VARCHAR(255) NULL,
ADD COLUMN description TEXT NULL,
ADD COLUMN icon VARCHAR(255) NULL,
ADD COLUMN created_at TIMESTAMP NULL,
ADD COLUMN updated_at TIMESTAMP NULL;

-- Update existing categories to have default values
UPDATE categories 
SET 
    slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', '')),
    created_at = NOW(),
    updated_at = NOW();

-- After populating existing records, set columns to NOT NULL where needed
ALTER TABLE categories
MODIFY COLUMN slug VARCHAR(255) NOT NULL,
MODIFY COLUMN created_at TIMESTAMP NOT NULL,
MODIFY COLUMN updated_at TIMESTAMP NOT NULL;

-- Add unique constraint on slug
ALTER TABLE categories
ADD CONSTRAINT UK_categories_slug UNIQUE (slug); 