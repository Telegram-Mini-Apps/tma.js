# 💠Location Manager

A component responsible for accessing the device location in Telegram Mini Apps. The location
manager is supported since Mini Apps v8.0.

## Checking Support

To check if the location manager can be used, call the `isSupported` function. It returns `true`
if the SDK is [initialized](../initializing.md) and the Telegram client supports the location
manager.

```ts
import { locationManager } from '@tma.js/sdk';

locationManager.isSupported(); // boolean
```

All methods of the component throw `NotInitializedError` if the SDK is not initialized, and
`MethodUnsupportedError` if the location manager is unsupported.

## Mounting

Before using the component, it must be mounted. Mounting is asynchronous, as the location manager
state is requested from the Telegram client. If the page was reloaded, the state saved before the
reload is restored instead.

While mounting, the `isMounting` computed value is `true`. When the component is mounted,
`isMounted` becomes `true`.

```ts
const promise = locationManager.mount();
locationManager.isMounting(); // true
await promise;
locationManager.isMounting(); // false
locationManager.isMounted(); // true
```

`mount` accepts an optional object with the `timeout` and `signal` properties. If the Telegram
client didn't respond in time, `mount` throws `TimeoutError`. If the signal was aborted, the
promise is rejected with `signal.reason`.

The `safeMount` method returns `TimeoutError` as a result instead of throwing it:

```ts
const result = await locationManager.safeMount({ timeout: 5000 });
if (!result.ok) {
  console.error('Mount failed:', result.error); // TimeoutError
}
```

To unmount the component, use the `unmount` method. It also cancels pending mounts, so they don't
mount the component when they complete.

```ts
locationManager.unmount();
locationManager.isMounted(); // false
```

While mounted, the component listens to the `location_checked` event and keeps its state up to
date.

## State

The component state is available via the `state` computed value. Each of its properties is also
available as a separate computed value.

| Property          | Computed value      | Description                                          |
|-------------------|---------------------|------------------------------------------------------|
| `available`       | `isAvailable`       | True if location is available on the current device. |
| `accessRequested` | `isAccessRequested` | True if the permission to use location was requested. |
| `accessGranted`   | `isAccessGranted`   | True if the permission to use location was granted.  |

```ts
locationManager.state();
// { available: true, accessRequested: true, accessGranted: true }

locationManager.isAccessGranted(); // true
```

## Requesting Location

To request the current device location, use the `requestLocation` method. It requires the
component to be mounted, and accepts an optional object with the `timeout` and `signal`
properties.

The method returns an object describing the device location, or `null` if location is
unavailable. In the latter case, the `available` state property becomes `false`.

```ts
const location = await locationManager.requestLocation();
if (location) {
  console.log(location.latitude, location.longitude);
}
```

The location object (`LocationData`) contains the following numeric properties:

| Property              | Description                                                          |
|-----------------------|----------------------------------------------------------------------|
| `latitude`            | Latitude in degrees.                                                 |
| `longitude`           | Longitude in degrees.                                                |
| `altitude`            | _Optional_. Altitude above sea level in meters.                      |
| `course`              | _Optional_. The direction the device is moving in degrees, 0 is north. |
| `speed`               | _Optional_. The speed of the device in m/s.                          |
| `horizontal_accuracy` | _Optional_. Accuracy of the latitude and longitude values in meters. |
| `vertical_accuracy`   | _Optional_. Accuracy of the altitude value in meters.                |
| `course_accuracy`     | _Optional_. Accuracy of the course value in degrees.                 |
| `speed_accuracy`      | _Optional_. Accuracy of the speed value in m/s.                      |

Optional properties may be `null` or missing.

The method throws `NotMountedError` if the component is not mounted, and `TimeoutError` if the
Telegram client didn't respond in time. `safeRequestLocation` returns `TimeoutError` as a result
instead.

```ts
const result = await locationManager.safeRequestLocation({ timeout: 10000 });
if (result.ok) {
  console.log(result.data); // LocationData | null
}
```

## Opening Settings

To open the location settings, use the `openSettings` method. Use it when the user denied the
access, but the mini app needs it. Call it only in response to the user interaction. The method
doesn't require the component to be mounted.

```ts
locationManager.openSettings();
```
