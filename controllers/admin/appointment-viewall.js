$(document).ready(function () {
	// Define popoever behavior
	// $('[data-bs-toggle="popover"]').on('click', function(event) {
	// 	var id = event.target.id;
	// 	console.log(id);
	// })

	var calendarEl = document.getElementById('calendar');
	var calendar = new FullCalendar.Calendar(calendarEl, {
		initialView: 'dayGridMonth',
		// themeSystem: 'bootstrap',
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'timeGridDay timeGridWeek dayGridMonth'
		},
		navLinks: true, // can click day/week names to navigate views
		selectable: true,
		eventClick: function(event) {
			var appointment = event.event.extendedProps;
			
			var startTime = new Date(event.event.start).toLocaleTimeString('en-US');
			var createdDate = new Date(appointment.created).toLocaleString('en-US');
			var status = appointment.approved ? 'confirmed' : 'not confirmed';

			$('.modal').find('#title').html(appointment.account.name);

			// Service fields
			$('.modal').find('#service').html(appointment.service.name);
			$('.modal').find('#service').attr('value', appointment._id);

			// Service popover
			$('#service-info').popover({content: `
				Duration: ${appointment.service.duration}<br>
				Price: \$${appointment.service.price}<br>
				Description: ${appointment.service.description}
			`, html: true});

			// Appointment fields
			$('.modal').find('#appointment').html(startTime);
			$('#appointment-info').popover({content: `
				Created: ${appointment.created}
			`, html: true});

			// Account fields
			$('.modal').find('#customer').html(appointment.account.name);
			$('#customer-info').popover({content: `
				Age: ${appointment.account.age}<br>
				Phone #: ${appointment.account.phone}<br>
				E-mail: ${appointment.account.email}
			`, html: true});

			// Confirmation info
			$('#confirmation-info').popover({content: 'Appointments will be confirmed/unconfirmed by Edina and the customer will receive a notification.', html: true});

			if(appointment.approved) {
				showButton('#unconfirm-appointment')
				hideButton('#confirm-appointment')
			} else {
				showButton('#confirm-appointment');
				hideButton('#unconfirm-appointment')
			}

			// TODO: define button click behavior HERE
			$('#confirm-appointment').on('click', function() {
				// $('#confirm-appointment').prop('disabled', true);
				disableButton('#confirm-appointment');
				var appointmentID = appointment._id;
				var data = { 'appointmentID': appointmentID };
				console.log(appointmentID);
		
				// $.post('/appointment/confirmappointment', data, function() {
				$.post(`/appointment/modify/approved/true`, data, function(result) {
					// console.log(result);
					calendar.getEventById(appointmentID).setProp('color', 'green');
					calendar.getEventById(appointmentID).setExtendedProp('approved', true);
		
					hideButton('#confirm-appointment');
					enableButton('#confirm-appointment');
					showButton('#unconfirm-appointment');
				}).fail(function(error) {
					console.log(error);
				})
			});

			$('#unconfirm-appointment').on('click', function() {
				disableButton('#unconfirm-appointment');
				var appointmentID = appointment._id;
				var data = { 'appointmentID': appointmentID };
				console.log(appointmentID);
		
				$.post(`/appointment/modify/approved/false`, data, function(result) {
					calendar.getEventById(appointmentID).setProp('color', 'red');
					calendar.getEventById(appointmentID).setExtendedProp('approved', false);
		
					hideButton('#unconfirm-appointment');
					enableButton('#unconfirm-appointment');
					showButton('#confirm-appointment');
				}).fail(function(error) {
					enableButton('#unconfirm-appointment');
				})
			});

			// Display the modal
			$('.modal').modal('show');
		},
		eventSources: [
			{
				url: '/appointment/getall/approved',
				color: 'green'
			},
			{
				url: '/appointment/getall/unapproved',
				color: 'red'
			}
		],
		eventsSet: function() {
			// console.log(this.getEvents());
		},
	});

	// Reset button states when modal closes
	$('.modal').on('hide.bs.modal', function() {
		enableButton('#confirm-appointment');
		enableButton('#unconfirm-appointment');
	})

	// Whenever the user clicks on the "save" button om the dialog
	// $('#save-event').on('click', function() {
	// 	var title = $('#title').val();
	// 	if (title) {
	// 		var eventData = {
	// 			title: title,
	// 			start: $('#starts-at').val(),
	// 			end: $('#ends-at').val()
	// 		};
	// 		$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
	// 	}
	// 	$('#calendar').fullCalendar('unselect');

	// 	// Clear modal inputs
	// 	$('.modal').find('input').val('');

	// 	// hide modal
	// 	$('.modal').modal('hide');
	// });

	function showButton(element) {
		$(element).removeClass('d-none');
	}

	function hideButton(element) {
		$(element).addClass('d-none');
	}

	function enableButton(element) {
		$(element).prop('disabled', false);
	}

	function disableButton(element) {
		$(element).prop('disabled', true);
	}

	calendar.render();
});