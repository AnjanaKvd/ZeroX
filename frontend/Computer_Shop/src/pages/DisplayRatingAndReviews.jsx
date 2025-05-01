import { useState, useEffect } from "react";
import starGrey from "../assets/images/reviews/star_grey.png";
import starGold from "../assets/images/reviews/star_gold.png";

const DisplayRatingAndReviews = ({ productId, refresh, onViewAllReviews }) => {
  const [loading, setLoading] = useState(true);
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
        setTotalVotes(data.numberOfReviews || 0);
      } catch (error) {
        console.error("Error displaying average rating:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAverageRating();
  }, [productId, refresh]);

  if (loading)
    return <p className="text-center text-gray-400">Loading rating...</p>;

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

      {/* View All Reviews Button */}
      {onViewAllReviews && (
        <div className="text-center mt-4">
          <button
            onClick={onViewAllReviews}
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            View All Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default DisplayRatingAndReviews;

// import { useState, useEffect } from "react";
// import starGrey from "../assets/images/reviews/star_grey.png";
// import starGold from "../assets/images/reviews/star_gold.png";
// import ReviewList from "./ReviewItem";

// const DisplayRatingAndReviews = ({ productId, refresh }) => {
//   const [loading, setLoading] = useState(true);
//   const [averageRating, setAverageRating] = useState(0);
//   const [totalVotes, setTotalVotes] = useState(0);

//   const [showReviews, setShowReviews] = useState(false);
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     const fetchAverageRating = async () => {
//       try {
//         const response = await fetch(
//           `/api/reviews/product/${productId}/rating`
//         );
//         const data = await response.json();
//         setAverageRating(data.averageRating || 0);
//         // setTotalVotes(data.totalVotes || 0);
//         setTotalVotes(data.numberOfReviews || 0);
//       } catch (error) {
//         console.error("Error displaying average rating:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAverageRating();
//   }, [productId, refresh]);

//   if (loading)
//     return <p className="text-center text-gray-400">Loading rating...</p>;

//   const handleReviewsClick = async () => {
//     try {
//       const response = await fetch(
//         `/api/reviews/product/${productId}?page=0&size=10`
//       );
//       const data = await response.json();
//       console.log("Fetched Reviews:", data);
//       setReviews(data.reviews || []);
//       setShowReviews(true);
//     } catch (error) {
//       console.error("Error fetching reviews:", error);
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-md px-6 py-4 w-full max-w-sm mx-auto">
//       {/* Header: Rating + Votes */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="text-red-600 text-3xl font-bold">
//           {averageRating.toFixed(1)}{" "}
//           <span className="text-base font-normal text-gray-500">/ 5</span>
//         </div>
//         <div
//           onClick={handleReviewsClick}
//           className="text-right text-gray-800 font-semibold text-lg"
//         >
//           {totalVotes}{" "}
//           <span className="text-sm font-normal text-gray-500">Reviews</span>
//         </div>
//       </div>

//       {/* Star Display */}
//       <div className="flex gap-1 justify-center">
//         {[1, 2, 3, 4, 5].map((num) => {
//           const isFull = num <= Math.floor(averageRating);
//           const isHalf =
//             num === Math.ceil(averageRating) && averageRating % 1 !== 0;

//           return (
//             <div key={num} className="relative w-8 h-8">
//               <img
//                 src={starGrey}
//                 alt="grey-star"
//                 className="w-full h-full absolute"
//               />
//               {(isFull || isHalf) && (
//                 <img
//                   src={starGold}
//                   alt={isHalf ? "half-gold-star" : "gold-star"}
//                   className="w-full h-full absolute"
//                   style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : {}}
//                 />
//               )}
//             </div>
//           );
//         })}
//       </div>
//       {/* Modal for displayreview list */}
//       {showReviews && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white relative rounded-lg shadow-lg w-[90%] max-w-6xl h-[90vh] overflow-y-auto p-6">
//             <button
//               onClick={() => setShowReviews(false)}
//               className="absolute top-2 right-3 text-gray-600 hover:text-black text-2xl font-bold"
//             >
//               &times;
//             </button>
//             <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
//             <ReviewList reviews={reviews} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayRatingAndReviews;
