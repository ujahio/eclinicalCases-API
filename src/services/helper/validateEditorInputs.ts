import { Dispatch, SetStateAction } from "react";

export type ValidationErrorProps = {
	explanation: {
		status: "error" | "valid";
		validationMessage?: string;
	};
};
/**
 * Validates the editor content for the case explanation.
 * Ensures the word count does not exceed the maximum allowed value.
 *
 * @param setError - Function to update the validation error state.
 * @param content - The HTML string of the case explanation.
 * @param minWordCount - Minimum allowed word count.
 * @param maxWordCount - Maximum allowed word count.
 * @returns boolean - True if the validation passes, false otherwise.
 */
export const validateEditorInputs = (
	setError: Dispatch<SetStateAction<ValidationErrorProps>>,
	content: string | undefined,
	minWordCount = 150,
	maxWordCount = 700
): boolean => {
	const plainText = content ? content.replace(/<[^>]*>/g, "").trim() : "";
	const wordCount = plainText
		.split(/\s+/)
		.filter((word: string) => word.length > 0).length;

	if (wordCount < minWordCount) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: `Contents cannot be less than ${minWordCount} words!`,
			},
		}));
		return false;
	} else if (wordCount > maxWordCount) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: `Contents cannot be more than ${maxWordCount} words!`,
			},
		}));
		return false;
	} else {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "valid",
				validationMessage: "",
			},
		}));
		return true;
	}
};
