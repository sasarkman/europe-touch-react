$(document).ready(function () {
	var eventModal = $('#eventModal');

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

			eventModal.find('#title').html(appointment.account.name);

			// Service fields
			eventModal.find('#service').html(appointment.service.name);
			eventModal.find('#service').attr('value', appointment._id);

			// Service popover
			$('#service-info').popover({content: `
				Duration: ${appointment.service.duration}<br>
				Price: \$${appointment.service.price}<br>
				Description: ${appointment.service.description}
			`, html: true});

			// Appointment fields
			eventModal.find('#appointment').html(startTime);
			$('#appointment-info').popover({content: `
				Created: ${appointment.created}
			`, html: true});

			// Account fields
			eventModal.find('#customer').html(appointment.account.name);
			$('#customer-info').popover({content: `
				Age: ${appointment.account.age}<br>
				Phone #: ${appointment.account.phone}<br>
				E-mail: ${appointment.account.email}
			`, html: true});

			// Confirmation info
			eventModal.find('#status').html(status);
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
				disableButton('#confirm-appointment');
				var appointmentID = appointment._id;
				const settings = {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						i: appointmentID,
					})
				}

				new Appointment().approveAppointment(settings).then(() => {
					calendar.getEventById(appointmentID).setProp('color', 'green');
					calendar.getEventById(appointmentID).setExtendedProp('approved', true);
		
					hideButton('#confirm-appointment');
					enableButton('#confirm-appointment');
					showButton('#unconfirm-appointment');
				})
			});

			$('#unconfirm-appointment').on('click', function() {
				disableButton('#unconfirm-appointment');
				var appointmentID = appointment._id;
				const settings = {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						i: appointmentID,
					})
				}

				new Appointment().unapproveAppointment(settings).then(() => {
					calendar.getEventById(appointmentID).setProp('color', 'red');
					calendar.getEventById(appointmentID).setExtendedProp('approved', false);
		
					hideButton('#unconfirm-appointment');
					enableButton('#unconfirm-appointment');
					showButton('#confirm-appointment');
				})
			});

			// Display the modal
			eventModal.modal('show');
		},
		eventSources: [
			{
				url: '/appointment/getall/',
				extraParams: {
					't': 'a'
				},
				color: 'green'
			},
			{
				url: '/appointment/getall/',
				extraParams: {
					't': 'u'
				},
				color: 'red'
			}
		],
		eventsSet: function() {
			// console.log(this.getEvents());
		},
	});

	// Reset button states when modal closes
	eventModal.on('hide.bs.modal', function() {
		enableButton('#confirm-appointment');
		enableButton('#unconfirm-appointment');
	})

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