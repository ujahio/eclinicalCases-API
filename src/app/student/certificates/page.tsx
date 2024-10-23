"use client";

import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	getStudentsCertificates,
	resetStudentsCertificatesStatus,
} from "@/store/slices/case/getStudentsCertificatesSlice";
import CertificatesComp from "@/presentation/student/Certificates";

const Certificates = () => {
	const dispatch = useAppDispatch();
	const studentsCertificatesState = useAppSelector(
		(state) => state.studentsCertificates
	);
	const studentsCertificatesInfo = studentsCertificatesState.data;

	useEffect(() => {
		dispatch(getStudentsCertificates());
	}, [dispatch]);

	useEffect(() => {
		if (studentsCertificatesState.status === "failed") {
			dispatch(resetStudentsCertificatesStatus());

			toast.error("Failed to fetch certificates");
		}
	}, [studentsCertificatesState, dispatch]);

	return (
		<div>
			<CertificatesComp studentsCertificatesInfo={studentsCertificatesInfo} />
		</div>
	);
};

export default Certificates;
