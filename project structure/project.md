Medical App — Free-Tier Dev/Debug Setup
Companion to the main system design. Same sections, same build order — this doc only swaps in the free/test-mode version of every service so you can build and fully test through Section 8 without spending money. Switch to paid/live keys only at production launch.

Core Principle
Every service in the original stack has a free or sandbox mode. Use it everywhere during dev. Nothing below requires a credit card except Google Cloud (for the $200 free Maps credit — card required but not charged if you stay under it, and you'll set a budget alert).

Section 1 — Auth & User Roles (Free setup)
Need	Free/Dev option	How
Phone OTP login	Firebase Auth Test Phone Numbers	In Firebase Console → Authentication → Sign-in method → Phone → add test numbers (e.g. +1 650-555-1234 → OTP 123456). No real SMS sent, no cost, works exactly like production in your app code.
User DB (users, roles, profiles)	Firebase Firestore free tier	1 GiB storage, 50K reads/20K writes per day free — more than enough for dev.
Doctor KYC file upload	Firebase Storage free tier	5 GB storage, 1GB/day download free.
Action: Set a Google Cloud budget alert at $1 on this project right now, before building anything, so you get emailed instead of silently billed.

Section 2 — Doctor Discovery (Free setup)
Need	Free/Dev option	How
Doctor search/filter	Firestore queries	Free tier covers this fully in dev
City-based matching	Skip live geocoding — use a plain city dropdown/text field at signup instead of Google Places autocomplete	Zero API cost, and honestly fine for MVP too
Clinic address (if you want map pins)	Google Maps Platform $200/month free credit	Set budget alert at $5 on this too. Use sparingly — only call Places API when testing the actual booking flow, not on every screen reload
Section 3 — Online Consultation (Free setup)
Need	Free/Dev option	How
Chat	Firestore real-time listeners	Free, no separate service needed
Video/Voice call	Agora.io free tier	10,000 minutes/month free — forever, not a trial. Sign up, use test App ID + temp token for dev. This alone should cover your entire dev/testing phase.
File upload (reports, X-rays)	Firebase Storage free tier	Same 5GB bucket as Section 1
E-prescription	Firestore document	Free, just structured data
Section 4 — Appointment Booking (Free setup)
Need	Free/Dev option	How
Slot calendar	Firestore	Free
Payment at booking	Stripe Test Mode or Razorpay Test Mode	Use test publishable/secret keys. Test card 4242 4242 4242 4242 (Stripe) works for unlimited fake transactions. Never touches real money until you swap to live keys.
Booking reminders	FCM	Completely free, no tier limit
Section 5 — Vitals & Exercise (Free setup)
Need	Free/Dev option	How
Vitals log	Firestore	Free
Step/calorie sync	Google Fit API / Apple HealthKit	Both free — no billing tier at all, just OAuth setup
Charts/trends	Client-side (fl_chart or syncfusion_flutter_charts free tier)	No backend cost, computed in-app
Section 6 — Blood Donation (Free setup)
Need	Free/Dev option	How
Donor DB + requests	Firestore	Free
Proximity matching	Compute distance client-side/in a Cloud Function using lat/lng (Haversine formula)	No paid geo-service needed — you don't need PostGIS or a maps API for basic radius matching
Notify nearby donors	FCM	Free
Section 7 — AI Voice/Chat Assistant (Free setup)
Need	Free/Dev option	How
Chat UI + flow building	Mock responses — hardcode a local JSON of sample AI replies	Build and test the entire UI/UX without calling any paid API
Real AI responses (once UI is ready)	Anthropic/OpenAI free trial credit (one-time, new accounts)	Use small test prompts only, not full chat sessions, to stretch it through dev
Voice input	speech_to_text Flutter package	Free, on-device, uses OS speech recognition — skip Whisper API entirely in dev
Voice output	flutter_tts package	Free, on-device
Section 8 — Notifications, Payments, Ratings (Free setup)
Need	Free/Dev option	How
Push notifications	FCM	Free, unlimited
Payments	Stripe/Razorpay test mode	Covered in Section 4
Ratings/reviews	Firestore	Free
Backend hosting (if you don't go full-Firebase)
If any section needs custom server logic beyond Firebase Cloud Functions:
Option	Free tier
Render.com	Free web service tier (spins down when idle — fine for dev)
Railway.app	Small free monthly credit
Run locally	Simplest — just run your Node/Django server on your own machine while building, point Flutter at localhost or a tool like ngrok for device testing
What to switch when you go to production
Service	Dev (now)	Production (later)
Firebase Auth	Test phone numbers	Real SMS (starts costing per OTP)
Agora	Free 10K min/month	Still free up to 10K min — only pay past that, so this may stay free even in early production
Stripe/Razorpay	Test keys	Live keys (2-3% per transaction)
AI API	Free trial credit	Paid usage (budget per conversation)
Google Maps	$200 free credit	Same credit applies — monitor usage
Bottom line: with Firebase (Auth + Firestore + Storage) + Agora free tier + Stripe/Razorpay test mode + mocked AI responses, you can build and fully test Sections 1 through 8 at $0 cost, with the only real spend starting once you flip live keys at launch.





￼
