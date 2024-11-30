const convertToFormData = (data: any) => {
	const formData = new FormData();
	for (const key in data) {
		if (data.hasOwnProperty(key)) {
			formData.append(key, JSON.stringify(data[key]));
		}
	}
	return formData;
};
