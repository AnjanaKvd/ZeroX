import { useState, useEffect } from "react";
import starGrey from "../assets/images/reviews/star_grey.png";
import starGold from "../assets/images/reviews/star_gold.png";

const DisplayRatingAndReviews = ({ productId }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await fetch(
          `/api/reviews/product/${productId}/rating`
        );
        const data = await response.json();
        setAverageRating(data.averageRating || 0);
        setTotalVotes(data.totalVotes || 0);
      } catch (error) {
        console.error("Error displaying average rating:", error);
      }
    };

    fetchAverageRating();
  }, [productId]);

  return (
    <div className="bg-white rounded-2xl shadow-md px-6 py-4 w-full max-w-sm mx-auto">
      {/* Header: Rating + Votes */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-red-600 text-3xl font-bold">
          {averageRating.toFixed(1)}{" "}
          <span className="text-base font-normal text-gray-500">/ 5</span>
        </div>
        <div className="text-right text-gray-800 font-semibold text-lg">
          {totalVotes}{" "}
          <span className="text-sm font-normal text-gray-500">Reviews</span>
        </div>
      </div>

      {/* Star Display */}
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((num) => {
          const isFull = num <= Math.floor(averageRating);
          const isHalf =
            num === Math.ceil(averageRating) && averageRating % 1 !== 0;

          return (
            <div key={num} className="relative w-8 h-8">
              <img
                src={starGrey}
                alt="grey-star"
                className="w-full h-full absolute"
              />
              {(isFull || isHalf) && (
                <img
                  src={starGold}
                  alt={isHalf ? "half-gold-star" : "gold-star"}
                  className="w-full h-full absolute"
                  style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : {}}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisplayRatingAndReviews;
