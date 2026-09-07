export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  shortDesc: string;
  fullDesc: string;
  highlights: string[];
  category: 'core' | 'specialized' | 'facility';
  turnaroundTime: string;
  popular?: boolean;
}

export const servicesList: ServiceItem[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    slug: 'plumbing',
    icon: 'Wrench',
    shortDesc: 'Professional plumbing installation, leak detection, fixture setup & pipeline maintenance.',
    fullDesc: 'Certified plumbers providing comprehensive residential and commercial pipeline installations, sanitary fixtures, blocked drain clearings, booster pump maintenance, and round-the-clock emergency leak fixes.',
    highlights: ['Leak detection & repair', 'Sanitaryware fitting', 'Pressure pump servicing', 'Water tank & sump cleaning'],
    category: 'core',
    turnaroundTime: '60 - 90 mins response',
    popular: true
  },
  {
    id: 'renovation',
    name: 'Renovation',
    slug: 'renovation',
    icon: 'Hammer',
    shortDesc: 'End-to-end space remodeling, structural upgrades, modern tiling and turnkey transformations.',
    fullDesc: 'Transform residential apartments, retail outlets, and commercial floors with full-lifecycle remodeling, masonry work, floor replacement, waterproofing, and structural modernizations.',
    highlights: ['Bathroom & kitchen remodels', 'Civil masonry & tiling', 'Demolition & debris removal', 'Structural waterproofing'],
    category: 'specialized',
    turnaroundTime: 'Scheduled consultation',
    popular: true
  },
  {
    id: 'appliances',
    name: 'Appliances',
    slug: 'appliances',
    icon: 'Tv',
    shortDesc: 'Skilled diagnostics and precision repair for HVAC, refrigerators, washers & kitchen systems.',
    fullDesc: 'Certified appliance engineers equipped with genuine manufacturer parts for inverter ACs, cold storage, industrial laundry, microwave ovens, commercial kitchen exhausts, and home appliances.',
    highlights: ['AC gas refill & deep coil cleaning', 'Refrigerator & freezer repair', 'Washing machine servicing', 'Kitchen appliance overhaul'],
    category: 'core',
    turnaroundTime: 'Same-day service',
    popular: true
  },
  {
    id: 'painting',
    name: 'Painting',
    slug: 'painting',
    icon: 'Paintbrush',
    shortDesc: 'Interior & exterior waterproofing, texture painting, dust-free roller application & finishes.',
    fullDesc: 'Premium emulsion coating, exterior weather-guard painting, texture accents, and moisture barrier treatments using automated mechanized tools for clean, mess-free finishes.',
    highlights: ['Interior royal luxury emulsions', 'Exterior weather-proof coatings', 'Waterproofing & anti-fungal primer', 'Mechanized dust-free sanding'],
    category: 'specialized',
    turnaroundTime: 'Instant site survey',
    popular: false
  },
  {
    id: 'electrical',
    name: 'Electrical',
    slug: 'electrical',
    icon: 'Zap',
    shortDesc: 'Licensed electrical rewiring, DB box upgrades, lighting automation & emergency repairs.',
    fullDesc: 'Licensed electricians handling high-voltage distribution boards, smart lighting installations, inverter & UPS setups, earth-leakage circuit breakers (ELCB), and phase load balancing.',
    highlights: ['Distribution board (DB) troubleshooting', 'Architectural lighting & automation', 'Inverter, UPS & generator wiring', 'Electrical safety audit'],
    category: 'core',
    turnaroundTime: '45 mins priority dispatch',
    popular: true
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    slug: 'pest-control',
    icon: 'ShieldCheck',
    shortDesc: 'Eco-safe, odourless herbal & chemical treatments for termites, bedbugs, roaches & rodents.',
    fullDesc: 'Government-approved, non-hazardous pest management utilizing targeted gel baiting, thermal fogging, pre & post-construction anti-termite piping systems, and commercial rodent control.',
    highlights: ['Eco-friendly herbal cockroach gel', 'Subterranean termite warranty', 'Rodent exclusion systems', 'Bedbug heat & spray treatments'],
    category: 'facility',
    turnaroundTime: 'Scheduled slot booking',
    popular: true
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    slug: 'carpentry',
    icon: 'Drill',
    shortDesc: 'Custom furniture repair, modular cabinet adjustments, door lock fittings & woodwork.',
    fullDesc: 'Master craftsmen specialized in modular kitchen repairs, hydraulic hinge adjustments, smart digital door lock installations, solid wood polishing, and bespoke wooden shelving.',
    highlights: ['Door alignment & lock installation', 'Modular cabinet restoration', 'Hardwood polishing & repair', 'Custom shelving & drywall mounts'],
    category: 'core',
    turnaroundTime: 'Within 2 hours',
    popular: false
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    slug: 'cleaning',
    icon: 'Sparkles',
    shortDesc: 'Hospital-grade deep cleaning, floor buffing, sofa sanitization & post-construction scrub.',
    fullDesc: 'Industrial single-disc scrubbing, high-pressure steam extraction for upholstery, facade glass cleaning, kitchen degreasing, and clinical-grade disinfectant fogging.',
    highlights: ['Full home deep sanitization', 'Industrial single-disc floor scrubbing', 'Steam extraction for sofas & rugs', 'Post-construction cleanup'],
    category: 'facility',
    turnaroundTime: 'Next-day or express slot',
    popular: true
  },
  {
    id: 'manpower',
    name: 'Manpower',
    slug: 'manpower',
    icon: 'Users',
    shortDesc: 'Trained, background-verified facility staff, front desk, housekeeping & utility workforce.',
    fullDesc: 'Comprehensive staffing solutions providing vetted, PF/ESI-compliant facility attendants, office boys, janitorial staff, technicians, and supervisory building maintenance personnel.',
    highlights: ['Background-verified personnel', 'PF & ESI statutory compliance', 'Trained in SOPs & emergency response', 'Flexible shift allocation'],
    category: 'facility',
    turnaroundTime: 'Rapid workforce onboarding',
    popular: false
  },
  {
    id: 'fire-security',
    name: 'Fire & Security',
    slug: 'fire-security',
    icon: 'Flame',
    shortDesc: 'CCTV surveillance, biometric access control, fire hydrants & extinguisher compliance.',
    fullDesc: 'Turnkey safety infrastructure design, installation, and inspection covering IP CCTV cameras, biometric turnstiles, smoke detection alarms, fire sprinkler audits, and evacuation drill plans.',
    highlights: ['HD IP CCTV surveillance systems', 'Biometric & RFID access control', 'Fire extinguisher refills & certification', 'Smoke detector & sprinkler testing'],
    category: 'specialized',
    turnaroundTime: 'Consultation & audit',
    popular: false
  },
  {
    id: 'amc',
    name: 'AMC',
    slug: 'amc',
    icon: 'FileCheck',
    shortDesc: 'Annual Maintenance Contracts with scheduled preventive visits, priority SLAs & parts discounts.',
    fullDesc: 'Tailored maintenance agreements for societies, tech parks, hotels, and retail stores ensuring zero operational downtime through periodic audits, dedicated helpdesk, and priority dispatch.',
    highlights: ['Monthly preventive checkups', 'Guaranteed 2-hour SLA response', 'Discounted spare components', 'Dedicated facility relationship manager'],
    category: 'facility',
    turnaroundTime: 'Custom enterprise contracts',
    popular: true
  },
  {
    id: 'repairs-maintenance',
    name: 'Repairs & Maintenance',
    slug: 'repairs-maintenance',
    icon: 'Cog',
    shortDesc: 'Comprehensive multi-disciplinary handyman, building fabric fixes & routine servicing.',
    fullDesc: 'On-demand multi-skill technicians capable of tackling general masonry repairs, ceiling seepage, acoustic tile replacements, signage repairs, and everyday property wear and tear.',
    highlights: ['General handyman repairs', 'Ceiling tile & drywall fixing', 'Glass & facade maintenance', 'Preventive building upkeep'],
    category: 'core',
    turnaroundTime: 'Immediate booking',
    popular: false
  }
];
