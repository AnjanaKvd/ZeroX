import React, { useEffect, useState } from "react";
import starGrey from "../assets/images/reviews/star_grey.png";
import starGold from "../assets/images/reviews/star_gold.png";

const ReviewItem = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) {
        setError("Missing product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `/api/reviews/product/${productId}?page=0&size=10`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`);
        }

        const data = await response.json();


        if (data.content) {
          const sorted = [...data.content].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setReviews(sorted);
        } else if (Array.isArray(data)) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setReviews(sorted);
        } else {
          setReviews([]);
        }
      } catch (err) {
        setError("Failed to load reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500 text-center">{error}</div>}

      {loading ? (
        <p className="text-center text-gray-400">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        reviews.map((review) => (
          <div
            key={review.reviewId || review._id || `review-${Math.random()}`}
            className="bg-slate-50 p-4 rounded shadow-md border border-gray-200"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-serif text-base text-gray-700">
                {review.userName || "Anonymous User"}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <img
                  key={num}
                  src={num <= review.rating ? starGold : starGrey}
                  alt="star"
                  className="w-5 h-5"
                />
              ))}
            </div>
            <hr />

            <p className="text-gray-700">
              {review.comment || "No comment provided."}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">
          No reviews available for this product yet. Be the first to review!
        </p>
      )}
    </div>
  );
};

export default ReviewItem;
