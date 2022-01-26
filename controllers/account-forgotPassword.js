$(function() {
	var validator = $('#main-form').validate({
		rules: {
			email: {
				email: true,
				required: true
			},
		},
		messages: {
			email: 'Please enter an e-mail address',
		},
		errorElement: 'div',
		errorPlacement: function ( error, element ) {
			// Add the `help-block` class to the error element
			error.addClass( "invalid-feedback" );

			error.insertAfter( element );
		}
	})

	$('#confirm_button').on('click', function() {
		// reset alert if need be
		alertReset();

		// exit if input isn't valid
		if(!validator.form()) return;

		// show spinner
		showSpinner('#confirm_button', 'Confirm');

		var email = $('#email').val();

		const settings = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				'email': email,
			})
		}

		var statusCode = '';
		var statusText = '';
		new API().request('/account/forgotPassword', settings).then(response => {
			statusCode = response.status;
			statusText = response.msg;

			switch(statusCode) {
				case 200:
					$('#main-form').hide();
					alertShow(statusText, 'alert-success');
					break;
				default:
					alertShow(statusText, 'alert-danger');
					hideSpinner('#confirm_button', 'Confirm');
					break
			}
		})
	});
});