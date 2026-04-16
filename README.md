Persona

The Product Buyer
 
Purchase specific, verified

Ayurvedic medicines and

supplements.

Goal

A. Onboarding & Diagnostics

●
 
As a new user, I want to securely sign up using my Google account so I can quickly

access the platform.

●
 
As a user, I want to complete the
 
Prakriti Assessment
 
so I can understand my

dominant Ayurvedic body type Vata, Pitta, Kapha).

●
 
As a user, I want to use the
 
Symptom Checker
 
for sleep disorders so I can receive

immediate, natural remedies and cures.

●
 
As a user, I want the system to automatically recommend Ayurvedic products and

diet plans that align with my Prakriti and specific symptoms.

B. Services & Booking

●
 
As a user, I want to browse available Doctors and view their qualifications and

specialization so I can book an informed appointment.

The Admin

The Blog Writer

Manage user accounts, doctor

profiles, product inventory, and

site settings.

Publish high-quality, engaging,

and SEO-optimized wellness

content.

3. User Stories
User Profile Creation

Feature

Secure Authentication

Collect essential user data

upon registration.

Description

Allow users to create an

account and log in securely.

●
 
As a user, I want to easily book and pay for a consultation slot with a Doctor.

●
 
As a user, I want to easily book and pay for a consultation slot with
 
the

Panchkarma.

●
 
As a user, I want a dedicated section showing Diet tips tailored specifically to my

body type.

C. ECommerce & Content

●
 
As a user, I want to search and filter Ayurvedic products based on my hair health

Prakriti.

●
 
As a user, I want a secure checkout process that accepts major cards and UPI so I

can purchase my products easily.

●
 
As a user, I want to track the status of my order and view my past purchase

history.

●
 
As a user, I want to access a blog and podcast section for educational content

about Ayurvedic practices and wellness.

Functional Requirements

Support Sign-up/Login via

Email/Password, Phone/OTP,

and
 
Google OAuth
. Implement

secure password hashing (e.g.,

bcrypt).

Capture Name, Email, Mobile

Number, Gender, Age, and

initial basic health data (opt-in).

4. Detailed Feature Specifications

A. Onboarding & Authentication
C. Services & Booking

B. The "Prakriti" & Diagnostic Engine

Symptom Checker

Feature

Prakriti Assessment

Feature

Doctor's Appointments

Personalized

Recommendation Algorithm

Description

Platform to manage

patient-doctor interactions.

Functional Requirements

1. Dedicated directory with

Doctor profiles, qualifications,

and patient ratings. 2.

Real-time availability calendar

for booking slots. 3. Integrated

payment handling for

consultation fees.

Description
 
Functional Requirements

A mandatory, multi-step quiz to 1. Quiz flow with 2030

determine the user's Vata,

Pitta, Kapha profile.

The
 
assessment
 
will
operate through predefined
multiple-choice
 
questions
and
 
option-based
 
flows
(not
 
a
 
conversational
chatbot).

questions covering physical,

mental, and emotional

characteristics. 2. Store and

display the resulting Prakriti

(e.g., Vata-Pitta) on the user's

dashboard.

Allow users to select

symptoms (e.g., Difficulty

falling asleep, daytime fatigue,

high stress). Output immediate,

non-product-based "Remedies

& Cures" (e.g., herbal tea,

meditation).

If
 
Prakriti = Vata)
 
AND

Symptom = Sleep disorder),

Then
 
display
 
Product A
,
 
Diet

Tip B
, and
 
Blog Post C
. The

algorithm must prioritize

personalized

recommendations.

A guided assessment for

specific lifestyle issues.

System logic that drives

product and content visibility.
Feature

Product Catalog

Feature

Diet & Lifestyle Sections

Order History & Tracking

Shopping Cart & Checkout

Payment Gateway Integration

User self-service for

post-purchase actions.

Description

Display and organization of

sellable items.

Standard e-commerce flow.

Process financial transactions

securely.

Description

Categorized content areas for

health guidance.

Functional Requirements

Dedicated sections for: "
Diet

tips for you
" (personalized

based on Prakriti), "
Seasonal

Diet Tips
," "Weight

Management," and "Balance

your Chakras.ˮˮ with Admin

Access only.

Functional Requirements

Categorization for: Ayurvedic

medicines, hair care, health

supplements. Must include

detailed product descriptions,

ingredients, pricing, and stock

status.

Allow users to add/remove

products, adjust quantities, and

proceed to a secure multi-step

checkout process.

Integration with a major

third-party payment gateway

(e.g., Stripe/Razorpay). Must

support Major Credit/Debit

Cards and UPI.

Users must be able to view

their entire order history and

track the current shipment

status of active orders.

D. ECommerce Store
E. Content Hub

Scalability

Feature

Blog Section

Performance

"About Us" Page

Requirement Type

Security

Podcast Player/List

Mobile Responsiveness

Description

Educational articles.

Static informational page.

Audio content for wellness.

Requirement

High-level encryption (e.g.,

HIPAA/GDPR compliance

standard) for all user health

data and profiles.

Assessment engine must load

and process results within 3

seconds. Overall platform load

time should be below 2

seconds.

The platform must be able to

support up to 100,000 active

users within the first year.

The entire UI/UX must be fully

responsive and work

seamlessly on mobile browsers

(iOS/Android).

High

High

Critical

Priority

Critical

Functional Requirements

Content Management System

CMS integration for

publishing, categorizing, and

searching articles.

Embedded audio player

functionality or linked list of

external podcast episodes.

Static page detailing the

mission, vision, and team

behind Nouryum.

5. Technical & Non-Functional Requirements
Constraints

Category

Assumptions

Assumptions

Requirement Type

Integration

Item

A robust CMS is available for

managing the Blog content.

We will secure a partnership

with a reliable Payment

Gateway provider before the

Date launch date.

Initial launch will only support

payments in INR; international

transactions are out of scope

for Phase 1.

Requirement

Secure API integration for

Payment Gateway.

Priority

High

These Key Performance Indicators KPIs will be used to measure the success of the

Nouryum platform.

●
 
User Engagement:
 
Percentage of users who complete the Prakriti Assessment.

●
 
Personalization Efficacy:
 
Conversion Rate CR of recommended products

Target: 15% CR for products displayed on the user's dashboard).

●
 
Revenue:
 
Total value of products sold through the ECommerce Store Target: $X

revenue per month).

●
 
Service Adoption:
 
Number of Doctor Appointments booked per month Target:

50 bookings).

●
 
User Satisfaction:
 
Net Promoter Score NPS for the platform Target: 50.

●
 
Retention:
 
Monthly Active Users MAU vs. Registered Users.

To simplify regulatory and

compliance requirements for

the initial launch.

Rationale

We will not build a custom

CMS; we will use an existing

solution (e.g., Headless CMS

{free}).

The ECommerce function is a

core objective and relies on

this integration.

6. Success Metrics KPIs

7. Assumptions & Constraints
Advance
Payment

Category

Constraints

Intermediate

Payment

Total Project

Value

8.1. Project Value

Term
 
Value

30%

40%

₹17,000 INR

Seventeen Thousand

Indian Rupees)

Rs. 5,100

Rs. 6,800

Notes

Item

Integration with Electronic

Health Records EHR is out of

scope. User health data is

stored within the Nouryum

database only.

8.2. Payment Schedule

The Client agrees to adhere to the following payment schedule:

Milestone
 
Percentage
 
Amount

INR

Due Date / Trigger

Due immediately upon signing this

document.

Covers Design, Development, and

Deployment as defined in this PRD. No

Hidden Charges

Secondary Payment mid development

Rationale

Reduces immediate security

and regulatory complexity.

8. Commercial Terms & Legal Clauses
Final Payment
 
30%
 
Rs.5,100
 
Due upon completion of development and

before final code handover.

8.3. Critical Legal Clauses & Scope Limitations

A. Company Registration Guidance Only):

The Service Provider agrees to provide
 
consultation and procedural guidance
 
to assist

the Client in registering "Nouryum" as a legal business entity.

●
 
Limitation:
 
This service is strictly limited to advisory support. The Service Provider

is
 
not
 
responsible for filing legal documents, visiting government offices, or acting

as a legal representative.

●
 
Costs:
 
All government filing fees, stamp duties, CA charges, and legal

documentation costs are
 
excluded
 
from the Project Value and must be paid

directly by the Client.

●
 
Non-Disclosure Agreement:
 
The service providers must make sure that the

ideation and company details important confidential information is not disclosed to

anyone else.
B. Payment Gateway Integration:

The Service Provider will integrate
 
Razorpay MSME Gateway)
 
OR
 
CCAvenue Individual

Account)
 
into the platform.

●
 
Client Responsibility:
 
The Client is solely responsible for creating the merchant

account, completing the KYC Know Your Customer) process, and securing

approval from the gateway provider.

●
 
Credentials:
 
The Client must provide valid API Keys/Credentials to the Service

Provider to enable integration.

●
 
Delays:
 
Any delay caused by the Payment Gateway provider in approving the

Client's account shall not be considered a delay on the part of the Service

Provider.

C. Payment & Exclusions:

The Total Project Value of
 
₹17,000 INR
 
covers development labor only. It explicitly

excludes
 
all third-party costs, such as:

● Payment Gateway setup or transaction fees.
Developers Signature

Name:
 
Yash
 
Dangi
 
Title:

Project
 
Lead
Documentation
 
Date:
 
08th
February,2026

Client Signature

Name:
 
________________________

Title:
 
_________________________

Date:
 
_________________________

9. Acceptance and Signatures
 
By signing below, both parties acknowledge and agree

to the scope, exclusions, and

commercial terms outlined above.

Timeline Update: Stretch till April

## Development Setup

1. Create a `.env` file from `.env.example`.
2. Set your MongoDB connection string in `MONGODB_URI`.
3. Set your Gemini key in `GEMINI_API_KEY`.

Run locally:

```bash
npm.cmd install
npm.cmd run dev:backend
npm.cmd run dev:frontend
```

Or run both:

```bash
npm.cmd run dev:all
```

New AI-driven APIs:

- `POST /api/ai/search` for disease search insights and follow-up prompts
- `POST /api/ai/chat` for contextual chat assistance
- `POST /api/symptoms/generate-questions` for disease-specific dynamic question generation
- `POST /api/symptoms/analyze-disease` for answer-based remedies, diet tips, and product recommendations