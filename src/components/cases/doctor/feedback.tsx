import React from "react";
const feedbackRatings = ["Very Bad", "Bad", "Average", "Good", "Very Good"];
const FeedbackModal = ({ feedback }: any) => {
  return (
    <div className="pb-24">
      <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5 mt-10">FEEDBACKS</h6>

      {feedback?.feedback?.map((item: any, index: any) => {
        // Check if response is a number between 0 and 4
        const isRating = !isNaN(item.response) && item.response >= 0 && item.response <= 4;
        const displayResponse = isRating ? feedbackRatings[Number(item.response)] : item.response;

        return (
          <div key={index}>
            <h5 className="mt-4 text-dark">
              {index + 1}. &nbsp;&nbsp; {item.question}
            </h5>
            <p className="text-grey-300 text-sm ml-6.25 mt-1">{displayResponse}</p>
          </div>
        );
      })}
    </div>
  );
};

export default FeedbackModal;
