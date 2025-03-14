export const formatDate = (timestamp: number | string) => {
	const date = new Date(timestamp);
	return date.toLocaleDateString();
};

export const formatDateToYYYYMMDD = (dateString: string) => {
	if (!dateString || isNaN(Date.parse(dateString))) {
		return "";
	}
	const date = new Date(dateString);

	if (date.toISOString() === dateString) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}
	return dateString;
};
