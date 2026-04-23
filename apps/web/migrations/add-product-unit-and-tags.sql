-- Add unit of measure column to product listings
ALTER TABLE product_listings ADD COLUMN IF NOT EXISTS unit TEXT;

-- Create junction table for product listing tags (categories)
CREATE TABLE IF NOT EXISTS product_listing_tags (
  id SERIAL PRIMARY KEY,
  product_listing INTEGER NOT NULL REFERENCES product_listings(id) ON DELETE CASCADE,
  tag INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
);

-- Prevent duplicate tag assignments per product listing
CREATE UNIQUE INDEX IF NOT EXISTS product_listing_tags_unique
  ON product_listing_tags(product_listing, tag);
