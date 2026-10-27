export const POLICY_VERSION = "2026-10-27";
export const policyConsent = (role) => ({
  termsVersion: POLICY_VERSION,
  privacyVersion: POLICY_VERSION,
  employerTerms: role === "Employer",
  accepted: true,
});
export const policies = {
  terms: {
    title: "Terms & Conditions",
    intro: "Understand your responsibilities when using SkillStream.",
    path: "/termsAndCondition",
    sections: [
      [
        "Using SkillStream",
        "SkillStream provides job discovery, candidate profiles, recruitment tools and interview practice. These terms apply to your use of these services. Keep your account details accurate and your sign-in credentials private.",
      ],
      [
        "Candidate responsibilities",
        "Provide accurate profile, resume and application information. Complete assessments honestly and respect any instructions provided for the assessment. Job listings, practice feedback and assessments do not guarantee employment.",
      ],
      [
        "Employer responsibilities",
        "You must be authorized to act for your organization. Publish accurate job information and use candidate information only for legitimate recruitment. Do not resell candidate information, scrape profiles or use the service to discriminate unlawfully. Employers remain responsible for their hiring decisions.",
      ],
      [
        "AI and assessments",
        "AI-generated feedback, summaries and matching insights may be incomplete or incorrect. Review them alongside other relevant information and human judgment. Before a recorded assessment, review the notice for that experience and the information requested.",
      ],
      [
        "Paid services",
        "Review the price, included features and billing period displayed before purchasing. Candidate practice packs are one-time purchases. The one-month practice pass does not automatically renew. Employer plans have their own billing terms. Contact support with billing, cancellation or refund questions before purchasing if anything is unclear.",
      ],
      [
        "Content and acceptable use",
        "Only submit content you have permission to use. You retain your rights in your content and allow SkillStream to process it to provide the requested service. Do not upload malicious, abusive, misleading or infringing material, attempt unauthorized access or interfere with other users.",
      ],
      [
        "Access and service changes",
        "Features and availability may change. Access may be restricted where necessary to investigate misuse or protect the service and its users. Contact support if you believe your access was restricted in error.",
      ],
      [
        "Contact",
        "For questions about these terms, contact info@skillstreamjobs.us. The Privacy Policy explains how information is handled.",
      ],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "How information is handled across job search, hiring and interview practice.",
    path: "/privacyCenter",
    sections: [
      [
        "Information you provide",
        "Account and profile information can include your name, email, contact details, resume, work history, education and skills. Employers provide organization details, job postings and recruitment information. Support messages include the information you send us.",
      ],
      [
        "Practice and assessments",
        "Depending on the feature, interview and coding sessions process recordings, transcripts, answers, code submissions, assessment results and generated feedback. Employer assessments and personal practice are different experiences. Review the notice for the session and ask support if you are unsure who can access its results.",
      ],
      [
        "How information is used",
        "Information is processed to operate accounts, deliver job and recruitment features, provide interview practice and feedback, process purchases, respond to support requests and maintain the service.",
      ],
      [
        "Sharing and service providers",
        "Applications and employer-requested assessments involve sharing relevant information with the recruiting organization. Providers support hosting, file storage, authentication, payments and AI processing. External services linked from SkillStream have their own privacy notices.",
      ],
      [
        "AI processing",
        "Features may send relevant resumes, answers, transcripts or other inputs to AI service providers to produce analysis or feedback. Provider retention and processing depend on the service and configuration. Do not include unnecessary sensitive information in your submissions.",
      ],
      [
        "Account and payment information",
        "Payment services process checkout information. SkillStream uses payment and purchase records to provide access to purchased features. Sign-in and browser storage support authentication and account functionality.",
      ],
      [
        "Retention and your choices",
        "Retention depends on the type of information, the service being provided and applicable obligations. Contact info@skillstreamjobs.us to ask about access, correction, deletion, retention or other privacy requests. Request handling may require identity verification and depends on applicable law.",
      ],
      [
        "Contact and updates",
        "Send privacy questions to info@skillstreamjobs.us. This page will be updated when service practices change. Review the relevant notice before using features that request recordings or additional information.",
      ],
    ],
  },
  security: {
    title: "Security Center",
    intro: "Learn about account safety and how to report a concern.",
    path: "/securityCenter",
    sections: [
      [
        "Protect your account",
        "Use a strong, unique password and keep your credentials private. Sign out of shared devices and be cautious when opening unfamiliar links or attachments.",
      ],
      [
        "Recognize recruitment scams",
        "Check the identity of people contacting you. Be cautious about unexpected requests for money, passwords or sensitive documents, and verify unusual requests through a trusted contact method.",
      ],
      [
        "Protect personal information",
        "Share only the information needed for an application or assessment. Do not include passwords or payment details in support messages, public posts or interview answers.",
      ],
      [
        "Report a concern",
        "If you notice suspicious activity or a possible vulnerability, contact info@skillstreamjobs.us with a description of the issue. Avoid accessing other people's information or disrupting the service while reporting a concern.",
      ],
    ],
  },
};
