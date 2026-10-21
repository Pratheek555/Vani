# Vani: Product & Build Plan

> Keiki x Maritime competition. Week 1 runs Oct 19–25, 2026. The top 30 teams advance after week 1.
> Builder: solo. Goal for week 1: a demo-able MVP that real families can use.

---

## 1. The problem

Indian students abroad still handle a lot of home logistics from far away. Mom needs her BP tablets refilled. Papa can't work out the grocery app. A lab report arrives and nobody explains it. A doctor's visit happens and nobody prepares the questions. Today the student does all of this over WhatsApp calls at 2 AM their time.

**Vani is an errand runner and care assistant that lives in the family WhatsApp or iMessage group.** Parents ask in plain English. Vani gets it done, keeps the student informed, and only escalates when a human really needs to decide.

## 2. Users & roles

| Role | Who | What they do with Vani |
|---|---|---|
| **Owner** | The student abroad | Sets up Vani, sets approval policy, gets digests and alerts, approves spend (if configured) |
| **Parent** | Mom / Dad in India | The main requesters: errands, medicines, reports, questions |
| **Member** | Siblings, relatives, local helper | Optional. Can be the "right person" to alert, can approve or receive deliveries |

v1 is **English only**, text plus photos (photos of lists, prescriptions, medicine strips, reports).

## 3. v1 scope

> **Locked on Oct 19, 2026.** All six items below are confirmed for v1, health layer included. Don't change scope without asking.
> - Onboarding takes a few taps, and a non-technical parent must be able to finish it.
> - Medicines use the same pipeline as groceries (text or photo → cart → approval → order → tracking). On top of that they get two things: a prescription check, and refill forecasting with proactive nudges.
> - **Open question: how Vani pays autonomously.** See §5.

### In scope
1. **Zero-friction setup in family groups.** Add Vani to an existing WhatsApp or iMessage group and it onboards everyone in under 5 minutes.
2. **Errand runner: groceries.** **Swiggy Instamart** through Swiggy's official MCP server (decided Oct 21, 2026). Zepto is the candidate second vendor.
3. **Errand runner: medicines.** Tata 1mg / PharmEasy / Apollo 24|7 (pick 1 for MVP).
4. **Medicine manager.** Regular medications registry, run-out forecasting, proactive refills.
5. **Health & medical support layer.** Lab report explanation, doctor-visit prep, red-flag escalation, medical record vault.
6. **Family loop.** Proactive alerts to the right person, plus a daily/weekly digest to the owner.

### Out of scope for now
- Fitness device and wearable ingestion (explicitly deferred)
- Voice notes, Hindi and regional languages (deferred; English only for MVP)
- Government paperwork (passport, Aadhaar, etc.). The **Task engine** below is built to support it later.
- Native mobile apps

## 4. Core experiences

### 4.1 Setup: "add Vani to the group"
1. The student signs up on a simple web page (or messages Vani directly) and gets Vani's WhatsApp number / iMessage contact.
2. The student adds Vani to the existing family group.
3. Vani introduces itself in the group in one short message. It confirms who is who (based on group participants) and asks for the family's city/pincode.
4. Vani **DMs each parent** to collect private details over time, not all at once: delivery address, regular medicines (via photo of strips or prescription), preferred pharmacy and grocery app.
5. Vani **DMs the owner** to set up the approval policy (§5) and link vendor accounts (§6.3).
6. Done. Everything after that is progressive: Vani learns preferences ("usual milk = Amul Taaza 1L") from real usage.

**Setup success metric:** from "added to group" to first useful action in under 5 minutes, with zero forms for parents.

### 4.2 Group vs DM behavior (hybrid)
- **In the group, Vani listens and chimes in** when it can clearly help. Examples: an appointment is mentioned, a medicine is running out, someone asks a question nobody has answered. It keeps group messages short and rare.
- **Detailed work moves to DMs.** Cart reviews, OTPs, addresses, health details, and approvals happen privately with the relevant person.
- **Chime-in guardrails:** at most one unprompted group message per topic. Never repeat itself. Never interrupt personal or emotional conversations. A family-level "quiet mode" switch is available.
- Health information is **never posted in the group** unless that parent has said it's okay.

### 4.3 Errand: groceries
```
Parent: "Need milk, atta 5kg, and the usual vegetables"
  → Vani resolves items against the family's "usual" list + preferences
  → Builds the cart on Instamart through Swiggy's MCP (owner's linked Swiggy account, parents' saved address)
  → DMs parent a short summary: items, total, ETA. Asks to confirm or edit
  → Applies approval policy (§5):
       prepare mode   → Swiggy UPI payment link sent to the approver (default)
       autonomous mode → cash on delivery or Swiggy Money, within limits
  → Tracks the order → tells parent the ETA → confirms delivery → logs it
  → Owner sees it in the digest (or a real-time alert if over threshold)
```
Inputs can be text, a **photo of a handwritten list**, or "same as last week".

### 4.4 Errand: medicines + medicine manager
- **Registry:** a parent sends photos of medicine strips or a prescription. Vani extracts drug, strength, dosage and quantity, then confirms with the parent. The prescription photo goes into the vault.
- **Run-out forecasting:** quantity ÷ daily dosage gives a run-out date. About 5 days before, Vani proactively asks: "Mom, your Telma 40 runs out Friday. Shall I reorder?"
- **Ordering:** same pipeline as groceries, with a pharmacy vendor. Prescription-only medicines need a valid prescription in the vault. If it's missing or expired, Vani asks the parent or alerts the owner. It never works around this.
- **Optional dose reminders** per parent, opt-in only.

### 4.5 Health & medical support layer
- **Lab report explainer:** a parent sends a photo or PDF of a report. Vani returns a plain-English summary, flags out-of-range values with context ("slightly high, common, mention to doctor"), and tracks trends over time. It also suggests "questions to ask your doctor."
- **Doctor-visit prep:** when an appointment is mentioned, Vani creates a Task. Before the visit it sends a checklist (reports to carry, current medicine list, questions). After the visit it asks for the new prescription and updates the registry.
- **Red-flag escalation:** if a symptom message is concerning (chest pain, stroke signs, fall, very high or low readings), Vani tells the parent to seek emergency care now, shares local emergency numbers (112 / 108), and **immediately alerts the owner and the nearest Member.** It does this regardless of quiet mode.
- **Medical vault:** prescriptions, reports and discharge summaries, retrievable on request ("send Papa's last HbA1c report to Dr. Rao").
- **Hard boundaries:** no diagnosis, no dosage changes, no stopping or starting medication. Vani always defers to a doctor and says so plainly.

### 4.6 Family loop
- **"Alert the right person":** each Task has an escalation chain (parent → owner → nearby member). The family policy (§5) decides who gets what.
- **Owner digest:** a daily or weekly summary of orders, spend, upcoming refills, appointments and anything flagged. Delivered at a sensible hour in the owner's timezone.

## 5. Approval policy (configurable per family)
Set up during onboarding and editable by chat ("Vani, let Mom approve groceries under ₹2000").

```ts
type ApprovalPolicy = {
  categories: Record<'groceries' | 'medicines' | 'other', {
    mode: 'prepare' | 'autonomous';     // human pays vs agent completes
    approvers: MemberId[];              // who can approve
    autoApproveUnderINR?: number;       // skip approval below this amount
    monthlyCapINR?: number;             // hard cap for autonomous spend
    notify: MemberId[];                 // FYI recipients
  }>;
  approvalTimeoutMins: number;          // escalate to next approver after this
};
```
- **Prepare mode (default):** Vani builds the cart and the approver pays via a link or UPI collect. No stored payment credentials.
- **Autonomous mode:** Vani completes checkout using **cash on delivery or a prepaid vendor wallet**, within per-order and monthly caps. Raw card numbers and UPI PINs are never stored. If a checkout hits an OTP, 3DS or UPI prompt, Vani falls back to prepare mode.
- Every spend is logged and visible to the owner.

### 5.1 Open: autonomous payment (decide by Day 5)
Options, cheapest first:
1. **Cash on delivery.** No credentials are involved, and Vani just places the order. This depends on the vendor and pincode, and a parent has to be home with cash.
2. **Prepaid vendor wallet** (e.g. Zepto Cash or a store wallet). The owner tops it up and Vani spends from the balance without an OTP. Each vendor is a separate wallet, and topping up still needs a human.
3. **UPI Circle (delegated UPI).** A parent or the owner delegates a monthly limit to a secondary UPI user. *Verify this:* it delegates to a person's UPI app, and it probably can't delegate to a bot.
4. **Vani holds the money and pays** (collect money from the owner, then pay the vendor). This likely needs RBI payment-aggregator rules and a licensed partner. **Out of scope for the MVP.**

Leaning toward **1 + 2 for the MVP**, with prepare mode (payment link to the approver) as the default fallback.

For groceries, Instamart's checkout already offers both: `Cash` (option 1) and `SwiggyPay`, its Swiggy Money wallet (option 2).

## 6. Architecture

### 6.1 Split: Keiki front, Maritime brain
```
 WhatsApp / iMessage groups & DMs
            │
     ┌──────▼───────┐
     │    KEIKI     │  channels, conversation memory, persona,
     │ (Vani agent) │  approvals UI, handoff, LLM reasoning
     └──────┬───────┘
            │ tool calls (HTTP)          ▲ proactive messages
     ┌──────▼─────────────────────────────┴──┐
     │        VANI CORE  (on Maritime)       │
     │  TypeScript / Node                    │
     │  • Family/Member/Policy store         │
     │  • Task engine (state machine)        │
     │  • Medication registry + forecaster   │
     │  • Scheduler (refills, reminders,     │
     │    digests, approval timeouts)        │
     │  • Vendor adapters (Playwright)       │
     │  • Document vault + extraction        │
     └───────────────────────────────────────┘
```
- **Keiki** handles everything conversational: understanding requests, the persona, group/DM delivery, memory, and approval prompts.
- **Vani Core** handles everything stateful, scheduled or long-running: the source of truth for families, tasks, meds, orders, and browser sessions. It's exposed to Keiki as a set of tools.
- **Proactive outbound** (refill nudges, digests, escalations) starts in Vani Core's scheduler and is delivered through Keiki's outbound messaging API.

### 6.2 Domain model (initial)
- `Family` (id, timezone(s), city/pincode, policy, quietMode)
- `Member` (id, familyId, role: owner|parent|member, channel handles, timezone, address, consentFlags)
- `Task`: the general errand primitive. Fields: type, status, owner, assignees, checklist[], dueAt, escalationChain, linked docs. Types: `grocery_order`, `medicine_order`, `doctor_visit`, `report_review`, later `govt_paperwork`.
- `Order` (taskId, vendor, items, total, status, paymentMode, approvals[])
- `Medication` (memberId, name, strength, dosagePerDay, qtyOnHand, lastFilledAt, rxDocId, rxRequired)
- `Document` (memberId, kind: prescription|lab_report|discharge|other, file, extracted JSON, date)
- `PreferenceItem` ("usual" items per family: canonical name → vendor SKU)
- `AuditLog` (every action, spend and data share)

### 6.3 Vendor adapters
- One adapter per vendor behind a common interface: `search`, `addToCart`, `getCart`, `checkout(mode)`, `trackOrder`.
- **Account linking:** the vendor login OTP goes to the parent's phone, so Vani DMs the parent: "Please forward the 6-digit code you just got." The session is kept in the Maritime VM (encrypted at rest) to keep re-logins rare.
- Treat adapters as brittle. Use screenshot + DOM fallbacks, alert loudly on failure, and degrade to "here's a ready-made list and a deep link" if automation breaks.
- Keiki's built-in browser automation is an alternative. Choose per vendor after the day-0 spike.
- **Instamart (decided Oct 21, 2026):** the adapter is an MCP client for `mcp.swiggy.com/im`, not browser automation. The owner links their own Swiggy account once with OAuth (phone + OTP on Swiggy's page), so no OTP is relayed through chat. API details are in `CLAUDE.md`.

### 6.4 Stack
- TypeScript (strict), Node LTS, pnpm
- HTTP: Hono (or Fastify)
- DB: SQLite + Drizzle for the MVP (Maritime VMs keep files). Postgres later.
- Browser: Playwright
- Scheduling: an in-process job runner backed by the DB (we can, because the Maritime agent wakes on webhook/timer)
- Validation: zod for all tool inputs and outputs

## 7. Safety, privacy, trust
- **Consent:** each parent explicitly opts in (in DM) before Vani stores their health data. Comply with India's DPDP Act. Data deletion on request.
- **Health boundaries** as in §4.5. Red-flag escalation always fires.
- **Group privacy:** health and financial details only in DMs.
- **Money:** policy caps, audit log, no stored card or UPI secrets, fallback to human approval.
- **Scam shield (cheap win):** if a parent forwards a suspicious "KYC expiring / electricity cut" message, Vani flags it. Optional and low effort.

## 8. Week-1 build plan (solo)

| Day | Date | Goal |
|---|---|---|
| 0 | Sun Oct 19 | Sign up for Keiki + Maritime. **Capability spike** (see §9 risks): Keiki in a WhatsApp group? iMessage group? Custom HTTP tools? Proactive outbound API? Media (images/PDF) passed to tools? Deploy hello-world Vani Core on Maritime and call it from Keiki. |
| 1 | Mon Oct 20 | Domain model + DB. Onboarding flow (group intro → parent DMs → owner policy DM). Persona and system prompt in Keiki. |
| 2 | Tue Oct 21 | Grocery adapter #1 (end-to-end in prepare mode). Cart summary + approval flow. "Usual items" memory. |
| 3 | Wed Oct 22 | Medicine registry from photos, run-out forecaster, scheduler, proactive refill nudge. Pharmacy adapter #1. |
| 4 | Thu Oct 23 | Health layer: lab report explainer, doctor-visit Task + checklist, red-flag escalation, vault retrieval. |
| 5 | Fri Oct 24 | Autonomous mode (COD/wallet + caps). Owner digest. Group chime-in tuning + quiet mode. |
| 6 | Sat Oct 25 | Onboard 2–3 real families (own family first). Fix the rough edges. Record the demo. |

**Cut order if behind:** autonomous mode → second vendor → doctor-visit prep → digest. **Never cut:** setup flow, one end-to-end grocery order, medicine refill nudge, red-flag escalation.

## 9. Risks & open questions to verify on day 0
1. **WhatsApp group support.** The WhatsApp Business API has historically limited bots in groups. Confirm exactly what Keiki supports on WhatsApp and iMessage groups. Fallback: a group-like experience via a broadcast to each member's DM.
2. **Keiki ↔ external backend.** Confirm custom tools can call our Maritime HTTP endpoints. Confirm we can push proactive outbound messages to a group or DM, and how media attachments reach our tools.
3. **Vendor automation.** Bot detection, OTP logins and pincode serviceability on Blinkit/Zepto/1mg. Have a deep-link fallback ready.
4. **Payments in autonomous mode.** COD availability varies by vendor and pincode, and wallet top-up still needs a human.
5. **Timezones.** Owner (e.g. PST) vs parents (IST). Proactive messages must respect quiet hours for both.

## 10. Demo story (for judges)
1. The student adds Vani to the real family WhatsApp group. Vani onboards Mom and Dad in about 3 minutes.
2. Mom sends a photo of a handwritten grocery list. Vani builds an Instamart cart, Mom confirms, the student approves and pays with a UPI link, and the order is placed and tracked.
3. Vani notices Dad's BP medicine runs out in 4 days (from a strip photo on setup) and proactively offers a refill. Dad says yes and it's ordered.
4. Mom sends a blood test report. She gets a plain-English summary, the student gets an FYI, and Vani adds a "discuss with doctor" checklist for her appointment next week.
5. Dad mentions dizziness and chest pain. Vani gives emergency guidance right away and alerts the student and the cousin nearby.

## 11. Success metrics (week 1)
- Time from adding Vani to the first useful action: under 5 min
- At least one real end-to-end order per test family
- Refill nudges sent before the actual run-out: 100%
- Zero health or financial details leaked into group chats
