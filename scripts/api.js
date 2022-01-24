class API {
	constructor() {
	}

	request(url, data) {
		var responseCode = '';
		return fetch(url, data).then(response => {
			responseCode = response.status;
			return response;
		}).then(response => response.json()
		).then(response => {
			var result = {
				'status': responseCode,
				'msg': response.msg,
			}

			if(response.data) result.data = response.data;

			return result;
		}).catch((err) => {
				return {
					'status': 400,
					'msg': 'Failed to connect',
				}
			})
		}
}