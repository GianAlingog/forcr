const PREFIX = "F0RCR";

export function fetchUserName(): string | null {
  const userName = localStorage.getItem(PREFIX + "cf_username");
  return userName;
}

export function storeUserName(userName: string): void {
  localStorage.setItem(PREFIX + "cf_username", userName);
  return;
}