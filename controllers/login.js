$(document).ready(function () {
	console.log('hello');

	$('#login-form').validate({
		rules: {
			email: {
				email: true,
				required: true
			},
			password: {
				required: true
			}
		},
		messages: {
			email: 'Please enter an e-mail address',
			password: 'Please enter a password'
		},
		errorElement: 'em',
		errorPlacement: function ( error, element ) {
			// Add the `help-block` class to the error element
			error.addClass( "help-block" );

			if ( element.prop( "type" ) === "checkbox" ) {
				error.insertAfter( element.parent( "label" ) );
			} else {
				error.insertAfter( element );
			}
		},
	})
});