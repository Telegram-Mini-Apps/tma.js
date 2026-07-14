export function isTelegramHostname(hostname: string): boolean {
  return ['t.me', 'telegram.dog', 'telegram.me'].includes(hostname);
}
