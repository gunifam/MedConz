# MedConz Product Requirements Document

**Feature:** Symptom Check, Health Timeline and Paid Consultation **Version:** 1.0 (first release) **Launch languages:** English, Hausa, Yoruba, Igbo

## 1. Overview

MedConz is an online, real-time medical consultation platform where anybody can speak to a doctor or dentist. This document describes the first feature set: a **symptom check** that prepares the patient and the doctor, a **health timeline** where patients keep their history, and **payment before consultation**.

## 2. Goals

- Help patients describe their problem quickly and be guided to the right doctor or dentist.
- Give doctors a clear summary so consultations start faster.
- Warn patients when something sounds like an emergency.
- Keep patient health information private, and keep patients in control of it.
- Make paying simple, clear and fair.

## 3. Who it is for

- **Patients:** anyone seeking care, including older people, people in pain, and people with weak phone connections.
- **Caregivers:** parents or relatives who seek care for someone else.
- **Doctors and dentists:** professionals who take consultations.
- **MedConz medical team:** doctors and dentists who approve the questions and safety messages.
- **MedConz top clearance staff:** a small group who can access held data.

## 4. The Patient Journey at a Glance

1. Patient signs up and agrees to the privacy promise once.
2. Patient sees a short welcome and a guided walkthrough (can skip).
3. Patient does the symptom check.
4. Patient reviews a summary and a doctor suggestion, and can edit.
5. Patient pays for the consultation.
6. Patient waits in line, and can leave and be called back.
7. Patient joins the consultation.
8. Patient receives a summary and next steps, saved to the timeline.
9. A day or two later, a short check-in asks how they feel.

## 5. Symptom Check

### 5.1 How the questions work

- The patient first types the problem in their own words.
- Most of the check is then tapping answers to follow-up questions that change based on what the patient said (for example, a toothache leads to questions about teeth and gums).
- The basics are required: what is wrong, how long, and how bad.
- Detailed follow-up questions can be skipped. A gentle reminder says answering helps the doctor help them faster.
- The emergency check always runs on whatever the patient enters.
- A friendly reminder at the start says honest answers help the doctor give proper care.

### 5.2 The end of the check

The patient sees:

- A summary of what they entered.
- A suggestion of the right kind of doctor or dentist.
- A way to edit any answer before it goes to the doctor.
- A clear note: "This is not a diagnosis. A doctor will review your answers."
- An emergency message if something serious was flagged.

### 5.3 Emergency warnings

When answers sound serious, the patient sees:

- A clear warning.
- Emergency numbers and nearby hospital suggestions for their location.
- The choice to continue to a doctor if they feel it is not an emergency.

The emergency message appears again at key moments: while waiting, if the patient feels worse, if a doctor drops out, and in the follow-up check-in. A patient is never blocked from seeing emergency information, even if their account has limits.

### 5.4 Caregivers and accessibility

- **Easy-to-read design** in the first release: larger text, clear colours, simple words.
- **Caregiver filling** in the first release. Parents of young children confirm with a tick box. For adults, the patient must approve the caregiver first or add them as a trusted caregiver in advance. Where an adult cannot agree for themselves, the caregiver says so and the record shows it. The caregiver's relationship to the patient is recorded and shown to the doctor, and the patient can see everything filled in for them.
- **Speaking answers aloud and having questions read out** in a later release.

### 5.5 Weak or lost connection

- Progress saves automatically and the patient continues where they stopped, with a message such as "Welcome back. You were on question 6 of 10."
- A friendly message says "Your connection is weak. Your answers are saved."
- Emergency messages and numbers show even without a connection.
- Patients are told they need a connection to speak to the doctor.
- Saved answers are protected on shared or borrowed phones.

### 5.6 Languages

- Launch in English, Hausa, Yoruba and Igbo, with more later.
- Someone with medical knowledge checks every question and emergency warning in each language.
- Patients can change language at any time without losing answers.
- Patients can write in their own words, including mixed languages and local terms.
- Doctors see a translated summary with the patient's original words beside it. A small note appears when a word may not translate well. Doctors can mark a translation as wrong with one tap.
- If doctor and patient cannot understand each other, the patient is offered a doctor who speaks their language where possible.

### 5.7 Welcome for first-time patients

A short welcome explains what the check is for, how long it takes, who sees the answers, that it is not a diagnosis, and what to do in an emergency. A guided walkthrough shows how the check, timeline and sharing work. It can be skipped, and the emergency note is always shown first.

## 6. Health Timeline

### 6.1 What it shows

- A visual timeline of symptom checks and consultations (including who the patient saw).
- Later releases add the doctor's notes and the patient's own entries.
- Each point can be tapped to see the full answers.
- Every entry has a delete option. Deleted entries leave the timeline and doctors' view right away.

### 6.2 Starting a new check

Patients can start a new check from the timeline with earlier details (such as allergies and ongoing conditions) already filled in. Each detail is shown with "Is this still true?" so patients confirm or update it.

### 6.3 Download and sharing

- Patients can download or print a copy.
- Patients can share with people they choose and can pick what to include (for example, only the last 6 months).
- Shared links need a code, expire after a time the patient chooses (default 7 days), and can be cancelled at any moment.
- Patients see a list of what they shared, with whom and when.
- The patient is alerted the first time a link is opened, with a one-tap "Cancel this link" button. Later openings appear in the sharing list.
- When a link expires or is cancelled, it shows only "This link is no longer available" and a "Request access" button. The patient sees who is asking and can approve or ignore. Requests are never approved automatically.
- Request numbers are limited, and patients can block people and unblock them later. Blocked people only see a neutral message.
- A short privacy reminder appears whenever a patient downloads or shares.

## 7. Payment Before Consultation

### 7.1 How it works

- Payment comes **after the symptom check and before the patient joins the line** for a doctor.
- The price is shown clearly before the patient pays, with no hidden charges.
- Patients choose how to pay from the payment options listed below.
- The patient gets a receipt, saved in their account.

**Payment currencies and options**

The price of a consultation is set in Nigerian Naira. At payment, the patient sees the price in three currencies and picks the one they want to use:

- **Nigerian Naira (NGN):** the main price, shown as the standard amount.
- **Espees:** shown at the fixed rate of 1 Espees = 2,050 Nigerian Naira. For example, a consultation priced at 4,100 Naira shows as 2 Espees. If this rate ever changes, the MedConz team updates it in one place, and the new rate shows to patients straight away.
- **Cryptocurrency:** the price is shown using the real-time market price, so the amount the patient pays matches the true value at that moment. The price refreshes while the patient is on the payment screen, and the patient is told clearly when it has updated.

Rules for all three options:

- The patient sees the exact amount to pay in their chosen currency before they confirm, with no hidden charges.
- A cryptocurrency price is held for a short, clearly shown time once the patient starts paying, so the amount does not change while they are completing the payment. If the time runs out, a fresh price is shown.
- The patient can switch between currencies on the payment screen and see the amounts change.
- The receipt shows the amount paid, the currency used, and the Naira value at the time of payment.
- Refunds follow the rules in the safety and fairness section below, and the patient is told in plain words what they will get back and in which currency.

### 7.2 Safety and fairness rules

- **Emergency information is never behind payment.** Emergency warnings, numbers and hospital suggestions are always free and always shown.
- **Payment does not buy a faster place in line.** Urgency and order of arrival decide the queue, as set out in section 8.
- **Automatic refund** if the patient is never connected to a doctor, if no doctor is available, or if the consultation cannot take place because of a MedConz or doctor problem.
- **No new charge** when a doctor drops out and the patient moves to another doctor. The patient is not charged twice for the same consultation.
- **Missed turn:** if the patient misses the call, they keep their answers and their payment, and can rejoin the line, book for later, or try again.
- **Feeling worse after the visit:** a short follow-up for the same problem soon after the visit does not need a new full payment. The exact window and rules will be set by the MedConz team and shown to patients clearly.
- Patients can ask for a refund if something went wrong, and are told the outcome in plain words.
- A caregiver can pay for the patient.
- Payment details are protected and are not shown to doctors.

## 8. Waiting and the Doctor Queue

- Urgent cases are moved forward, and everyone else is seen in the order they joined. Patients see updates such as "About 8 minutes" and are told honestly if the wait grows.
- Wording stays kind and neutral: "We are seeing some patients first based on their answers."
- A patient who has waited long is never pushed back again and again. A doctor can move a patient up or down.
- A patient who says they feel worse after a visit moves forward, but never ahead of a possible emergency.
- While waiting, patients can leave and be called back without losing their place, add to their answers (shown to the doctor as "added while waiting"), read simple health tips, and prepare questions. An "I feel worse" button is always available.
- Waiting patients are called with a notification showing "Your doctor is ready" and no health details on the lock screen. There is a "Join now" button, a second reminder, and a "Give me a minute" button that tells the doctor the patient is coming.
- If the patient does not answer, they keep their answers and choose to rejoin the line, book for later, or try again. An "I'm here, give me a minute" button gives a short grace period.

## 9. The Doctor's Side

### 9.1 Seeing waiting patients

- A list with clear flags for warning signs and "feeling worse".
- Filters for type of problem, language, and new or returning patient.
- Patients are matched automatically to the right doctor or dentist, and the doctor can change the match.
- Before accepting, the doctor sees only the main problem, flags and language. Full answers appear after accepting.
- If no doctor accepts within a reasonable time, the case is offered to another matching doctor.

### 9.2 Before and during the consultation

- The doctor sees the summary, flagged concerns and the patient's relevant history. Patients cannot hide past details from the doctor they consult, but entries a patient deleted stay gone. Patients are told this at sign-up and before each consultation.
- Caregiver entries are clearly marked, with the caregiver's relationship.
- Doctors can send a quick request for more details. It appears in MedConz and as a notification, with a short time limit after which the doctor is told, so they can move on. Patients can answer in a few taps and have an "I need help" button.
- Doctors can mark a check as "seems inaccurate". The patient can see the flag and add an explanation. Repeated cases are reviewed by the MedConz team, who may limit access with a clear reason and a way to appeal. Emergency information is never limited.
- At the start of the consultation the patient sees a quick check of sound, camera and connection, a reminder that the doctor has their answers, and a privacy reminder. The patient can turn off the camera, or switch to chat or voice only.

### 9.3 Notes and summary

- Doctors type notes or tap ready-made options. MedConz drafts a summary that the doctor reviews and edits before the patient sees it.
- Doctors see the symptom check, timeline and flags beside the notes area. A short checklist of open flags appears before sending but never blocks the doctor.
- Doctors can mark parts of notes as "for me only".
- If a doctor cannot continue, the patient moves to the front of the queue, and the new doctor sees the symptom check, the notes and where the consultation stopped (only what was actually said or recorded). The patient is told kindly what happened.

## 10. After the Consultation

- The patient sees a short summary in plain words and their chosen language, with clear next steps, including warning signs that mean going to a hospital, and anything that needs an in-person visit.
- The visit is saved to the timeline.
- Next steps stay on the timeline. Patients can choose gentle reminders, such as "It is time to book your follow-up".
- A day or two later, a one-tap check-in asks "How are you feeling now?" (better, the same, worse). Patients can turn it off.
- If the patient says worse, they first see the emergency message, then a quick way to see a doctor again (ideally the same one). With their agreement, the doctor is told. They move forward in the queue, as in section 8.

## 11. Privacy, Consent and Data

### 11.1 Who can see what

- The patient, the doctor they consult, and future doctors can see symptom check answers.
- Patients agree once at sign-up. MedConz promises not to misuse information and to follow medical industry ethics. Patients are told their health information is strictly confidential and is used for quality checks and support only with their consent.
- A simple Privacy page lets patients withdraw consent later.

### 11.2 Doctor access and the access record

- Any doctor authorized by MedConz can access patient information.
- Every access is recorded: who, when and what was opened. Records cannot be deleted by anyone.
- Records say what was opened, not what was inside it.
- Doctors give a short reason when opening the record of a patient they are not currently treating.
- Patients can view the access record in plain words, for example "Dr. Ade opened your symptom check on 3 March".
- Patients get an alert for unusual access, and a "Report this" button on any entry.
- Reports and unusual access are reviewed by senior MedConz staff, and the patient is told what was found and what was done. Doctors who misuse access face real consequences.

### 11.3 Keeping and deleting data

- Patients choose whether to keep their history and can delete any or all of it.
- Deleted data leaves the patient's and doctors' view immediately, but is held for a defined period before permanent erasure. Only top clearance staff can access held data, and each access is recorded with the reason.
- The normal holding period is 6 months. It is extended only for a real reason, such as an open complaint or a legal requirement, and the patient is told why in plain words.
- Patients are told clearly at sign-up and when they delete something.
- Notes and summaries are visible only to the doctor and the patient's care team, and to a new doctor if one takes over.

## 12. Quality and Safety

- **Feedback:** after the consultation, patients can give a simple rating, a short comment, and a "this was wrong" button. Doctors can say whether the summary was useful. Feedback is optional and never blocks the patient.
- Safety-related flags are reviewed first, quickly.
- **Changing questions and doctor suggestions:** only the MedConz medical team and technical team together, with doctors and dentists approving every change. Changes to emergency warnings need two medical team members. Every change is recorded with who made it, who approved it and why. Outside doctors may be invited to review as MedConz grows.

## 13. Release Plan

**First release**

- Symptom check with emergency warnings, in four languages
- Easy-to-read design and caregiver filling
- Timeline with symptom checks and consultations
- Download, secure sharing and access requests
- Payment before consultation, with refunds
- Queue, waiting and call-back
- Doctor list, notes, summary draft and next steps
- Access record and data deletion with holding period
- Feedback and review process

**Later releases**

- Speaking answers aloud and having questions read out
- Doctor's notes and the patient's own entries on the timeline
- More languages
- Outside doctor review of questions
- Search and filters in the timeline, if patients ask for them

## 14. How We Will Know It Is Working

- Most patients finish the symptom check once they start it.
- Doctors say the summary helped them.
- Patients say the check was helpful and rarely tap "this was wrong".
- Emergency warnings are shown when they should be, with very few missed cases found in review.
- Waiting times stay short and patients rarely leave the line.
- Few refund requests, and refunds are handled quickly.
- Patients trust the privacy promise, shown by few privacy complaints and by patients keeping their history.

## 15. Decisions Still Needed Before Launch

- The consultation price and the exact rules for follow-up and refunds.
- Which cryptocurrencies to accept, how long a cryptocurrency price is held while the patient pays, and how refunds are handled for Espees and cryptocurrency (same currency, or Naira value at the time of payment).
- The exact holding period extensions and the follow-up check-in timing.
- The age at which a child starts to have a say over their own information.
- Medical record and data rules in each country where MedConz will operate, including Nigeria, to be checked with a legal adviser.
- Who the top clearance staff are, and how they are chosen.
