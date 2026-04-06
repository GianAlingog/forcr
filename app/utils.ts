const PREFIX = "F0RCR";

export function fetchUserName(): string | null {
  const userName = localStorage.getItem(PREFIX + "cf_username");
  return userName;
}

export function storeUserName(userName: string): void {
  localStorage.setItem(PREFIX + "cf_username", userName);
  return;
}

export function fetchUserRating(): number | null {
  const userRating = localStorage.getItem(PREFIX + "user_rating");
  if (userRating === null) return null;
  return parseInt(userRating);
}

export function storeUserRating(userRating: number): void {
  localStorage.setItem(PREFIX + "user_rating", userRating.toString());
  return;
}