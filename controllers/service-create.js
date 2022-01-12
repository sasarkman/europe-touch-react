$(document).ready(function () {
	console.log('hello');

	$('#main-form').validate({
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
});