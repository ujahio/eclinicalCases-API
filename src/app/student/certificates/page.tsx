"use client";

import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	getStudentsCertificates,
	resetStudentsCertificatesStatus,
} from "@/store/slices/case/getStudentsCertificatesSlice";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import Certificates from "@/presentation/student/Certificates";

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	const dispatch = useAppDispatch();
	const studentsCertificatesState = useAppSelector(
		(state) => state.studentsCertificates
	);
	const studentsCertificatesInfo = studentsCertificatesState.data;

	useEffect(() => {
		dispatch(getStudentsCertificates());
	}, []);

	useEffect(() => {
		if (studentsCertificatesState.status === "failed") {
			dispatch(resetStudentsCertificatesStatus());

			toast.error("Failed to fetch certificates");
		}
	}, [studentsCertificatesState, dispatch]);

	return <Certificates studentsCertificatesInfo={studentsCertificatesInfo} />;
};

export default Page;
