import { FC } from "react";
import Modal, { ModalProps } from "./Modal";
import { Button } from "./Button";

const CmeModal: FC<ModalProps> = ({ show, toggle }) => (
	<Modal {...{ show, toggle, size: "md" }}>
		<div className="py-10">
			<p className="text-center text-dark text-lg font-medium tracking-wide mb-4">
				Congratulations, you got your entire CME questions
			</p>
			<p className="text-center text-grey-300 text-md mb-12">
				To view your Certificate, kindly click the button below
			</p>
			<Button size="lg" block centralize>
				VIEW MY CERTIFICATE
			</Button>
		</div>
	</Modal>
);

export default CmeModal;
