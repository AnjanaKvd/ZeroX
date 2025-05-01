import React, { useEffect, useState } from "react";
import starGrey from "../assets/images/reviews/star_grey.png";
import starGold from "../assets/images/reviews/star_gold.png";

const ReviewItem = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `/api/reviews/product/${productId}?page=0&size=10`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reviews.");
        }

        const data = await response.json();
        setReviews(data.content);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false); 
      }
    };

    fetchReviews();
  }, [productId]);

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      {loading ? (
        <p className="text-center text-gray-400">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        reviews.map((review) => (
          <div
            key={review.reviewId || review._id}
            className="bg-slate-50 p-4 rounded shadow-md border  border-gray-200"
          >
            <div className="flex justify-between text-sm text-gray-600 font-semibold mb-1">
              <span>{review.userName}</span>
              <span>
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

            <p className="text-gray-800">{review.comment}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No reviews available.</p>
      )}
    </div>
  );
};

export default ReviewItem;



// import starGrey from "../assets/images/reviews/star_grey.png";
// import starGold from "../assets/images/reviews/star_gold.png";

// const ReviewItem = ({ review }) => {
//   return (
//     <div className="p-4 border-b border-gray-200 last:border-b-0">
//       <div className="flex items-center mb-2">
//         <div className="flex gap-1 mr-3">
//           {[1, 2, 3, 4, 5].map((num) => (
//             <img
//               key={num}
//               src={num <= review.rating ? starGold : starGrey}
//               alt="Star"
//               className="w-4 h-4"
//             />
//           ))}
//         </div>
//         <h4 className="font-medium text-gray-900">{review.userName}</h4>
//         <span className="mx-2 text-gray-400">•</span>
//         <span className="text-sm text-gray-500">
//           {new Date(review.createdAt).toLocaleDateString()}
//         </span>
//       </div>
//       <p className="text-gray-700">{review.comment}</p>
//     </div>
//   );
// };

// export default ReviewItem;
