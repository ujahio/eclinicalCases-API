import { Dispatch, SetStateAction } from "react";

export type ValidationErrorProps = {
	explanation: {
		status: "error" | "valid";
		validationMessage?: string;
	};
};
/**
 * Validates the editor content for the case explanation.
 * Ensures the character count does not exceed the maximum allowed value.
 *
 * @param setError - Function to update the validation error state.
 * @param content - The HTML string of the case explanation.
 * @param minChars - Minimum allowed character count.
 * @param maxChars - Maximum allowed character count.
 * @returns boolean - True if the validation passes, false otherwise.
 */
export const validateEditorInputs = (
	setError: Dispatch<SetStateAction<ValidationErrorProps>>,
	content: string | undefined,
	minChars = 150,
	maxChars = 700
): boolean => {
	const plainText = content ? content.replace(/<[^>]*>/g, "").trim() : "";
	const charCount = plainText.length;

	if (charCount < minChars) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: `Contents cannot be less than ${minChars} characters!`,
			},
		}));
		return false;
	} else if (charCount > maxChars) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: `Contents cannot be more than ${maxChars} characters!`,
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
