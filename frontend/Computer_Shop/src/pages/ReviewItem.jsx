import starGrey from "../assets/images/reviews/star_grey.png";
import starGold from "../assets/images/reviews/star_gold.png";

const ReviewItem = ({ review }) => {
  return (
    <div className="p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center mb-2">
        <div className="flex gap-1 mr-3">
          {[1, 2, 3, 4, 5].map((num) => (
            <img
              key={num}
              src={num <= review.rating ? starGold : starGrey}
              alt="Star"
              className="w-4 h-4"
            />
          ))}
        </div>
        <h4 className="font-medium text-gray-900">{review.userName}</h4>
        <span className="mx-2 text-gray-400">•</span>
        <span className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
};

export default ReviewItem;
