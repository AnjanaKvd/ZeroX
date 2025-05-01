import { useState } from "react";
import starGrey from "../assets/images/reviews/star_grey.png";
import starGold from "../assets/images/reviews/star_gold.png";

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to submit a review");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onReviewSubmit(data);
        setRating(0);
        setComment("");
      } else {
        // Parse error response from the backend
        const errorData = await response.json();
        if (
          errorData.message &&
          errorData.message.includes("already reviewed")
        ) {
          setError("You have already reviewed this product.");
        } else {
          setError(errorData.message || "Failed to submit review");
        }
      }
    } catch (err) {
      // Catching fetch or network errors
      console.error("Submit Error:", err);
      // setError("An error occurred while submitting your review");
      setError("You have already reviewed this product !");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        Add your review for this product.
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select your rate value
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                onMouseEnter={() => setHoverRating(num)}
                onMouseLeave={() => setHoverRating(0)}
                className="relative w-10 h-10 transition-transform hover:scale-110"
              >
                <img
                  src={starGrey}
                  alt="Grey Star"
                  className="absolute w-full h-full"
                />
                {num <= (hoverRating || rating) && (
                  <img
                    src={starGold}
                    alt="Gold Star"
                    className="absolute w-full h-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <br />
        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Write a comment...
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your comment for this product..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          />
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;

