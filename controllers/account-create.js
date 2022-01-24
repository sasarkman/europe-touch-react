jQuery(function () {
	console.log('hello');

	var validator = $('#main-form').validate({
		rules: {
			email: {
				email: true,
				required: true
			},
			password: {
				required: true
			},
			name: {
				required: true
			},
			phone: {
				required: true
			},
			age: {
				required: true
			}
		},
		messages: {
			email: 'Please enter an e-mail address',
			password: 'Please enter a password',
			name: 'Please enter your full name',
			phone: 'Please enter a phone number',
			age: 'Please enter your age'
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
	});

	$('#create_button').on('click', function() {
		console.log('clicked');

		// reset alert if need be
		alertReset();

		// exit if input isn't valid
		if(!validator.form()) return;

		var email = $('#email').val();
		var password = $('#password').val();
		var name = $('#name').val();
		var phone = $('#phone').val();
		var age = $('#age').val();

		const settings = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				'email': email,
				'password': password,
				'name': name,
				'phone': phone,
				'age': age
			})
		}

		var statusCode = '';
		var statusText = '';
		var alertCSS = '';
		var alertText = '';
		new Account().createAccount(settings)
			.then(response => {
				statusCode = response.status;
				return response;
			})
			.then(response => response.json())
			.then( response => {
				statusText = response.msg;
				alertText = statusText;

				console.log(`status code: ${statusCode}`);

				switch(statusCode) {
					case 200:
						alertText = `${alertText}&nbsp;<a href="/account/login" class="alert-link">login</a>`;
						$('#main-form').hide();
						alertShow(alertText, 'alert-success');
						break;
					default:
						alertShow(alertText, 'alert-danger');
						break
				}
			})
			.catch((err) => {
				console.log(err);
			});
	});
});