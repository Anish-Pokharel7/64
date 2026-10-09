/*
# Add icon column to categories

1. Modified Tables
- `categories`: added `icon` (text, nullable) — stores a lucide-react-native icon name for UI rendering (e.g. "Pizza", "Burger").
2. Security
- No policy changes. Existing public read policy covers the new column.
3. Notes
- Column is nullable so existing rows are unaffected.
- The app uses this field to render category icons in CategoryCard.
*/

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text;
