// Invisible field real people never see or fill, but naive bots do. If it
// arrives with a value, the server treats the submission as a bot.
//
// The field name is deliberately non-semantic ("hp_check", not "company") and
// carries password-manager ignore hints, because browsers and password managers
// autofill recognized fields like "company"/"organization" even when they're
// hidden off-screen — which was filling this trap for real users and blocking
// legitimate sign-ups.
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", top: "auto", height: 0, width: 0, overflow: "hidden" }}
    >
      <label>
        Leave this field empty
        <input
          type="text"
          name="hp_check"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
          data-lpignore="true"
          data-1p-ignore
          data-bwignore
          data-form-type="other"
        />
      </label>
    </div>
  );
}
