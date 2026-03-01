import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Rating({ ratedUserId }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [userRating, setUserRating] = useState(0);

  // 1️⃣ Load current user once
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data?.user ?? null);
    };
    loadUser();
  }, []);

  // 2️⃣ Fetch ratings when profile changes
  useEffect(() => {
    if (!ratedUserId) return;

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("user_ratings")
        .select("rating, rater_id")
        .eq("rated_user_id", ratedUserId);

      if (error) {
        console.error("Error fetching ratings:", error);
        return;
      }

      if (data && data.length > 0) {
        const avg =
          data.reduce((sum, r) => sum + r.rating, 0) / data.length;

        setAverage(avg.toFixed(1));
        setCount(data.length);

        if (currentUser) {
          const myRating = data.find(
            (r) => r.rater_id === currentUser.id
          );
          setUserRating(myRating ? myRating.rating : 0);
        }
      } else {
        setAverage(0);
        setCount(0);
        setUserRating(0);
      }
    };

    fetchRatings();
  }, [ratedUserId, currentUser]);

  // 3️⃣ Handle rating click
  const handleRate = async (stars) => {
  if (!currentUser) {
    alert("Please log in to rate neighbors!");
    return;
  }

  if (currentUser.id === ratedUserId) {
    alert("You cannot rate yourself!");
    return;
  }

  const isFirstRating = userRating === 0;

  // Calculate new average optimistically
  let newTotalStars = average * count;

  if (isFirstRating) {
    newTotalStars += stars;
    setCount(count + 1);
  } else {
    newTotalStars = newTotalStars - userRating + stars;
  }

  const newAverage = newTotalStars / (isFirstRating ? count + 1 : count);

  setUserRating(stars);
  setAverage(newAverage.toFixed(1));

  const { error } = await supabase.from("user_ratings").upsert(
    {
      rater_id: currentUser.id,
      rated_user_id: ratedUserId,
      rating: stars,
    },
    { onConflict: "rater_id,rated_user_id" }
  );

  if (error) {
    console.error(error);
    alert("Failed to save rating.");
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.stats}>
        <span style={styles.avgText}>⭐ {average}</span>
        <span style={styles.countText}>({count} reviews)</span>
      </div>

      {currentUser && currentUser.id !== ratedUserId && (
        <div style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              style={{
                ...styles.starButton,
                color: star <= userRating ? "#FFD700" : "#CCC",
              }}
            >
              ★
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: "10px",
    textAlign: "center",
  },
  stats: {
    marginBottom: "6px",
  },
  avgText: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  countText: {
    marginLeft: "6px",
    color: "#666",
    fontSize: "14px",
  },
  starRow: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
  },
  starButton: {
    background: "none",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
  },
};