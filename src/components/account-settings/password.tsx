import { useEffect, useState } from "react";
import { PasswordField } from "../form-elements";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	changePassword,
	resetChangePasswordStatus,
} from "@/store/slices/auth/changePasswordSlice";
import SpinnerGrow from "../spinners/SpinnerGrow";
import { saltAndHashPassword } from "@/utils/password";

const PasswordSettings = () => {
	const dispatch = useAppDispatch();
	const changePasswordRed = useAppSelector((state) => state.changePassword);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmNewPassword: "",
	});
	const handleChange = (e: any, name: string) => {
		e.preventDefault();

		const { value } = e.target;
		setPasswordData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();

		// Hash the passwords
		const hashedCurrentPassword = saltAndHashPassword(
			passwordData.currentPassword,
		);
		const hashedNewPassword = saltAndHashPassword(passwordData.newPassword);
		const hashedConfirmNewPassword = saltAndHashPassword(
			passwordData.confirmNewPassword,
		);

		// Update password data with hashed passwords
		const hashedPasswordData = {
			currentPassword: hashedCurrentPassword,
			newPassword: hashedNewPassword,
			confirmNewPassword: hashedConfirmNewPassword,
		};

		// Dispatch action with hashed passwords
		dispatch(changePassword(hashedPasswordData));
	};

	useEffect(() => {
		if (changePasswordRed.status === "succeeded") {
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmNewPassword: "",
			});
			dispatch(resetChangePasswordStatus());
		}
	}, [changePasswordRed, dispatch]);

	return (
		<form onSubmit={handleSubmit}>
			<PasswordField
				label="Current Password"
				name="currentPassword"
				placeholder="Enter Password"
				value={passwordData.currentPassword}
				onChange={(e) => {
					handleChange(e, "currentPassword");
				}}
			/>
			<PasswordField
				label="Choose New Password"
				name="newPassword"
				placeholder="Enter Password"
				value={passwordData.newPassword}
				onChange={(e) => {
					handleChange(e, "newPassword");
				}}
			/>
			<PasswordField
				label="Confirm New Password"
				name="confirmNewPassword"
				placeholder="Enter Password"
				value={passwordData.confirmNewPassword}
				onChange={(e) => {
					handleChange(e, "confirmNewPassword");
				}}
			/>
			<div className="mt-8">
				<Button block type="submit">
					{changePasswordRed.status === "loading" ? (
						<div className="flex justify-center items-center gap-1">
							<SpinnerGrow />
							Loading...
						</div>
					) : (
						"Save Changes"
					)}

					<svg width="12" viewBox="0 0 18.352 14">
						<path
							d="M12.659,22.217,8.307,17.865,6.83,19.341l5.829,5.829L25.182,12.647,23.705,11.17Z"
							transform="translate(-6.83 -11.17)"
							fill="#fff"
						/>
					</svg>
				</Button>
			</div>
		</form>
	);
};

export default PasswordSettings;
