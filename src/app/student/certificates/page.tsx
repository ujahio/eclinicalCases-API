"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	getStudentsCertificates,
	resetStudentsCertificatesStatus,
} from "@/store/slices/case/getStudentsCertificatesSlice";

const CertificatesComp = dynamic(
	() => import("@/presentation/student/Certificates"),
	{
		ssr: false,
	}
);

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
		<CertificatesComp studentsCertificatesInfo={studentsCertificatesInfo} />
	);
};

export default Certificates;
