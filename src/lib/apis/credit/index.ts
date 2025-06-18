import { getWebuiApiBaseUrl } from '$lib/constants';

export const getCreditConfig = async (token: string) => {
	let error = null;

	const res = await fetch(`${getWebuiApiBaseUrl()}/credit/config`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const createTradeTicket = async (token: string, payType: string, amount: number) => {
	let error = null;

	const res = await fetch(`${getWebuiApiBaseUrl()}/credit/tickets`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			pay_type: payType,
			amount: amount
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const listCreditLog = async (token: string, page: number) => {
	let error = null;

	const res = await fetch(`${getWebuiApiBaseUrl()}/credit/logs?page=${page}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const listAllCreditLog = async (
	token: string,
	page: number,
	limit: number,
	query: string
) => {
	let error = null;

	const res = await fetch(
		`${getWebuiApiBaseUrl()}/credit/all_logs?page=${page}&limit=${limit}&query=${query}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	)
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getCreditStats = async (token: string, data: object) => {
	let error = null;

	const res = await fetch(`${getWebuiApiBaseUrl()}/credit/statistics`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};
