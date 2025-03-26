import { useState } from "react";
import starGrey from "../assets/images/star_grey.png";
import starGold from "../assets/images/star_gold.png";

const ReviewForm = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    const reviewData = { product_id: productId, rating, comment };

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    if (response.ok) {
      alert("Review submitted successfully!");
      setComment(""); // Clear comment after submission
      setRating(0); // Reset rating
    } else {
      alert("Failed to submit review");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-lg rounded-lg">
      <label className="block font-semibold">Rating:</label>
      <div className="flex gap-2 my-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <img
            key={num}
            src={num <= rating ? starGold : starGrey}
            alt={`Star ${num}`}
            className="w-8 h-8 cursor-pointer"
            onClick={() => handleStarClick(num)}
          />
        ))}
      </div>

      <label className="block font-semibold mt-2">Comment:</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Write your review..."
      ></textarea>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 mt-3 rounded"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;
