CREATE OR REPLACE FUNCTION decrement_user_credits(user_id_param UUID, amount INT)
RETURNS INTEGER AS $$
DECLARE
  new_credits INTEGER;
BEGIN
  UPDATE user_credits
  SET credits = credits - amount, updated_at = NOW()
  WHERE user_id = user_id_param AND credits >= amount
  RETURNING credits INTO new_credits;
  
  RETURN new_credits;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_user_credits(user_id_param UUID, amount INT)
RETURNS INTEGER AS $$
DECLARE
  new_credits INTEGER;
BEGIN
  INSERT INTO user_credits (user_id, credits, updated_at)
  VALUES (user_id_param, amount, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET credits = user_credits.credits + EXCLUDED.credits,
      updated_at = EXCLUDED.updated_at
  RETURNING credits INTO new_credits;
  
  RETURN new_credits;
END;
$$ LANGUAGE plpgsql;