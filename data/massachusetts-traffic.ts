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

// MASSACHUSETTS TRAFFIC STOP DATA
export const massachusettsTrafficScenario: Scenario = {
  id: 'ma-traffic',
  title: 'Massachusetts Traffic Stops',
  description: 'Know your rights during traffic stops in Massachusetts',
  category: 'traffic',
  
  rightsCards: [
    // WHAT POLICE CAN DO
    {
      id: 'can-1',
      category: 'can_do',
      title: 'Pull You Over with Reasonable Suspicion',
      content: 'Officers need reasonable suspicion of a traffic violation or illegal activity to initiate a stop. Common reasons include speeding, equipment violations, expired registration, or suspicious behavior.',
      legalBasis: 'Terry v. Ohio, 392 U.S. 1 (1968); Commonwealth v. Torres',
      priority: 1,
    },
    {
      id: 'can-2',
      category: 'can_do',
      title: 'Request License, Registration, and Insurance',
      content: 'You must provide your driver\'s license, vehicle registration, and proof of insurance when requested by an officer during a traffic stop.',
      legalBasis: 'M.G.L. Chapter 90, Section 25',
      priority: 2,
    },
    {
      id: 'can-3',
      category: 'can_do',
      title: 'Order Exit from Vehicle (Limited Circumstances)',
      content: 'Officers can order you to exit if they reasonably fear for their safety, are executing a search with legal justification, or suspect DUI. Nervousness alone is insufficient justification.',
      legalBasis: 'Commonwealth v. Gonsalves; Pennsylvania v. Mimms',
      priority: 3,
    },
    {
      id: 'can-4',
      category: 'can_do',
      title: 'Conduct Plain View Search',
      content: 'During a lawful stop, officers can look around and inside your vehicle for anything in plain view that suggests criminal activity. They may use flashlights and position themselves to observe.',
      legalBasis: '4th Amendment; Plain View Doctrine',
      priority: 4,
    },
    {
      id: 'can-5',
      category: 'can_do',
      title: 'Pat Down for Weapons (With Reasonable Suspicion)',
      content: 'If an officer reasonably suspects you have a weapon and they fear for their safety, they may pat down your outer clothing. This is limited to weapons, not a general search.',
      legalBasis: 'Terry v. Ohio; 4th Amendment',
      priority: 5,
    },

    // WHAT POLICE CANNOT DO
    {
      id: 'cannot-1',
      category: 'cannot_do',
      title: 'Pull You Over Without Reasonable Suspicion',
      content: 'Officers cannot stop your vehicle without specific, articulable facts suggesting a violation or illegal activity. Random stops or profiling alone are unconstitutional.',
      legalBasis: '4th Amendment; Terry v. Ohio',
      priority: 1,
    },
    {
      id: 'cannot-2',
      category: 'cannot_do',
      title: 'Search Your Vehicle Without Probable Cause or Consent',
      content: 'Police cannot search your vehicle without your consent, probable cause, or a warrant. Refusing consent to a search cannot be held against you legally.',
      legalBasis: '4th Amendment; Commonwealth v. Gonsalves',
      priority: 2,
    },
    {
      id: 'cannot-3',
      category: 'cannot_do',
      title: 'Use Marijuana Smell as Sole Justification',
      content: 'Since possession of less than one ounce of marijuana is decriminalized in Massachusetts, the smell of marijuana alone does not give officers the right to search your vehicle or order you to exit.',
      legalBasis: 'Commonwealth v. Cruz, 459 Mass. 459 (2011)',
      priority: 3,
    },
    {
      id: 'cannot-4',
      category: 'cannot_do',
      title: 'Require Passengers to Show ID (Generally)',
      content: 'Passengers are not required to provide identification during routine traffic stops unless officers have reasonable suspicion the passenger is involved in criminal activity.',
      legalBasis: 'Commonwealth v. Washington, 459 Mass. 32 (2011)',
      priority: 4,
    },
    {
      id: 'cannot-5',
      category: 'cannot_do',
      title: 'Detain You Indefinitely',
      content: 'A traffic stop must last no longer than necessary to address the reason for the stop. Officers cannot extend the stop to fish for evidence without reasonable suspicion of additional crimes.',
      legalBasis: 'Rodriguez v. United States, 575 U.S. 348 (2015)',
      priority: 5,
    },

    // YOUR RIGHTS
    {
      id: 'rights-1',
      category: 'your_rights',
      title: 'Right to Remain Silent',
      content: 'You have the right to remain silent beyond providing your name and address. You are not required to answer questions about where you are going, where you came from, or what you are doing.',
      legalBasis: '5th Amendment; Miranda v. Arizona',
      priority: 1,
    },
    {
      id: 'rights-2',
      category: 'your_rights',
      title: 'Right to Refuse Vehicle Search',
      content: 'You can refuse consent to search your vehicle. Clearly state "I do not consent to searches." Officers may still search if they claim probable cause, but your refusal protects your rights in court.',
      legalBasis: '4th Amendment',
      priority: 2,
    },
    {
      id: 'rights-3',
      category: 'your_rights',
      title: 'Right to Record the Interaction',
      content: 'You have the First Amendment right to openly record police officers performing their duties in public. You cannot secretly record, but open recording is protected. Do not interfere with officers.',
      legalBasis: '1st Amendment; Glik v. Cunniffe, 655 F.3d 78 (1st Cir. 2011)',
      priority: 3,
    },
    {
      id: 'rights-4',
      category: 'your_rights',
      title: 'Right to Ask "Am I Free to Leave?"',
      content: 'You have the right to ask if you are free to leave. If the officer says yes, you may leave. If no, you are being detained and should assert your right to remain silent.',
      legalBasis: '4th Amendment; Terry v. Ohio',
      priority: 4,
    },
    {
      id: 'rights-5',
      category: 'your_rights',
      title: 'Right to Refuse Field Sobriety Tests',
      content: 'You can refuse field sobriety tests, though this may lead to arrest. However, refusing the Breathalyzer at the station results in automatic 6+ month license suspension.',
      legalBasis: 'M.G.L. Chapter 90, Section 24',
      priority: 5,
    },
    {
      id: 'rights-6',
      category: 'your_rights',
      title: 'Passenger Rights',
      content: 'As a passenger, you generally do not need to provide ID during routine traffic stops. You can ask "Am I free to leave?" and if told yes, you may silently exit the vehicle.',
      legalBasis: 'Commonwealth v. Washington; Commonwealth v. Torres',
      priority: 6,
    },
    {
      id: 'rights-7',
      category: 'your_rights',
      title: 'Right to File Complaints',
      content: 'You can file complaints about officer misconduct with the POST Commission (Police Officer Standards and Training), which reviews and investigates complaints and can revoke officer certification.',
      legalBasis: 'POST Commission regulations',
      priority: 7,
    },
  ],

  quickPhrases: [
    {
      id: 'phrase-1',
      situation: 'Officer asks where you are going or coming from',
      phrase: "I prefer not to answer that question. Am I free to leave?",
      explanation: 'These questions are investigative, not required. You only must identify yourself.',
    },
    {
      id: 'phrase-2',
      situation: 'Officer asks to search your vehicle',
      phrase: "I do not consent to searches.",
      explanation: 'Clearly refusing consent protects your rights even if they search anyway.',
    },
    {
      id: 'phrase-3',
      situation: 'Officer asks you to step out of the vehicle',
      phrase: "May I ask why you need me to exit the vehicle?",
      explanation: 'Politely asks for justification while complying if ordered.',
    },
    {
      id: 'phrase-4',
      situation: 'Officer asks if you have weapons or drugs',
      phrase: "I am exercising my right to remain silent.",
      explanation: 'You are not required to answer potentially incriminating questions.',
    },
    {
      id: 'phrase-5',
      situation: 'You want to record the interaction',
      phrase: "I am recording this interaction for my safety and yours.",
      explanation: 'Openly stating you are recording is legally protected in Massachusetts.',
    },
    {
      id: 'phrase-6',
      situation: 'Stop seems to be taking too long',
      phrase: "Am I being detained, or am I free to leave?",
      explanation: 'Clarifies your legal status and duration limits on the stop.',
    },
  ],
};