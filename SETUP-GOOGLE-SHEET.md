# Connect registrations to your Google Sheet

Registrations are written to your sheet:
**https://docs.google.com/spreadsheets/d/1_-fsR5Dk2jIT8anq32mc34a1DJsL5lG45yaVVTovZzg/edit**

This uses a tiny Google Apps Script "Web App" as the bridge. No Google Cloud
project, no service-account keys. One-time setup, ~5 minutes.

> Until you finish these steps, registrations are still captured safely — they
> land in `.data/registrations.jsonl` in the project so nothing is lost.

---

## Step 1 — Open the script editor on your sheet

1. Open your sheet (link above).
2. Menu: **Extensions ▸ Apps Script**.
3. Delete whatever is in `Code.gs` and paste the script below.

```javascript
// SkyHunter registration receiver — appends each signup as a new row.
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // avoid two signups colliding
  try {
    var body = JSON.parse(e.postData.contents);

    // OPTIONAL shared secret. If you set SHEETS_WEBHOOK_TOKEN in .env.local,
    // put the SAME value here between the quotes. Leave '' to skip the check.
    var SECRET = '';
    if (SECRET && body.token !== SECRET) {
      return json({ ok: false, error: 'unauthorized' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Registrations') || ss.getSheets()[0];

    var fields = body.fields || Object.keys(body.record || {});
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(fields); // header row, written once
    }

    var record = body.record || {};
    var row = fields.map(function (f) { return record[f] || ''; });
    sheet.appendRow(row);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click the **Save** icon.

## Step 2 — Deploy it as a Web App

1. Top-right: **Deploy ▸ New deployment**.
2. Click the gear ⚙ next to "Select type" and choose **Web app**.
3. Set:
   - **Description:** SkyHunter registrations
   - **Execute as:** Me
   - **Who has access:** **Anyone**  ← required so the site can post to it
4. Click **Deploy**, then **Authorize access** and approve the permissions
   (it's your own script writing to your own sheet).
5. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy....../exec`.

## Step 3 — Give the site the URL

Create a file named `.env.local` in the project root (`E:\Projects\Job losted`):

```bash
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfy....../exec
# Optional — only if you set SECRET in the script above:
# SHEETS_WEBHOOK_TOKEN=some-long-random-string
```

Restart the dev server (`npm run dev`). Done.

## Step 4 — Test it

1. Go to http://localhost:3000/register and submit the form.
2. A new row should appear in your sheet within a second or two, with headers:
   `timestamp, name, email, previousRole, industry, situation, location`.

---

### Notes
- The header row is created automatically on the first successful signup.
- If a write ever fails, the signup is still saved to `.data/registrations.jsonl`
  as a backup so you never lose one.
- Whenever you change the script, do **Deploy ▸ Manage deployments ▸ edit ▸
  New version** (or the URL keeps running the old code).
