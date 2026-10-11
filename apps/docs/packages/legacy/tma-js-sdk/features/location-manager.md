# 💠Location Manager

A component responsible for location tracking functionality for Telegram Mini Apps.

## Checking Support

To check if location tracking is supported by the current Telegram Mini Apps version, use the `isSupported` signal:

```ts
import { locationManager } from '@tma.js/sdk';

locationManager.isSupported(); // boolean
```

## Mounting

Before using the component, it must be mounted.

This process is asynchronous, as location manager settings need to be requested from the Telegram application. The
`isMounting` signal will be set to `true` during the process and updated to `false` when complete.

If mounting is successful, the `isMounted` signal will be set to `true`.

```ts
try {
  const promise = locationManager.mount();
  locationManager.isMounting(); // true
  await promise;
  locationManager.isMounting(); // false
  locationManager.isMounted(); // true
} catch (err) {
  locationManager.isMounting(); // false
  locationManager.isMounted(); // false
}
```

To unmount, use the `unmount` method:

```ts
locationManager.unmount();
locationManager.isMounted(); // false
```

## Requesting Location

To request the current location, use the `requestLocation` method. It returns a cancelable promise
with an object, describing the current device location.

```ts
const location = await locationManager.requestLocation();
```

The object contains the following numeric properties:

| Property              | Description                                                          |
|-----------------------|----------------------------------------------------------------------|
| `latitude`            | Latitude in degrees.                                                 |
| `longitude`           | Longitude in degrees.                                                |
| `altitude`            | _Optional_. Altitude above sea level in meters.                      |
| `course`              | _Optional_. The direction the device is moving in degrees.           |
| `speed`               | _Optional_. The speed of the device in m/s.                          |
| `horizontal_accuracy` | _Optional_. Accuracy of the latitude and longitude values in meters. |
| `vertical_accuracy`   | _Optional_. Accuracy of the altitude value in meters.                |
| `course_accuracy`     | _Optional_. Accuracy of the course value in degrees.                 |
| `speed_accuracy`      | _Optional_. Accuracy of the speed value in m/s.                      |

## Opening Settings

To open the location manager-related settings modal, use the `openSettings` method. This method can
only be triggered in response to user interaction.

```ts
locationManager.openSettings();
```
