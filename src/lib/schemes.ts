export type Profile = {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  state: string | null;
  area: string | null;
  annual_income: number | null;
  occupation: string | null;
  category: string | null;
  is_farmer: boolean;
  is_bpl: boolean;
  has_disability: boolean;
  interests: string[];
  language: string;
};

export type SchemeCategory =
  | "Loans" | "Subsidy" | "Insurance" | "Pension" | "Agriculture" | "MSME" | "Housing" | "Education";

type Rule = {
  label: string;
  check: (p: Profile) => boolean | null; // null = unknown
  hint: string;
};

export type Scheme = {
  id: string;
  name: string;
  ministry: string;
  category: SchemeCategory;
  benefit: string;
  summary: string;
  description: string;
  documents: string[];
  steps: string[];
  applyUrl: string;
  rules: Rule[];
  tags: string[];
};

const has = (v: unknown) => v !== null && v !== undefined && v !== "";

export const SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture",
    benefit: "₹6,000 per year",
    summary: "Direct income support to landholding farmer families in three instalments.",
    description:
      "Pradhan Mantri Kisan Samman Nidhi provides ₹6,000 per year to eligible farmer families, paid as three equal instalments of ₹2,000 directly into Aadhaar-linked bank accounts.",
    documents: ["Aadhaar card", "Land ownership records", "Bank account details"],
    steps: ["Visit pmkisan.gov.in or nearest CSC", "Register under 'New Farmer Registration'", "Complete e-KYC with Aadhaar", "Track status online"],
    applyUrl: "https://pmkisan.gov.in",
    tags: ["farmer", "income support"],
    rules: [
      { label: "Is a farmer", check: (p) => p.is_farmer, hint: "Only landholding farmer families qualify." },
      { label: "Income below ₹10 lakh (non-taxpayer)", check: (p) => (has(p.annual_income) ? p.annual_income! < 1000000 : null), hint: "Income tax payers are excluded." },
    ],
  },
  {
    id: "pm-mudra",
    name: "Pradhan Mantri MUDRA Yojana",
    ministry: "Ministry of Finance",
    category: "Loans",
    benefit: "Loans up to ₹20 lakh",
    summary: "Collateral-free loans for micro and small non-farm enterprises.",
    description:
      "MUDRA offers Shishu (up to ₹50,000), Kishore (up to ₹5 lakh), Tarun (up to ₹10 lakh) and Tarun Plus (up to ₹20 lakh) loans through banks, NBFCs and MFIs for income-generating activities.",
    documents: ["Aadhaar & PAN", "Business plan / quotation", "Proof of business address", "Bank statements (6 months)"],
    steps: ["Prepare a simple business plan", "Approach any bank or apply on Udyamimitra portal", "Submit KYC and business documents", "Loan sanction and disbursal"],
    applyUrl: "https://www.mudra.org.in",
    tags: ["business", "self-employed", "loan"],
    rules: [
      { label: "Age 18 or above", check: (p) => (has(p.age) ? p.age! >= 18 : null), hint: "Applicant must be an adult." },
      { label: "Self-employed or business owner", check: (p) => (has(p.occupation) ? ["Self-employed", "Business owner"].includes(p.occupation!) : null), hint: "For non-farm income-generating enterprises." },
    ],
  },
  {
    id: "pmjjby",
    name: "PM Jeevan Jyoti Bima Yojana",
    ministry: "Ministry of Finance",
    category: "Insurance",
    benefit: "₹2 lakh life cover for ₹436/yr",
    summary: "Low-cost term life insurance renewable every year.",
    description: "PMJJBY offers ₹2 lakh life cover on death due to any reason for an annual premium of ₹436, auto-debited from a savings account.",
    documents: ["Aadhaar card", "Savings bank account", "Nominee details"],
    steps: ["Visit your bank branch or net banking", "Fill the PMJJBY consent-cum-declaration form", "Enable auto-debit of premium"],
    applyUrl: "https://jansuraksha.gov.in",
    tags: ["insurance", "life"],
    rules: [
      { label: "Age between 18 and 50", check: (p) => (has(p.age) ? p.age! >= 18 && p.age! <= 50 : null), hint: "Enrolment allowed from 18 to 50 years." },
    ],
  },
  {
    id: "pmsby",
    name: "PM Suraksha Bima Yojana",
    ministry: "Ministry of Finance",
    category: "Insurance",
    benefit: "₹2 lakh accident cover for ₹20/yr",
    summary: "Accidental death and disability insurance at minimal premium.",
    description: "PMSBY covers accidental death and full disability up to ₹2 lakh and partial disability up to ₹1 lakh for ₹20 per year.",
    documents: ["Aadhaar card", "Savings bank account"],
    steps: ["Enrol through your bank", "Consent to auto-debit", "Coverage runs June to May"],
    applyUrl: "https://jansuraksha.gov.in",
    tags: ["insurance", "accident"],
    rules: [
      { label: "Age between 18 and 70", check: (p) => (has(p.age) ? p.age! >= 18 && p.age! <= 70 : null), hint: "Enrolment allowed from 18 to 70 years." },
    ],
  },
  {
    id: "apy",
    name: "Atal Pension Yojana",
    ministry: "Ministry of Finance (PFRDA)",
    category: "Pension",
    benefit: "₹1,000–₹5,000 monthly pension",
    summary: "Guaranteed pension after 60 for unorganised sector workers.",
    description: "APY guarantees a monthly pension of ₹1,000 to ₹5,000 from age 60 depending on contributions made between joining and 60.",
    documents: ["Aadhaar card", "Savings bank account", "Mobile number"],
    steps: ["Visit bank or post office", "Choose pension amount", "Set up auto-debit contributions"],
    applyUrl: "https://www.npscra.nsdl.co.in",
    tags: ["pension", "retirement"],
    rules: [
      { label: "Age between 18 and 40", check: (p) => (has(p.age) ? p.age! >= 18 && p.age! <= 40 : null), hint: "Must join between 18 and 40." },
      { label: "Not an income-tax payer", check: (p) => (has(p.annual_income) ? p.annual_income! <= 700000 : null), hint: "Income tax payers cannot join since Oct 2022." },
    ],
  },
  {
    id: "pmay-g",
    name: "PM Awas Yojana – Gramin",
    ministry: "Ministry of Rural Development",
    category: "Housing",
    benefit: "Up to ₹1.30 lakh for a pucca house",
    summary: "Financial assistance to build a pucca house for rural households.",
    description: "PMAY-G provides ₹1.20 lakh (plains) or ₹1.30 lakh (hilly areas) to houseless and kutcha-house rural families.",
    documents: ["Aadhaar card", "Job card (MGNREGA)", "Bank account", "SECC/Awaas+ listing"],
    steps: ["Check name in Awaas+ beneficiary list", "Gram Panchayat verification", "Geo-tagged construction in stages"],
    applyUrl: "https://pmayg.nic.in",
    tags: ["housing", "rural"],
    rules: [
      { label: "Lives in a rural area", check: (p) => (has(p.area) ? p.area === "Rural" : null), hint: "Only for rural households." },
      { label: "BPL / low-income household", check: (p) => p.is_bpl || (has(p.annual_income) ? p.annual_income! <= 300000 : null), hint: "Prioritises deprived households." },
    ],
  },
  {
    id: "standup-india",
    name: "Stand-Up India",
    ministry: "Department of Financial Services",
    category: "MSME",
    benefit: "Loans ₹10 lakh – ₹1 crore",
    summary: "Bank loans for SC/ST and women entrepreneurs setting up greenfield enterprises.",
    description: "Stand-Up India facilitates bank loans between ₹10 lakh and ₹1 crore to at least one SC/ST borrower and one woman borrower per bank branch for new enterprises.",
    documents: ["Aadhaar & PAN", "Caste certificate (if SC/ST)", "Project report", "Address proof"],
    steps: ["Register on standupmitra.in", "Get handholding support", "Apply to bank branch"],
    applyUrl: "https://www.standupmitra.in",
    tags: ["women", "sc/st", "entrepreneur"],
    rules: [
      { label: "Age 18 or above", check: (p) => (has(p.age) ? p.age! >= 18 : null), hint: "Applicant must be an adult." },
      { label: "Woman or SC/ST", check: (p) => (has(p.gender) || has(p.category) ? p.gender === "Female" || ["SC", "ST"].includes(p.category ?? "") : null), hint: "Reserved for women and SC/ST entrepreneurs." },
    ],
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    ministry: "Ministry of Agriculture & NABARD",
    category: "Agriculture",
    benefit: "Crop loans at 4% effective interest",
    summary: "Short-term credit for crops, inputs and allied activities.",
    description: "KCC provides revolving credit for cultivation and allied activities with interest subvention making the effective rate 4% on prompt repayment for loans up to ₹3 lakh.",
    documents: ["Aadhaar card", "Land records", "Passport photo", "Bank account"],
    steps: ["Visit bank with land records", "Fill KCC application", "Card issued after verification"],
    applyUrl: "https://www.myscheme.gov.in",
    tags: ["farmer", "credit"],
    rules: [
      { label: "Is a farmer", check: (p) => p.is_farmer, hint: "For farmers, tenant farmers and sharecroppers." },
      { label: "Age 18 to 75", check: (p) => (has(p.age) ? p.age! >= 18 && p.age! <= 75 : null), hint: "Age limits apply; co-borrower needed above 60." },
    ],
  },
  {
    id: "pm-svanidhi",
    name: "PM SVANidhi",
    ministry: "Ministry of Housing & Urban Affairs",
    category: "Loans",
    benefit: "Working capital up to ₹50,000",
    summary: "Micro-credit for urban street vendors with interest subsidy.",
    description: "Street vendors get collateral-free working capital loans of ₹10,000, ₹20,000 and ₹50,000 in tranches, with 7% interest subsidy and digital cashback.",
    documents: ["Aadhaar card", "Vending certificate / letter of recommendation", "Bank account"],
    steps: ["Apply on pmsvanidhi.mohua.gov.in", "Upload vending proof", "Loan disbursed by lender"],
    applyUrl: "https://pmsvanidhi.mohua.gov.in",
    tags: ["street vendor", "urban"],
    rules: [
      { label: "Lives in an urban area", check: (p) => (has(p.area) ? p.area === "Urban" : null), hint: "For urban street vendors." },
      { label: "Self-employed", check: (p) => (has(p.occupation) ? p.occupation === "Self-employed" : null), hint: "Applicant must be a vendor." },
    ],
  },
  {
    id: "nsp-postmatric-sc",
    name: "Post-Matric Scholarship for SC Students",
    ministry: "Ministry of Social Justice & Empowerment",
    category: "Education",
    benefit: "Full tuition + maintenance allowance",
    summary: "Scholarship for SC students studying beyond class 10.",
    description: "Covers compulsory non-refundable fees and a monthly maintenance allowance for SC students in post-matric courses whose family income is up to ₹2.5 lakh.",
    documents: ["Caste certificate", "Income certificate", "Previous marksheet", "Fee receipt", "Bank account"],
    steps: ["Register on National Scholarship Portal", "Fill application and upload documents", "Institute and state verification"],
    applyUrl: "https://scholarships.gov.in",
    tags: ["student", "sc", "scholarship"],
    rules: [
      { label: "Belongs to SC category", check: (p) => (has(p.category) ? p.category === "SC" : null), hint: "Only for Scheduled Caste students." },
      { label: "Student", check: (p) => (has(p.occupation) ? p.occupation === "Student" : null), hint: "Must be enrolled in a post-matric course." },
      { label: "Family income ≤ ₹2.5 lakh", check: (p) => (has(p.annual_income) ? p.annual_income! <= 250000 : null), hint: "Income ceiling applies." },
    ],
  },
  {
    id: "ignoaps",
    name: "Indira Gandhi National Old Age Pension",
    ministry: "Ministry of Rural Development (NSAP)",
    category: "Pension",
    benefit: "₹200–₹500 monthly + state top-up",
    summary: "Monthly pension for elderly persons from BPL households.",
    description: "Under NSAP, BPL persons aged 60+ receive a central pension of ₹200/month (₹500 at 80+), usually topped up by the state.",
    documents: ["Age proof", "BPL card", "Aadhaar card", "Bank account"],
    steps: ["Apply at Gram Panchayat / municipal office", "Verification by local authority", "Pension credited monthly"],
    applyUrl: "https://nsap.nic.in",
    tags: ["elderly", "bpl"],
    rules: [
      { label: "Age 60 or above", check: (p) => (has(p.age) ? p.age! >= 60 : null), hint: "For senior citizens only." },
      { label: "BPL household", check: (p) => p.is_bpl, hint: "Must be listed below poverty line." },
    ],
  },
  {
    id: "pmegp",
    name: "PM Employment Generation Programme",
    ministry: "Ministry of MSME (KVIC)",
    category: "Subsidy",
    benefit: "15–35% subsidy on project cost",
    summary: "Credit-linked subsidy to set up new micro-enterprises.",
    description: "PMEGP gives a margin-money subsidy of 15–35% on projects up to ₹50 lakh (manufacturing) or ₹20 lakh (services). Higher subsidy for rural, SC/ST, women and special categories.",
    documents: ["Aadhaar & PAN", "Project report", "Education certificate (8th pass for larger projects)", "Caste certificate if applicable"],
    steps: ["Apply online at kviconline.gov.in", "Interview by district task force", "Bank sanction and EDP training", "Subsidy released"],
    applyUrl: "https://www.kviconline.gov.in",
    tags: ["entrepreneur", "subsidy"],
    rules: [
      { label: "Age 18 or above", check: (p) => (has(p.age) ? p.age! >= 18 : null), hint: "Applicant must be an adult." },
      { label: "Not currently a salaried employee", check: (p) => (has(p.occupation) ? p.occupation !== "Salaried" : null), hint: "Meant for new self-employment ventures." },
    ],
  },
];

export const CATEGORIES: SchemeCategory[] = ["Loans", "Subsidy", "Insurance", "Pension", "Agriculture", "MSME", "Housing", "Education"];

export type RuleResult = { label: string; status: "pass" | "fail" | "unknown"; hint: string };
export type Eligibility = {
  status: "eligible" | "partial" | "ineligible";
  score: number;
  results: RuleResult[];
};

export function evaluate(scheme: Scheme, p: Profile): Eligibility {
  const results: RuleResult[] = scheme.rules.map((r) => {
    const v = r.check(p);
    return { label: r.label, hint: r.hint, status: v === null ? "unknown" : v ? "pass" : "fail" };
  });
  const pass = results.filter((r) => r.status === "pass").length;
  const fail = results.filter((r) => r.status === "fail").length;
  let score = Math.round((pass / results.length) * 100);
  if (p.interests?.includes(scheme.category)) score = Math.min(100, score + 5);
  const status = fail > 0 ? "ineligible" : pass === results.length ? "eligible" : "partial";
  return { status, score: fail > 0 ? Math.min(score, 40) : score, results };
}

export function recommend(p: Profile) {
  return SCHEMES.map((s) => ({ scheme: s, eligibility: evaluate(s, p) }))
    .filter((x) => x.eligibility.status !== "ineligible")
    .sort((a, b) => b.eligibility.score - a.eligibility.score);
}

export function profileCompleteness(p: Profile | null) {
  if (!p) return 0;
  const fields = [p.full_name, p.age, p.gender, p.state, p.area, p.annual_income, p.occupation, p.category];
  return Math.round((fields.filter(has).length / fields.length) * 100);
}

export const getScheme = (id: string) => SCHEMES.find((s) => s.id === id);
