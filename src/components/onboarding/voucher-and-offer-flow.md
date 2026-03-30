## “Create Offer & Voucher” Multi-Step Flow

Build a polished multi-step mobile-first flow for creating a marketplace offer and automatically packaging it into a voucher / gift card product.

The flow should feel simple, trustworthy, and guided for non-technical users. The user is creating:

1. an **offer** they can fulfill,
2. a **voucher/shop credit** tied to their shop,
3. a published marketplace listing.

Use a clean card-based UI with strong hierarchy, soft borders, rounded corners, clear progress indicators, inline helper text, and mobile-friendly spacing.

---

## Product Goal

Create a 4-step wizard that helps a seller:

* describe what they offer,
* price it in local currency,
* create a voucher/gift card wrapper for that offer,
* confirm and publish.

After publishing, show a success screen explaining what happened:

* the offer is listed,
* the voucher is published,
* the user’s pool/account is ready,
* next actions are available.

This should be optimized for first-time sellers who may not fully understand vouchers yet.

---

## Core UX Principles

* Mobile-first layout
* Single primary action per screen
* Clear progress indicator: “Step X of 4”
* Inputs grouped inside a main card
* Helpful explainer boxes for unfamiliar concepts
* Inline validation and disabled CTA until minimum required fields are complete
* Preserve data between steps
* Allow back navigation without losing progress
* Simple, plain-language microcopy
* Make “voucher” understandable as a prepayment/shop credit instrument

---

## Flow Overview

### Step 1: Create Your Offer

Purpose: collect the seller’s first marketplace listing details.

#### Screen content

Header:

* Title: **Create Your Offer**
* Subtitle: “Start by describing what you offer. This becomes your first listing on the network.”

Helper box:

* Explain that this is like listing an item/service in a marketplace, except people can pay using vouchers or local currency.

Fields:

1. **Offer Name** (required)

   * placeholder examples: “Organic Butternut Squash”, “1 Hour Carpentry”, “Maths Tutoring”
   * helper text: “Be specific — this is what buyers will see.”

2. **Description** (optional)

   * multiline
   * helper text: “Tell people more about your offer — quality, sourcing, what’s included…”

3. **Categories / tags** (optional but recommended)

   * searchable select or multi-select dropdown

4. **Offer Photo** (required)

   * image upload area
   * helper text: “Helps buyers find and trust your offer”

Bottom helper note:

* “Not sure what to offer? You can add more offers later from your shop. Start with just one thing you’re confident in providing.”

Secondary link:

* “View examples of offers”

Navigation:

* Back button disabled on first step
* Primary CTA: **Next**

#### Validation

Require:

* offer name
* offer photo

---

### Step 2: Price Your Offer

Purpose: define price, measurement unit, and availability / capacity.

#### Screen content

Header:

* “Price Your Offer”
* Subtitle: “Set the price and availability of your offer. This is how buyers will understand your voucher’s value.”

Helper box:

* Explain that the seller should set a fair market price in local currency. Buyers can pay with vouchers or local currency, and this can be updated later.

Fields:

1. **Currency / unit of account** (required)

   * dropdown
   * default: KES

2. **Price** (required)

   * numeric
   * helper text: “Price in KES”

3. **Per (unit of measure)** (required)

   * text input
   * placeholder examples: “per kg”, “per hour”, “per item”

4. **Quantity available** (optional but recommended)

   * numeric/text
   * helper text: “How much can you supply?”

5. **Frequency** (optional but recommended)

   * text input
   * placeholder example: “10 kg available per week”
   * helper text: “Buyers will see this as your availability / capacity.”

Navigation:

* Back
* Next

#### Validation

Require:

* currency
* price
* per-unit label

---

### Step 3: Your Voucher

Purpose: create the voucher/gift card layer for the shop.

#### Screen content

Header:

* “Your Voucher (Gift Card)”

Educational explainer box:

* Title: **What’s a voucher?**
* Explain:

  * it acts like a gift card for your offers,
  * when someone redeems a voucher, you are committing to provide them with your offers.

Display summary:

* “Your Offer: [Offer Name]”

Fields:

1. **Voucher Name** (required)

   * auto-generated default: “[Users Name]’s Voucher”
   * editable

2. **About your shop** (shown on voucher page) (optional but recommended)

   * multiline short description of the business / shop identity

3. **Voucher Value** (required)

   * numeric input
   * suffix label: “[Currency] worth of goods & services”
   * default: 1 or same as offer price, depending mode
   * helper text should explain this is how much one voucher is worth in local currency

4. **Advanced voucher settings** (collapsible)
   Include:

   * **Unit of account (use UoA Field)**

     * default from previous step
   * **Voucher symbol**

     * short ticker, e.g. AMINA
     * auto-generate if blank
   * **Location** (optional)

     * city / country / blank for remote/global
   * **Voucher value**

     * same as above but editable in advanced mode
   * **Total supply** (optional)

     * maximum number of vouchers to mint / issue
     * blank means flexible supply
   * **Contact Email** (optional)

     * for business contact if different from account email
   * **Voucher Type**

     * dropdown with:

       * Standard (circulates forever)
       * Expiring
       * Decaying
     * default to Standard
   * If Expiring or Decaying is selected, reveal relevant configuration fields

Navigation:

* Back
* Next

#### Auto-fill behavior

* Voucher name derives from users name if available
* Voucher symbol derives from voucher name or users name
* Voucher value defaults intelligently from the offer price or a unit value of 1
* Currency inherits from pricing step

#### Validation

Require:

* voucher name
* voucher value
* unit of account

---

### Step 4: Confirm & Publish

Purpose: review and publish both voucher and first offer.

#### Screen content

Header:

* “Confirm & Publish”
* Subtitle: “Review your voucher, then publish it to the network.”

Summary card:

* Voucher name
* Currency / Valued in: currency/unit of account
* First offer name
* Option link: “Add another offer”

Consent checkboxes:

1. **Accept Terms and Conditions** (required)

   * helper text: agreement to platform terms and privacy policy

2. **Accept PATH License** (required if applicable to network rules)

   * helper text: allow voucher to be traded and exchanged on the network

Primary CTA:

* **Create My Voucher! 🎉**
* disabled until required checkboxes are selected

Secondary nav:

* Back

#### Validation

Require:

* both consent checkboxes checked

---

## Success Screen

Purpose: confirm completion and guide next actions.

#### Screen content

Header:

* “Your voucher is live!”

Summary card:

* Voucher name
* Marketplace / shop context
* Accepted currency
* First offer name

Checklist of completed actions:

* Offer listed on marketplace
* Voucher published on network
* Pool/account automatically created and ready to accept payments

Informational note:

* People can now buy your voucher and redeem it for your offers

Next action cards:

1. **Share Your Shop**

   * “Get the word out! Share a link to your voucher so people can buy and redeem your offers.”

2. **Accept other shops’ credits in your shop**

   * “See what other shops are offering and start trading vouchers.”

3. **Go to your shop**

   * “Understand how pools and credit work, and customize your setup.”

Footer link:

* Back to dashboard

---

## Data Model

Use a structured draft object persisted across steps.

```ts
type OfferDraft = {
  offer: {
    name: string
    description?: string
    categories: string[]
    photo?: string
  }
  pricing: {
    currency: string
    price: number | null
    unit: string
    quantityAvailable?: string
    frequency?: string
  }
  voucher: {
    name: string
    description?: string
    value: number | null
    unitOfAccount: string
    symbol?: string
    location?: string
    totalSupply?: number | null
    contactEmail?: string
    type: 'standard' | 'expiring' | 'decaying'
    expiryDate?: string
    decayRate?: number | null
  }
  confirmation: {
    acceptedTerms: boolean
    acceptedLicense: boolean
  }
}
```

---

## Functional Requirements

### State

* Persist wizard state between steps
* Allow user to go backward without losing entries
* Support autosave draft locally
* Restore unfinished draft if user returns

### Validation

* Per-step validation
* Show inline errors only after interaction or on submit attempt
* Disable Next/Publish when required fields are missing

### Uploads

* Offer photo uploader should support:

  * preview
  * remove / replace
  * loading state
  * validation for image types and file size

### Derived fields

* voucher.unitOfAccount defaults from pricing.currency
* voucher.value defaults from pricing.price where appropriate
* voucher.symbol auto-generated from business/shop name or voucher name
* confirmation summary always reflects latest values

### Publish action

On publish:

1. create voucher/shop credit record
2. create offer listing linked to voucher/shop
3. initialize seller pool/account if required
4. return success payload for success screen

Handle API failure states gracefully with:

* inline error banner
* retry option
* no silent loss of form state

---

## Suggested Component Structure

```txt
CreateOfferVoucherWizard
  StepProgress
  WizardCard
  Step1OfferDetails
    OfferNameField
    OfferDescriptionField
    CategoriesSelect
    PhotoUploader
  Step2Pricing
    CurrencySelect
    PriceField
    UnitField
    QuantityField
    FrequencyField
  Step3Voucher
    VoucherExplainer
    VoucherSummary
    VoucherNameField
    ShopDescriptionField
    VoucherValueField
    AdvancedVoucherSettings
  Step4Confirm
    PublishSummaryCard
    ConsentCheckboxes
    PublishButton
  SuccessScreen
    SuccessSummaryCard
    NextActionCards
```

---

## Design Requirements

* Use a modern soft UI style
* White cards on light neutral background
* Rounded corners
* Thin subtle borders
* Small explanatory callout boxes with icon
* Strong spacing rhythm
* Sticky footer CTA on mobile if helpful
* Inputs should feel accessible and calm, not crowded
* Use green as the positive/progress/publish accent
* Primary CTA should be visually strong, but disabled states must be obvious

---

## Copy Tone

Use language that is:

* warm
* practical
* not overly technical
* confidence-building
* oriented toward local merchants and first-time sellers

Avoid jargon unless paired with explanation.

---

## Edge Cases

* User has no shop name yet → generate generic voucher name, allow edit
* User skips categories → allow progression
* User uploads image late or replaces image
* User changes currency after voucher step → voucher currency should update unless manually overridden
* User changes offer price after voucher defaults created → prompt whether to sync voucher value
* User chooses expiring/decaying voucher → reveal additional settings and validate them
* Publish partially succeeds → show recoverable error and prevent duplicate creation

---

## Acceptance Criteria

1. User can complete the full 4-step flow on mobile without confusion.
2. Required fields are validated before progression.
3. All entered data persists between steps.
4. Voucher defaults are intelligently derived from prior inputs.
5. Publish creates both voucher and first offer.
6. Success screen clearly explains what was created.
7. Flow is polished, production-ready, and accessible.
8. UI closely matches the provided screenshots in structure and feel, while improving consistency and implementation quality.

---

## Implementation Notes

Please implement:

* the full UI flow
* form state management
* validation schema
* image upload component
* step navigation
* derived/default field logic
* success state
* loading, error, and disabled states

Tech preference:

* React / Next.js
* TypeScript
* TailwindCSS
* shadcn/ui or similar component primitives
* react-hook-form + zod preferred



