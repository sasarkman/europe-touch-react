console.log('hello');

$(document).ready(function() {
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
		errorElement: 'em',
		errorPlacement: function ( error, element ) {
			// Add the `help-block` class to the error element
			error.addClass( "help-block" );

			// If element has popover, insert after its parent
			if ( element.parent('.input-group').length > 0 ) {
				error.insertAfter( element.parent( ".input-group" ) );
			} else {
				error.insertAfter( element );
			}
		},
	})
	
	const serviceNameField = $('#name');
	const durationField = $('#duration');
	const priceField = $('#price');
	const descriptionField = $('#description');
	const servicesSelector = $('#services');

	// servicesSelector.addEventListener('change', (e) => {
	servicesSelector.on('change', (e) => {
		const serviceID = e.target.value;
		new Service().getService(serviceID).then((data) => {
			const service = data[0];
			console.log(service);

			// update drop down
			$(`#services [value=${servicesSelector.val()}]`).text(service.name);
			serviceNameField.val(service.name);
			durationField.val(service.duration);
			priceField.val(service.price);
			descriptionField.val(service.description);
		});
	})

	new Service().getAllServices().then((data) => {
		data.forEach(service => {
			const option = document.createElement('option');
			option.value = service._id;
			option.innerHTML = service.name;
			// servicesSelector.appendChild(option);
			servicesSelector.append(option);
		});
		// servicesSelector.dispatchEvent(new Event('change'));
		servicesSelector.trigger('change');
	});

	$('#save-button').on('click', function() {
		// exit if input isn't valid
		if(!validator.form()) return;

		disableButton($(this));
		$(this).text('Saving...');

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

		new Service().editService(settings).then(() => {
			// Update the dropdown
			$('#services').trigger('change');

			enableButton($(this));
			$(this).text('Save changes');
		});
	})

	$('#delete-button').on('click', function() {
		disableButton($(this));
		$(this).text('Deleting...');

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

		new Service().deleteService(settings).then(() => {
			// Update the dropdown
			const option = $('#services option:checked');
			option.remove();

			$('#services').trigger('change');

			enableButton($(this));
			$(this).text('Delete');
		});
	})

	function enableButton(element) {
		$(element).prop('disabled', false);
	}

	function disableButton(element) {
		$(element).prop('disabled', true);
	}
});