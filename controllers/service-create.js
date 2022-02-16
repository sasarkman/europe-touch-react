$(function () {
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

	$('#create_button').on('click', function() {
		// reset alert if need be
		alertReset();

		// exit if input isn't valid
		if(!validator.form()) return;

		// show spinner
		showSpinner('#create_button', 'Creating...');

		var name = $('#name').val();
		var duration = $('#duration').val();
		var price = $('#price').val();
		var description = $('#description').val();

		const settings = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				'name': name,
				'duration': duration,
				'price': price,
				'description': description,
			})
		}

		var statusCode = '';
		var statusText = '';
		new API().request('/service/', settings).then(response => {
			statusCode = response.status;
			statusText = response.msg;

			switch(statusCode) {
				case 200:
					alertShow(statusText, 'alert-success');
					break;
				default:
					alertShow(statusText, 'alert-danger');
					break
			}
			hideSpinner('#create_button', 'Create service');
		})
	});
});