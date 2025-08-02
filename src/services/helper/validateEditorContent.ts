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
 * @param content - The serialized JSON string of the case explanation.
 * @returns boolean - True if the validation passes, false otherwise.
 */
export const validateEditorContent = (
	setError: Dispatch<SetStateAction<ValidationErrorProps>>,
	content?: string,
	minWordCount = 150,
	maxWordCount = 700
): boolean => {
	if (!content) return true;

	// Count words
	const wordCount = content
		.split(/\s+/)
		.filter((word) => word.length > 0).length;

	if (wordCount < minWordCount) {
		setError({
			explanation: {
				status: "error",
				validationMessage: `Comments must be at least 150 words (currently ${wordCount}).`,
			},
		});
		return false;
	} else if (wordCount > maxWordCount) {
		setError({
			explanation: {
				status: "error",
				validationMessage: `Comments cannot exceed 700 words (currently ${wordCount}).`,
			},
		});
		return false;
	} else {
		setError({
			explanation: {
				status: "valid",
				validationMessage: "",
			},
		});
		return true;
	}
};
