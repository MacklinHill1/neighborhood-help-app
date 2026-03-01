import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Rating({ ratedUserId }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data?.user ?? null);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!ratedUserId) return;

    const fetchRatings = async () => {
      const { data } = await supabase
        .from("user_ratings")
        .select("rating")
        .eq("rated_user_id", ratedUserId);

      if (data && data.length > 0) {
        const avg =
          data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverage(avg.toFixed(1));
        setCount(data.length);
      }
    };

    fetchRatings();
  }, [ratedUserId]);

  const handleRate = async (stars) => {
    if (!currentUser) return;

    await supabase.from("user_ratings").upsert({
      rater_id: currentUser.id,
      rated_user_id: ratedUserId,
      rating: stars,
    });
  };

  return (
    <div>
      <h3>⭐ {average} ({count} reviews)</h3>

      {currentUser && currentUser.id !== ratedUserId && (
        <div>
          {[1,2,3,4,5].map(star => (
            <button key={star} onClick={() => handleRate(star)}>
              ⭐
            </button>
          ))}
        </div>
      )}
    </div>
  );
}