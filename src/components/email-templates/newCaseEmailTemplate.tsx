import React from "react";
import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "jsx-email";
import applicationContext from "../../../appContext/applicationContext";

/************************************************************************** */
// NOTES
// 1. JSX requires images to be hosted to use in production. Add this code snippet
// when images are hosted for production use.
//		<Img
//					src={"../../images/logo.png"}
//					alt="Company Logo"
//					style={logo}
//					width={300}
//					height={100}
//				/>
/****************************************************************************/

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	marginBottom: "64px",
	padding: "20px",
	borderRadius: "8px",
	boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
};

// const logo = {
// 	display: "block",
// 	margin: "0 auto",
// 	maxWidth: "150px",
// };

const box = {
	padding: "20px",
	textAlign: "center" as const,
};

const paragraph = {
	color: "#555",
	fontSize: "16px",
	lineHeight: "24px",
	textAlign: "left" as const,
	marginBottom: "16px",
};

const button = {
	backgroundColor: "#32deb5",
	borderRadius: "5px",
	color: "#fff",
	display: "inline-block",
	fontSize: "16px",
	fontWeight: "bold",
	textAlign: "center" as const,
	textDecoration: "none",
	padding: "12px 24px",
	marginTop: "16px",
};

const footer = {
	color: "#777",
	fontSize: "12px",
	textAlign: "center" as const,
	marginTop: "32px",
};

export const NewCaseEmailTemplate = (studentName: string) => {
	return (
		<Html>
			<Head />
			<Preview>New Case Published! Log in to view and participate.</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={box}>
						<Text style={paragraph}>Dear {studentName},</Text>
						<Text style={paragraph}>
							We are excited to announce that a new case study has been
							published on your dashboard. Log in now to explore the case, share
							your responses, and leave a feedback.
						</Text>
						<Button
							style={button}
							href={applicationContext.getLoginAddress()}
							width={460}
							height={20}
						>
							Log in to View the Case
						</Button>
					</Section>
					<Text style={footer}>
						© {new Date().getFullYear()} e-Clinical Cases Solutions. All rights
						reserved.
					</Text>
				</Container>
			</Body>
		</Html>
	);
};
