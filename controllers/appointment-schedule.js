$(function() {
	const durationField = $('#duration');
	const priceField = $('#price');
	const descriptionField = $('#description');
	const servicesSelector = $('#services');

	const settings = {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
	}

	$('#services').on('change', (e) => {
		alertReset();
		$('.collapse').collapse('hide');

		var statusCode = '';
		var statusText = '';
		var serviceID = e.target.value;
		new API().request(`/service/getservice/${serviceID}`, settings).then(response => {
			statusCode = response.status;
			statusText = response.msg;

			switch(statusCode) {
				case 200:
					// not ideal, but need delay here
					setTimeout(function() {
						$('.collapse').collapse('show');
					}, 500);

					const service = response.data[0];
					durationField.html(service.duration);
					priceField.val(service.price);
					descriptionField.html(service.description);
					break;
				default:
					alertShow(statusText, 'alert-danger');
					break
			}
		});
	})

	var statusCode = '';
	var statusText = '';
	new API().request('/service/getservices', settings).then(response => {
		statusCode = response.status;
		statusText = response.msg;

		switch(statusCode) {
			case 200:
				response.data.forEach(service => {
					const option = document.createElement('option');
					option.value = service._id;
					option.innerHTML = service.name;
					servicesSelector.append(option);
				});
				servicesSelector.trigger('change');
				break;
			default:
				alertShow(statusText, 'alert-danger');
				break
		}
	});
});