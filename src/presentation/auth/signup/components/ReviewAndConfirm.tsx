import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";
import SpinnerGrow from "@/components/spinners/SpinnerGrow";

const ReviewAndConfirm = ({ personalDetailsInfo, handleSignUp }: any) => {
	const isLoading = useAppSelector((state) => state.signup.status);

	return (
		<div className="max-w-md mx-auto p-4 rounded">
			<div className="mb-4">
				<p className="flex items-center mb-2">
					<span className="w-32 font-bold">First Name:</span>
					<span>{personalDetailsInfo.personalDetails.firstName}</span>
				</p>
				<p className="flex items-center mb-2">
					<span className="w-32 font-bold">Last Name:</span>
					<span>{personalDetailsInfo.personalDetails.lastName}</span>
				</p>
				<p className="flex items-center mb-2">
					<span className="w-32 font-bold">Email:</span>
					<span>{personalDetailsInfo.personalDetails.email}</span>
				</p>
				<p className="flex items-center mb-2">
					<span className="w-32 font-bold">Profession:</span>
					<span>{personalDetailsInfo.professionalDetails.profession}</span>
				</p>
				<p className="flex items-center mb-2">
					<span className="w-32 font-bold">Expertise:</span>
					<span>{personalDetailsInfo.professionalDetails.expertise}</span>
				</p>
				<p className="flex items-center mb-2">
					<span className="w-32 font-bold">Professional Title:</span>
					<span>
						{personalDetailsInfo.professionalDetails.professionalTitle}
					</span>
				</p>
			</div>
			<Button
				block
				className="mt-5"
				onClick={() => handleSignUp(personalDetailsInfo)}
			>
				{isLoading === "loading" ? (
					<div className="flex justify-center items-center gap-1">
						<SpinnerGrow />
						Loading...
					</div>
				) : (
					"Sign up"
				)}
				<svg
					width="12"
					height="12"
					viewBox="0 0 16 16"
					className="transform transition-transform duration-200 ease-in-out group-hover:translate-x-1"
				>
					<path
						d="M3,10H15.173L9.587,4.413,11,3l8,8-8,8L9.587,17.587,15.173,12H3Z"
						transform="translate(-3 -3)"
						fill="currentColor"
					/>
				</svg>
			</Button>
		</div>
	);
};

export default ReviewAndConfirm;
