console.log("hi");

$(document).ready(function () {


	// var calendar = new FullCalendar.Calendar($('#calendar'), {
	// 	initialView: 'dayGridMonth'
	// });
	// calendar.render();

	// var calendarEl = document.getElementById('calendar');
	// var calendar = new FullCalendar.Calendar(calendarEl, {
	//   initialView: 'dayGridMonth'
	// });
	// calendar.render();
	
	var calendarEl = document.getElementById('calendar');
	var calendar = new FullCalendar.Calendar(calendarEl, {
		initialView: 'dayGridMonth',
		// themeSystem: 'bootstrap',
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridDay dayGridWeek dayGridMonth'
		},
		navLinks: true, // can click day/week names to navigate views
		selectable: true,
		select: function(start, end) {
			// Display the modal.
			// You could fill in the start and end fields based on the parameters
			$('.modal').modal('show');

		},
		eventClick: function(event, element) {
			// Display the modal and set the values to the event values.
			$('.modal').modal('show');
			$('.modal').find('#title').val(event.title);
			$('.modal').find('#starts-at').val(event.start);
			$('.modal').find('#ends-at').val(event.end);

		},
		events: '/appointment/getall'
	});

	// Whenever the user clicks on the "save" button om the dialog
	$('#save-event').on('click', function() {
		var title = $('#title').val();
		if (title) {
			var eventData = {
				title: title,
				start: $('#starts-at').val(),
				end: $('#ends-at').val()
			};
			$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
		}
		$('#calendar').fullCalendar('unselect');

		// Clear modal inputs
		$('.modal').find('input').val('');

		// hide modal
		$('.modal').modal('hide');
	});

	calendar.render();
});