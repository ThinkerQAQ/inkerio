// Resolve midnight in the site's configured IANA zone (including DST) rather
// than assuming the server/CI timezone or a fixed UTC offset.
export function zonedStartOfNextMonth(month, timeZone) {
  const [year, value] = month.split("-").map(Number);
  const desiredUtc = Date.UTC(year, value, 1);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  let guess = desiredUtc;
  for (let i = 0; i < 3; i++) {
    const values = Object.fromEntries(formatter.formatToParts(new Date(guess)).map(part => [part.type, Number(part.value)]));
    const observed = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second);
    guess += desiredUtc - observed;
  }
  return new Date(guess);
}
