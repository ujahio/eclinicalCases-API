import { Button } from "@/components/ui/button";

const ProgressButtons = ({
	goNext,
	goBack,
}: {
	goNext: () => void;
	goBack: () => void;
}) => {
	return (
		<div className="create-case-actions grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
			<Button
				variant="secondary"
				size="md"
				className="flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
				centralize
				onClick={goBack}
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M15 18l-6-6 6-6"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<span>GO BACK</span>
			</Button>
			<Button
				variant="basic"
				size="md"
				className="flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
				centralize
				onClick={goNext}
			>
				<span>PROCEED</span>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M9 6l6 6-6 6"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</Button>
		</div>
	);
};

export default ProgressButtons;
