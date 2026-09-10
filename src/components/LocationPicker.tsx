"use client";

import { useState } from "react";
import { Select } from "./Select";

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil",
  "Canada", "Chile", "China", "Colombia", "Czech Republic", "Denmark",
  "Egypt", "Finland", "France", "Germany", "Ghana", "Greece", "Hong Kong",
  "India", "Indonesia", "Ireland", "Israel", "Italy", "Japan", "Kenya",
  "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria",
  "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
  "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan",
  "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Vietnam", "Other",
];

// Subdivisions for countries where a picker is genuinely useful. Anything not
// listed falls back to a free-text "state / region" field.
const REGIONS: Record<string, string[]> = {
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  ],
  Canada: [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick",
    "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
    "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan",
    "Yukon",
  ],
  Australia: [
    "Australian Capital Territory", "New South Wales", "Northern Territory",
    "Queensland", "South Australia", "Tasmania", "Victoria",
    "Western Australia",
  ],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  Germany: [
    "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern",
    "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony",
    "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia",
  ],
  India: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal",
  ],
};

const inputClass =
  "w-full rounded-xl border border-steel-line bg-void px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-1.5 block text-sm font-medium text-mist";

export function LocationPicker() {
  const [country, setCountry] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postal, setPostal] = useState("");

  const regionOptions = REGIONS[country];

  // Composed into a standard address line, e.g.
  // "742 Evergreen Terrace, Springfield, Illinois 62704, United States".
  const regionPostal = [region.trim(), postal.trim()].filter(Boolean).join(" ");
  const location = [street.trim(), city.trim(), regionPostal, country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
      <div>
        <span className={labelClass}>Country</span>
        <Select
          name=""
          options={COUNTRIES}
          placeholder="Select your country…"
          required
          onChange={(v) => {
            setCountry(v);
            setRegion(""); // reset the subdivision when the country changes
          }}
        />
      </div>

      {country && (
        <>
          <div>
            <label htmlFor="street" className={labelClass}>
              Street address
            </label>
            <input
              id="street"
              name="street"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              autoComplete="address-line1"
              placeholder="e.g. 742 Evergreen Terrace"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className={labelClass}>
                City
              </label>
              <input
                id="city"
                name="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
                placeholder="City"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="postal" className={labelClass}>
                Postal / ZIP code <span className="text-faint">(optional)</span>
              </label>
              <input
                id="postal"
                name="postalCode"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                autoComplete="postal-code"
                placeholder="Postal code"
                className={inputClass}
              />
            </div>
          </div>

          {regionOptions ? (
            <div>
              <span className={labelClass}>State / Province / Region</span>
              <Select
                key={country} /* remount so the previous selection clears */
                name="region"
                options={regionOptions}
                placeholder="Select…"
                required
                onChange={setRegion}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="region" className={labelClass}>
                State / Region <span className="text-faint">(optional)</span>
              </label>
              <input
                id="region"
                name="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                autoComplete="address-level1"
                placeholder="State, province, or region"
                className={inputClass}
              />
            </div>
          )}
        </>
      )}

      {/* Combined value the API stores + logs to the sheet. */}
      <input type="hidden" name="location" value={location} />
    </div>
  );
}
