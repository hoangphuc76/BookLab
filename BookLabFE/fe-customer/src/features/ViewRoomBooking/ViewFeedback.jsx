import { StarIcon } from "../../icons";
import StarRating from "./StarRating";

const ViewFeedback = ({ avatar, fullname, time, rating, feedbackDescription, lecturer }) => {
  avatar = avatar??lecturer?.accountDetail.avatar
  fullname = fullname??lecturer?.accountDetail.fullName
  return (
    <div className="flex">
      <div>
        <img
          className="w-12 h-12 rounded-full object-cover"
          src={avatar || "/placeholder.svg"}
          alt={`${fullname}'s avatar`}
        />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between">
          <div className="ml-2">
            <h1 className="text-sm font-semibold">{fullname}</h1>
            <span className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {time.replace("T", " ")}
            </span>
          </div>
           <StarRating rating={rating} />
        </div>
        <div>
          <span className="mt-3 block text-left ml-2 text-neutral-600 dark:text-neutral-300">
            {feedbackDescription}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ViewFeedback;
