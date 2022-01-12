$(document).ready(function () {
	console.log('hello');

	$('#main-form').validate({
		rules: {
			email: {
				email: true,
				required: true
			},
			password: {
				required: true
			},
			phone_number: {
				required: true
			},
			age: {
				required: true
			}
		},
		messages: {
			email: 'Please enter an e-mail address',
			password: 'Please enter a password',
			phone_number: 'Please enter a phone number',
			age: 'Please enter your age'
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
});