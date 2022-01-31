$(function() {
	// form validation
	var validator = $('#main-form').validate({
		rules: {
			name: {
				required: true
			},
			duration: {
				required: true
			},
			price: {
				required: true
			},
			description: {
				required: true
			}
		},
		messages: {
			name: 'Please enter a name for this service',
			duration: 'Please enter a duration',
			price: 'Please enter a price',
			description: 'Please enter a description for this service'
		},
		errorElement: 'div',
		errorPlacement: function ( error, element ) {
			// Add the `help-block` class to the error element
			error.addClass( "invalid-feedback" );

			// If element has popover, insert after its parent
			if ( element.parent('.input-group').length > 0 ) {
				error.insertAfter( element.parent( ".input-group" ) );
			} else {
				error.insertAfter( element );
			}
		}
	})
	
	const serviceNameField = $('#name');
	const durationField = $('#duration');
	const priceField = $('#price');
	const descriptionField = $('#description');
	const servicesSelector = $('#services');

	servicesSelector.on('change', (e) => {
		alertReset();
		$('.collapse').collapse('hide');
		const serviceID = e.target.value;

		var statusCode = '';
		var statusText = '';
		new API().request(`/service/getservice/${serviceID}`).then(response => {
			statusCode = response.status;
			statusText = response.msg;

			switch(statusCode) {
				case 200:
					// not ideal, but need delay here
					setTimeout(function() {
						$('.collapse').collapse('show');
					}, 500);

					const service = response.data[0];

					// update drop down
					$(`#services [value=${servicesSelector.val()}]`).text(service.name);
					serviceNameField.val(service.name);
					durationField.val(service.duration);
					priceField.val(service.price);
					descriptionField.val(service.description);
					break;
				default:
					alertShow(statusText, 'alert-danger');
					break;
			}
		});
	})

	var statusCode = '';
	var statusText = '';
	new API().request('/service/getservices').then((response) => {
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
				$('.collapse').collapse('show');
				break
			default:
				break;
		}
	});

	$('#save-button').on('click', function() {
		// exit if input isn't valid
		if(!validator.form()) return;

		alertReset();
		disableButton('#save-button');
		showSpinner('#save-button', 'Saving...');

		const settings = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id: servicesSelector.val(),
				name: serviceNameField.val(),
				duration: durationField.val(),
				price: priceField.val(),
				description: descriptionField.val()
			})
		}

		var statusCode = '';
		var statusText = '';
		new API().request('/service/edit', settings)
			// new Service().editService(settings)
			.then( response => {
				statusCode = response.status;
				statusText = response.msg;

				switch(statusCode) {
					case 200:
						$('#services').trigger('change');
						alertShow(statusText, 'alert-success');
						break;
					default:
						alertShow(statusText, 'alert-danger');
						break
				}

				enableButton('#save-button');
				hideSpinner('#save-button', 'Save changes');
			})
	});

	$('#delete-button').on('click', function() {
		alertReset();
		const modal = new Promise(function(resolve, reject){
			$('#confirm_delete_modal').modal('show');
			$('#confirm_delete_modal .btn-danger').on('click', function () {
				showSpinner('#confirm_delete', 'Deleting...');
				resolve("user clicked yes");
			});
			$('#confirm_delete_modal .btn-ok').on('click', function () {
				reject("user clicked cancel");
			});
		}).then(function (val) {
			const settings = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: servicesSelector.val(),
					// not ideal
					name: serviceNameField.val(),
				})
			}
	
			var statusCode = '';
			var statusText = '';
			new API().request('/service/delete', settings)
			// new Service().deleteService(settings)
				.then( response => {
					$('#confirm_delete_modal').modal('hide');
					statusCode = response.status;
					statusText = response.msg;
	
					switch(statusCode) {
						case 200:
							// Update the dropdown
							const option = $('#services option:checked');
							option.remove();

							$('#services').trigger('change');
							alertShow(alertText, 'alert-success');
				
							enableButton($(this));
							$(this).text('Delete');
							break;
						default:
							hideSpinner('#confirm_delete', 'Yes');
							alertShow('Server error', 'alert-danger');
							$('#confirm_delete_modal').modal('hide');
							break
					}
	
					hideSpinner('#confirm_delete', 'Yes');
				})

		}).catch(function (err) {
			console.log(err)
		});		
	})
});