export const discordClientId = '834108043687231570';
export const githubClientId = '16645067d609075c61e4';
// export const githubClientId = null;
export const googleClientId = '444774972531-atkv3k11o8satjic5m88ldv16beri3rf.apps.googleusercontent.com';
// export const googleClientId = null;
const apiBaseUrls: string[] = [
  'https://chia-dashboard-api.foxypool.io/api',
  'https://chia-dashboard-api-2.foxypool.io/api',
  'https://chia-dashboard-api-3.foxypool.io/api',
]
function randomArrayPosition<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}
export const apiBaseUrl = randomArrayPosition(apiBaseUrls)
export const enablePeriodicUpdates = true;
export const requestDiscordGuildPermission = true;

// DEV
// export const githubClientId = 'f5cf9bfb6113a5fee63c';
// export const apiBaseUrl = 'http://localhost:5000/api';
