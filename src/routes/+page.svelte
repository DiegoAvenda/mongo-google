<script>
	import maddox from '$lib/images/maddox.jpg';
	import { onMount } from 'svelte';
	export let data;

	let notifPermGranted = null;
	let isSubscribed = false;

	onMount(async () => {
		notifPermGranted = Notification.permission === 'granted';

		if (notifPermGranted) {
			isSubscribed = await checkSubscriptionStatus();

			if (!isSubscribed) {
				await subscribeUser();
			}
		}
	});

	function requestNotificationPermission() {
		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				new Notification('You are subscribed to notifications!');
			}
		});
	}

	async function sendSubscriptionToServer(subscription) {
		try {
			const res = await fetch('/add-push-subscription', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ subscription })
			});
			if (!res.ok)
				throw new Error(`Error savings subscription on server: ${res.statusText} (${res.status})`);
		} catch (error) {
			console.error('Error saving subscription on server:', error);
			unsubscribe();
		}
	}

	async function checkSubscriptionStatus() {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			const exists = subscription !== null;
			/* if (exists) {
				//just to make sure the susbcription is saved on the server
				sendSubscriptionToServer(subscription);
			} */
			return exists;
		}
		return false;
	}

	async function subscribeUser() {
		if ('serviceWorker' in navigator) {
			try {
				const res = await fetch('/vapid-pubKey');
				const { data } = await res.json();

				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: data
				});
				isSubscribed = true;
				console.log('new Subscription:', JSON.stringify(subscription));
				sendSubscriptionToServer(subscription);
			} catch (error) {
				console.log('Error subscribing:', error);
			}
		}
	}

	async function unsubscribe() {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			if (subscription) {
				await subscription.unsubscribe();
				isSubscribed = false;
			}
		}
	}

	function notifyMe() {
		new Notification('hello there my friends!');
	}
</script>

<img width="20px" src={maddox} alt="maddox" />
<h1>Welcome to SvelteKit</h1>
<p>{data.lectura.info}</p>
<a href="/login/google">Sign in with Google</a>

{#if notifPermGranted === null}
	<p>Checking permissions...</p>
{:else if notifPermGranted === false}
	<button type="button" on:click={requestNotificationPermission}>Enable notifications</button>
{:else}
	<p>
		You have enabled notification permissions. Remove the permission in your browser settings...
	</p>
	<p>Subscribed to push notifications: <b>{isSubscribed}</b></p>
	<button on:click={notifyMe}>notification api</button>
	{#if isSubscribed}
		<button type="button" on:click={unsubscribe}>Unsuscribe</button>
		<form method="post" action="?/testNotification">
			<button type="submit">Test notification</button>
		</form>
	{/if}
{/if}
