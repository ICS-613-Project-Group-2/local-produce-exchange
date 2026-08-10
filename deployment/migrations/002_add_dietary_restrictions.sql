-- Migration: Add dietary_restrictions column and category/dietary CHECK constraints
-- PR: #58 - Add dietary restriction tags to listings
-- Run against any existing database that was created before this feature.

-- 1. Add the dietary_restrictions array column with an empty-array default
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS dietary_restrictions varchar[] DEFAULT '{}';

-- 2. Narrow the category column type from text to varchar(50)
ALTER TABLE listings
  ALTER COLUMN category TYPE varchar(50);

-- 3. Add CHECK constraint for allowed category values (NULL is acceptable)
ALTER TABLE listings
  ADD CONSTRAINT listings_category_check
  CHECK (category IN ('fruits', 'vegetables', 'dairy', 'grains', 'meat', 'seafood', 'baked_goods', 'other') OR category IS NULL);

-- 4. Add CHECK constraint ensuring dietary_restrictions only contains allowed values
ALTER TABLE listings
  ADD CONSTRAINT listings_dietary_restrictions_check
  CHECK (dietary_restrictions <@ ARRAY['vegan', 'vegetarian', 'gluten_free', 'nut_free', 'halal', 'kosher', 'other']::varchar[]);
