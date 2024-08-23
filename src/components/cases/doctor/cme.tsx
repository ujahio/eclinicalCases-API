import React from "react";

type CmeProps = {
  questions: Question[];
};

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
};

const Cme: React.FC<CmeProps> = ({ questions }) => {
  const isChecked = (correctAnswer: number, value: number) => {
    return correctAnswer === Number(value);
  };

  return (
    <ul className="flex flex-col space-y-5 sm:space-y-6 mt-5 mb-5 sm:mb-6">
      {questions.map(({ question, options, correctAnswer }, index) => (
        <li key={index}>
          <h5 className="text-dark text-sm sm:text-1sm font-medium mb-2.5">
            {index + 1}. &nbsp;&nbsp; {question}
          </h5>
          {options.map((option, optionIndex) => (
            <label
              htmlFor={`question-${index}-${optionIndex}`}
              className="no-outline w-full border border-grey-border bg-white p-2.5 mb-3 cursor-pointer block"
              key={optionIndex}
            >
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                className="hidden"
                id={`question-${index}-${optionIndex}`}
                checked={isChecked(correctAnswer, optionIndex)}
                disabled
              />
              <div className="text-grey-300 text-1xs sm:text-sm font-medium flex items-center cursor-pointer">
                <div
                  className={`h-4 w-4 rounded-full border inline-flex items-center justify-center transition-colors ${
                    isChecked(correctAnswer, optionIndex) ? "bg-dark" : "border-grey-400"
                  }`}
                >
                  <svg
                    width="8"
                    viewBox="0 0 18.006 12.373"
                    className={`text-white transition-opacity ${
                      isChecked(correctAnswer, optionIndex) ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <path
                      d="M-15890.717,19582.234l6.221,5.416,10.426-10.3"
                      transform="translate(15891.373 -19576.641)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <span className="inline-block ml-2.5">{option}</span>
              </div>
            </label>
          ))}
        </li>
      ))}
    </ul>
  );
};

export default Cme;
