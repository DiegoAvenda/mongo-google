self.addEventListener('push', function (event) {
	const payload = event.data?.text() ?? 'no payload';
	const registration = self.registration;
	event.waitUntil(
		registration.showNotification('Sveltekit Music Store', {
			body: payload
		})
	);
});
