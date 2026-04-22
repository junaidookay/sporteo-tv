-- Find and delete duplicate events (keeps the newest)
DELETE FROM events 
WHERE id IN (
  SELECT id FROM events 
  GROUP BY id 
  HAVING COUNT(*) > 1
)
AND created_at NOT IN (
  SELECT MAX(created_at) FROM events GROUP BY id
);