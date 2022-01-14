$(function () {
	var eventModal = $('#event_modal');
	var confirmCancelModal = $("#confirmCancelModal");

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

			// Confirmation info
			$('#confirmation-info').popover({content: 'Appointments will be confirmed/unconfirmed by Edina and the customer will receive a notification.', html: true});

			// Define modal button click behavior
			$('#cancel_appointment').on('click', function() {
				// $('#confirm_cancel_modal').modal('show');

				const modal = new Promise(function(resolve, reject){
					$('#confirm_cancel_modal').modal('show');
					$('#confirm_cancel_modal .btn-danger').on('click', function () {
						disableButton('#confirm_cancel');
						resolve("user clicked yes");
					});
					$('#confirm_cancel_modal .btn-ok').on('click', function () {
						reject("user clicked cancel");
					});
				}).then(function (val) {
					console.log(val)
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
					new Appointment().cancelAppointment(settings).then(() => {
						// remove event from calendar
						calendar.getEventById(appointmentID).remove();
						$('#confirm_cancel_modal').modal('toggle');
					});
				}).catch(function (err) {
					console.log(err)
				});
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
	$('.modal').on('hide.bs.modal', function() {
		enableButton('#confirm-appointment');
		enableButton('#unconfirm-appointment');
		enableButton('#confirm_cancel');
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