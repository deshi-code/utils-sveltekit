import { BROWSER } from '$app/environment';
if (BROWSER) {
  throw new Error("This module can only be used on the server.");
}