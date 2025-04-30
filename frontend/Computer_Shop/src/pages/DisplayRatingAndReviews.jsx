import { useState, useEffect } from "react";
import starGrey from "../assets/images/star_grey.png";
import starGold from "../assets/images/star_gold.png";

const DisplayRatingAndReviews = ({ productId }) => {
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await fetch(
          `/api/reviews/product/${productId}/rating`
        );
        const data = await response.json();
        setAverageRating(data.averageRating || 0);
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    };

    fetchAverageRating();
  }, [productId]);

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <label className="block font-semibold">Ratings:</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => {
          const isFullStar = num <= Math.floor(averageRating);
          const isHalfStar =
            num === Math.ceil(averageRating) && averageRating % 1 !== 0;

          return (
            <div key={num} className="relative w-8 h-8">
              <img
                src={starGrey}
                alt="Grey Star"
                className="absolute w-full h-full"
              />
              {isFullStar && (
                <img
                  src={starGold}
                  alt="Gold Star"
                  className="absolute w-full h-full"
                />
              )}
              {isHalfStar && (
                <img
                  src={starGold}
                  alt="Half Gold Star"
                  className="absolute w-full h-full"
                  style={{ clipPath: "inset(0 50% 0 0)" }}
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
