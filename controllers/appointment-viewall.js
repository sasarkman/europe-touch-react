$(document).ready(function () {
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

			// Confirmation info
			$('#confirmation-info').popover({content: 'Appointments will be confirmed/unconfirmed by Edina and the customer will receive a notification.', html: true});

			// Define modal button click behavior
			$('#cancel-appointment').on('click', function() {
				disableButton('#cancel-appointment');
				var appointmentID = appointment._id;
				var data = { 'appointmentID': appointmentID };
		
				$.post(`/appointment/cancel/${appointmentID}`, data, function(result) {
					calendar.getEventById(appointmentID).setProp('color', 'red');
					calendar.getEventById(appointmentID).setExtendedProp('approved', false);
		
					enableButton('#cancel-appointment');
				}).fail(function(error) {
					enableButton('#cancel-appointment');
				})

				$('#event-modal').modal('hide');
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