export interface RightCard {
  id: string;
  category: 'can_do' | 'cannot_do' | 'your_rights';
  title: string;
  summary: string;  // New: One-line summary
  content: string;
  legalBasis: string;
  legalBasisUrl?: string;
  priority: 'critical' | 'important' | 'info';  // New: Priority level
}

export interface QuickPhrase {
  id: string;
  situation: string;
  phrase: string;
  explanation: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  rightsCards: RightCard[];
  quickPhrases: QuickPhrase[];
}

// US AIRPORT CUSTOMS DATA
export const customsScenario: Scenario = {
  id: 'us-customs',
  title: 'US Airport Customs & Border Protection',
  description: 'Know your rights when entering the United States through airports',
  category: 'customs',
  
  rightsCards: [
    // WHAT CBP CAN DO
    {
      id: 'can-1',
      category: 'can_do',
      title: 'Request Travel Documents',
      summary: 'You must show passport and visa',
      content: 'CBP officers can request your passport, visa, and other travel documents. You must present these documents when entering the United States.',
      legalBasis: '8 USC § 1357 - Border Search Authority',
      legalBasisUrl: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title8-section1357&num=0&edition=prelim',
      priority: 'critical',
    },
    {
      id: 'can-2',
      category: 'can_do',
      title: 'Ask Questions About Your Trip',
      summary: 'Questions about purpose, duration, and accommodations are allowed',
      content: 'Officers can ask about the purpose of your visit, where you will stay, how long you plan to stay, and what you will be doing in the US.',
      legalBasis: '8 CFR § 235.1 - Examination Requirements',
      legalBasisUrl: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-235/section-235.1',
      priority: 'important',
    },
    {
      id: 'can-3',
      category: 'can_do',
      title: 'Search Your Baggage',
      summary: 'All luggage can be searched without warrant',
      content: 'CBP has authority to search all baggage, including checked and carry-on luggage, without a warrant or probable cause.',
      legalBasis: '19 USC § 1582 - Search of Persons and Baggage',
      legalBasisUrl: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title19-section1582&num=0&edition=prelim',
      priority: 'important',
    },
    {
      id: 'can-4',
      category: 'can_do',
      title: 'Detain for Secondary Inspection',
      summary: 'Can send you to additional questioning',
      content: 'Officers can refer you to secondary inspection for additional questioning or examination of your belongings.',
      legalBasis: '8 CFR § 235.3 - Inadmissible Aliens and Expedited Removal',
      legalBasisUrl: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-235/section-235.3',
      priority: 'important',
    },
    {
      id: 'can-5',
      category: 'can_do',
      title: 'Inspect Electronic Devices',
      summary: 'Can search phones and laptops without suspicion',
      content: 'CBP can conduct basic searches of phones, laptops, and other electronic devices at the border without suspicion.',
      legalBasis: 'CBP Directive 3340-049A - Border Search of Electronic Devices',
      legalBasisUrl: 'https://www.cbp.gov/sites/default/files/assets/documents/2018-Jan/CBP-Directive-3340-049A-Border-Search-of-Electronic-Media-Compliant.pdf',
      priority: 'critical',
    },

    // WHAT CBP CANNOT DO
    {
      id: 'cannot-1',
      category: 'cannot_do',
      title: 'Discriminate Based on Protected Characteristics',
      summary: 'Cannot select you based on race, religion, or ethnicity alone',
      content: 'Officers cannot select you for inspection based solely on your race, ethnicity, religion, national origin, or sexual orientation.',
      legalBasis: '14th Amendment - Equal Protection Clause',
      legalBasisUrl: 'https://constitution.congress.gov/constitution/amendment-14/',
      priority: 'critical',
    },
    {
      id: 'cannot-2',
      category: 'cannot_do',
      title: 'Deny Entry to US Citizens',
      summary: 'Citizens have absolute right to enter',
      content: 'CBP cannot refuse entry to US citizens. Citizens have an absolute right to enter the United States.',
      legalBasis: 'Kent v. Dulles, 357 U.S. 116 (1958)',
      legalBasisUrl: 'https://supreme.justia.com/cases/federal/us/357/116/',
      priority: 'critical',
    },
    {
      id: 'cannot-3',
      category: 'cannot_do',
      title: 'Force You to Unlock Encrypted Devices',
      summary: 'Cannot legally compel passwords, but can seize device',
      content: 'While CBP can ask you to unlock devices, they cannot legally compel you to provide passwords or biometric unlocks. However, they can seize the device.',
      legalBasis: '5th Amendment - Protection Against Self-Incrimination',
      legalBasisUrl: 'https://constitution.congress.gov/constitution/amendment-5/',
      priority: 'critical',
    },
    {
      id: 'cannot-4',
      category: 'cannot_do',
      title: 'Search Cloud Data',
      summary: 'Policy prohibits accessing remotely stored data',
      content: 'CBP policy prohibits searches of data stored remotely in the cloud that is accessible from your device.',
      legalBasis: 'CBP Directive 3340-049A (2018)',
      legalBasisUrl: 'https://www.cbp.gov/sites/default/files/assets/documents/2018-Jan/CBP-Directive-3340-049A-Border-Search-of-Electronic-Media-Compliant.pdf',
      priority: 'important',
    },
    {
      id: 'cannot-5',
      category: 'cannot_do',
      title: 'Detain Indefinitely Without Cause',
      summary: 'Extended detention requires reasonable suspicion',
      content: 'While CBP can detain for questioning, extended detention requires reasonable suspicion of illegal activity.',
      legalBasis: 'US v. Montoya de Hernandez, 473 U.S. 531 (1985)',
      legalBasisUrl: 'https://supreme.justia.com/cases/federal/us/473/531/',
      priority: 'important',
    },

    // YOUR RIGHTS
    {
      id: 'rights-1',
      category: 'your_rights',
      title: 'Right to Remain Silent (Limited)',
      summary: 'Must answer basics, can decline other questions',
      content: 'At the border, you must answer basic questions about citizenship and travel purpose. Beyond that, you can decline to answer questions, though this may result in additional scrutiny.',
      legalBasis: '5th Amendment (limited application at border)',
      legalBasisUrl: 'https://constitution.congress.gov/constitution/amendment-5/',
      priority: 'important',
    },
    {
      id: 'rights-2',
      category: 'your_rights',
      title: 'Right to Request an Attorney',
      summary: 'Can request attorney, but CBP not required to wait',
      content: 'You can request to speak with an attorney, but CBP is not required to provide one or delay inspection while you contact one. For removal proceedings, you have a right to representation.',
      legalBasis: '8 CFR § 292 - Representation and Appearances',
      legalBasisUrl: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-292',
      priority: 'important',
    },
    {
      id: 'rights-3',
      category: 'your_rights',
      title: 'Right to an Interpreter',
      summary: 'Free interpreter provided if you don\'t speak English',
      content: 'If you do not speak English, you have the right to an interpreter during inspection and any proceedings.',
      legalBasis: 'Executive Order 13166 - Limited English Proficiency',
      legalBasisUrl: 'https://www.federalregister.gov/documents/2000/08/16/00-20938/improving-access-to-services-for-persons-with-limited-english-proficiency',
      priority: 'info',
    },
    {
      id: 'rights-4',
      category: 'your_rights',
      title: 'Right to Refuse Device Search',
      summary: 'Can refuse unlock; citizens still enter, device may be seized',
      content: 'You can refuse to unlock your device. US citizens cannot be denied entry but the device may be seized. Non-citizens may be denied entry.',
      legalBasis: 'CBP Directive 3340-049A',
      legalBasisUrl: 'https://www.cbp.gov/sites/default/files/assets/documents/2018-Jan/CBP-Directive-3340-049A-Border-Search-of-Electronic-Media-Compliant.pdf',
      priority: 'critical',
    },
    {
      id: 'rights-5',
      category: 'your_rights',
      title: 'Right to File a Complaint',
      summary: 'Can report officer misconduct to DHS',
      content: 'You can file complaints about CBP officer conduct through the DHS Office of Civil Rights and Civil Liberties or DHS TRIP (Traveler Redress Inquiry Program).',
      legalBasis: '6 USC § 345 - Civil Rights and Civil Liberties',
      legalBasisUrl: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title6-section345&num=0&edition=prelim',
      priority: 'info',
    },
    {
      id: 'rights-6',
      category: 'your_rights',
      title: 'Right to Medical Care',
      summary: 'Can request medical attention if needed',
      content: 'If you have a medical condition or emergency while in CBP custody, you have the right to request medical attention.',
      legalBasis: 'CBP National Standards on Transport, Escort, Detention',
      legalBasisUrl: 'https://www.cbp.gov/document/directives/cbp-directive-no-2130-030-standards-transport-escort-detention-and-search',
      priority: 'info',
    },
  ],

  quickPhrases: [
    {
      id: 'phrase-1',
      situation: 'Officer asks to search your phone',
      phrase: "I'm not comfortable unlocking my device. Am I legally required to do so?",
      explanation: 'This politely declines while seeking clarification on legal obligation.',
    },
    {
      id: 'phrase-2',
      situation: 'Officer asks invasive personal questions',
      phrase: "I prefer not to answer that question. Is it required for entry?",
      explanation: 'Establishes boundaries while acknowledging their authority.',
    },
    {
      id: 'phrase-3',
      situation: 'Detained in secondary inspection for extended time',
      phrase: "How long will this process take? Am I free to leave?",
      explanation: 'Clarifies your status and expected timeline.',
    },
    {
      id: 'phrase-4',
      situation: 'Officer requests social media information',
      phrase: "I decline to provide that information. Is it mandatory?",
      explanation: 'Social media disclosure is voluntary in most cases.',
    },
    {
      id: 'phrase-5',
      situation: 'Feel your rights are being violated',
      phrase: "I would like to speak with a supervisor. May I have your name and badge number?",
      explanation: 'Escalates professionally while documenting the officer\'s identity.',
    },
    {
      id: 'phrase-6',
      situation: 'Asked about intent to work in the US (on tourist visa)',
      phrase: "I am visiting for tourism purposes only and will return before my authorized stay expires.",
      explanation: 'Clear, truthful statement that addresses the concern directly.',
    },
  ],
};

export const allScenarios: Scenario[] = [
  customsScenario,
];