# **App Name**: Pricing Intelligence Ensemble

## Core Features:

- Enhanced UI Design: A clean UI layout based on the reference design.
- Analysis Display: Displays analysis and synthesized price recommendation from the personas.
- AI-Powered Tier Pricing: Leverages Gemini API to fetch company information for tier-based pricing. Acts as a tool to retrieve external data for analysis.
- Multi-Persona Analysis: Uses AI personas (Market Analyst, Value Engineer, Quantitative Analyst, Head of Pricing) to generate price estimations and syntheses.
- Backend Logic Migration: Refactors current frontend logic to run in Firebase Cloud Functions for backend processing.
- Firestore Integration: Firestore database integration to store company tier information. Replaces hardcoded data with dynamic database lookups.
- Error Handling & Rate Limiting: Utilizes exponential backoff retry mechanism to handle Gemini API rate limits and transient errors, ensuring robustness.

## Style Guidelines:

- Primary color: Vivid teal (#17D8B1), associated with the Market Analyst persona, representing growth and market trends.
- Accent color: Deep violet (#8A49AF), associated with the Quantitative Analyst persona. Used for highlighting important insights from consumer psychology.
- Secondary color: Indigo (#5E65EF), linked to the Value Engineer persona, signifying strategic value and financial insights.
- Background color: Dark charcoal (#212529) to give the app a modern, sophisticated feel, ensure good readability and contrast.
- Body and headline font: 'Inter', a sans-serif font known for its modern and neutral design.
- Custom icons representing each AI persona (Market Analyst, Value Engineer, Quantitative Analyst, Head of Pricing).
- Layout should follow the attached image crops, it should have multi-frame design that would show a flow for user. The Layout consist of Analysis Results that displays key metrics and recommended pricing.