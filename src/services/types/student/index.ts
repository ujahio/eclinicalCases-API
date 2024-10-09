export interface CaseDetail {
	caseID: string;
	caseTopicAnswer: string;
	caseExplanation: string;
	answers: Answer[];
}

export interface Answer {
	question: string;
	options: string[];
	studentAnswer: number | null;
}

export interface StudentCaseStudyProps {
	caseDetails: CaseDetail;
	setCaseDetails: React.Dispatch<React.SetStateAction<CaseDetail>>;
	handleSubmitResponse: () => void;
	activeTab: number;
	switchTab: (tab: number) => void;
	tabs: string[];
	progress: number;
	isActive: (key: string) => boolean;
	goNext: () => void;
	goBack: () => void;
}
