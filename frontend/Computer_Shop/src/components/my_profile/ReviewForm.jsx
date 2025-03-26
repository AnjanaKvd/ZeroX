import { useState } from "react";

const ReviewForm = ({ productId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reviewData = { product_id: productId, rating, comment };

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    if (response.ok) {
      alert("Review submitted successfully!");
      setComment(""); // Clear comment after submission
    } else {
      alert("Failed to submit review");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-lg rounded-lg">
      <label className="block font-semibold">Rating:</label>
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="w-full p-2 border rounded"
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>
            {num} Star
          </option>
        ))}
      </select>

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
