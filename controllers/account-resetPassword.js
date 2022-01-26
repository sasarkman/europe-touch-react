$(function() {
	var validator = $('#main-form').validate({
		rules: {
			password: {
				required: true
			},
			password2: {
				required: true,
				equalTo: '#password'
			},
		},
		messages: {
			password: 'Please enter a password',
			password2: 'Please enter a matching password',
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

		var url = window.location.pathname.split('/');
		var urlLen = url.length;
		var token = url[urlLen - 1];

		var password = $('#password').val();
		var password2 = $('#password2').val();

		const settings = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				'password': password,
				'password2': password2,
			})
		}

		var statusCode = '';
		var statusText = '';
		new API().request(`/account/resetPassword/${token}`, settings).then(response => {
			statusCode = response.status;
			statusText = response.msg;

			switch(statusCode) {
				case 200:
					statusText = `${statusText} Please <a href='/account/login'>login</a>.`;
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