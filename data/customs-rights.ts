export interface RightCard {
  id: string;
  category: 'can_do' | 'cannot_do' | 'your_rights';
  title: string;
  content: string;
  legalBasis: string;
  priority: number;
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
      content: 'CBP officers can request your passport, visa, and other travel documents. You must present these documents when entering the United States.',
      legalBasis: '8 USC § 1357 - Border Search Authority',
      priority: 1,
    },
    {
      id: 'can-2',
      category: 'can_do',
      title: 'Ask Questions About Your Trip',
      content: 'Officers can ask about the purpose of your visit, where you will stay, how long you plan to stay, and what you will be doing in the US.',
      legalBasis: '8 CFR § 235.1 - Examination Requirements',
      priority: 2,
    },
    {
      id: 'can-3',
      category: 'can_do',
      title: 'Search Your Baggage',
      content: 'CBP has authority to search all baggage, including checked and carry-on luggage, without a warrant or probable cause.',
      legalBasis: '19 USC § 1582 - Search of Persons and Baggage',
      priority: 3,
    },
    {
      id: 'can-4',
      category: 'can_do',
      title: 'Detain for Secondary Inspection',
      content: 'Officers can refer you to secondary inspection for additional questioning or examination of your belongings.',
      legalBasis: '8 CFR § 235.3 - Inadmissible Aliens and Expedited Removal',
      priority: 4,
    },
    {
      id: 'can-5',
      category: 'can_do',
      title: 'Inspect Electronic Devices',
      content: 'CBP can conduct basic searches of phones, laptops, and other electronic devices at the border without suspicion.',
      legalBasis: 'CBP Directive 3340-049A - Border Search of Electronic Devices',
      priority: 5,
    },

    // WHAT CBP CANNOT DO
    {
      id: 'cannot-1',
      category: 'cannot_do',
      title: 'Discriminate Based on Protected Characteristics',
      content: 'Officers cannot select you for inspection based solely on your race, ethnicity, religion, national origin, or sexual orientation.',
      legalBasis: '14th Amendment - Equal Protection Clause',
      priority: 1,
    },
    {
      id: 'cannot-2',
      category: 'cannot_do',
      title: 'Deny Entry to US Citizens',
      content: 'CBP cannot refuse entry to US citizens. Citizens have an absolute right to enter the United States.',
      legalBasis: 'Kent v. Dulles, 357 U.S. 116 (1958)',
      priority: 2,
    },
    {
      id: 'cannot-3',
      category: 'cannot_do',
      title: 'Force You to Unlock Encrypted Devices',
      content: 'While CBP can ask you to unlock devices, they cannot legally compel you to provide passwords or biometric unlocks. However, they can seize the device.',
      legalBasis: '5th Amendment - Protection Against Self-Incrimination',
      priority: 3,
    },
    {
      id: 'cannot-4',
      category: 'cannot_do',
      title: 'Search Cloud Data',
      content: 'CBP policy prohibits searches of data stored remotely in the cloud that is accessible from your device.',
      legalBasis: 'CBP Directive 3340-049A (2018)',
      priority: 4,
    },
    {
      id: 'cannot-5',
      category: 'cannot_do',
      title: 'Detain Indefinitely Without Cause',
      content: 'While CBP can detain for questioning, extended detention requires reasonable suspicion of illegal activity.',
      legalBasis: 'US v. Montoya de Hernandez, 473 U.S. 531 (1985)',
      priority: 5,
    },

    // YOUR RIGHTS
    {
      id: 'rights-1',
      category: 'your_rights',
      title: 'Right to Remain Silent (Limited)',
      content: 'At the border, you must answer basic questions about citizenship and travel purpose. Beyond that, you can decline to answer questions, though this may result in additional scrutiny.',
      legalBasis: '5th Amendment (limited application at border)',
      priority: 1,
    },
    {
      id: 'rights-2',
      category: 'your_rights',
      title: 'Right to Request an Attorney',
      content: 'You can request to speak with an attorney, but CBP is not required to provide one or delay inspection while you contact one. For removal proceedings, you have a right to representation.',
      legalBasis: '8 CFR § 292 - Representation and Appearances',
      priority: 2,
    },
    {
      id: 'rights-3',
      category: 'your_rights',
      title: 'Right to an Interpreter',
      content: 'If you do not speak English, you have the right to an interpreter during inspection and any proceedings.',
      legalBasis: 'Executive Order 13166 - Limited English Proficiency',
      priority: 3,
    },
    {
      id: 'rights-4',
      category: 'your_rights',
      title: 'Right to Refuse Device Search',
      content: 'You can refuse to unlock your device. US citizens cannot be denied entry but the device may be seized. Non-citizens may be denied entry.',
      legalBasis: 'CBP Directive 3340-049A',
      priority: 4,
    },
    {
      id: 'rights-5',
      category: 'your_rights',
      title: 'Right to File a Complaint',
      content: 'You can file complaints about CBP officer conduct through the DHS Office of Civil Rights and Civil Liberties or DHS TRIP (Traveler Redress Inquiry Program).',
      legalBasis: '6 USC § 345 - Civil Rights and Civil Liberties',
      priority: 5,
    },
    {
      id: 'rights-6',
      category: 'your_rights',
      title: 'Right to Medical Care',
      content: 'If you have a medical condition or emergency while in CBP custody, you have the right to request medical attention.',
      legalBasis: 'CBP National Standards on Transport, Escort, Detention',
      priority: 6,
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

// Export all scenarios (we'll add more later)
export const allScenarios: Scenario[] = [
  customsScenario,
  // Future: policeScenario, trafficScenario, etc.
];