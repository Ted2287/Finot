import { Injectable, signal } from '@angular/core';

export type SupportedLanguage = 'en' | 'am';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<SupportedLanguage>('am');

  constructor() {
    const saved = localStorage.getItem('app_lang') as SupportedLanguage;
    if (saved && (saved === 'en' || saved === 'am')) {
      this.currentLang.set(saved);
    }
  }

  setLanguage(lang: SupportedLanguage) {
    this.currentLang.set(lang);
    localStorage.setItem('app_lang', lang);
  }

  toggleLanguage() {
    const next = this.currentLang() === 'am' ? 'en' : 'am';
    this.setLanguage(next);
  }

  readonly dictionary = {
    en: {
      // General & Actions
      appTitle: 'Sunday School Member Registration',
      langName: 'English',
      switchLang: 'አማርኛ',
      submit: 'Submit Registration',
      submitting: 'Submitting...',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      close: 'Close',
      required: 'Required',
      optional: 'Optional',
      selectOption: 'Select an option',

      // Section Titles
      sec1Title: 'Section 1: Personal Information',
      sec1Sub: 'Basic identity and personal details',
      sec2Title: 'Section 2: Contact & Emergency Information',
      sec2Sub: 'Phone numbers and emergency contact',
      sec3Title: 'Section 3: Educational & Professional Background',
      sec3Sub: 'Academic level, institution, and specialization',
      sec4Title: 'Section 4: Sunday School & Service Details',
      sec4Sub: 'Sunday school grade, history, and service department',
      sec5Title: 'Section 5: Spiritual Life (Father Confessor)',
      sec5Sub: 'Spiritual guidance and father confessor contact',

      // Section 1 Fields
      f1_email: 'Email Address',
      f1_email_ph: 'e.g. member@example.com',
      f2_firstName: 'First Name',
      f2_firstName_ph: 'First name of the member',
      f3_fatherName: "Father's Name",
      f3_fatherName_ph: "Father's name",
      f4_grandfatherName: "Grandfather's Name",
      f4_grandfatherName_ph: "Grandfather's name",
      f5_gender: 'Gender',
      f5_male: 'Male (ወንድ)',
      f5_female: 'Female (ሴት)',
      f6_photo: "Member's Photograph",
      f7_dob: 'Date of Birth',
      f8_maritalStatus: 'Marital Status',
      f8_single: 'Single (ያላገባ)',
      f8_married: 'Married (ያገባ)',
      f9_spouseName: "If married, spouse's name",
      f9_spouseName_ph: 'Enter full name of spouse',

      // Section 2 Fields
      f10_phone: 'Phone Number',
      f10_phone_ph: 'e.g. 0911223344',
      f11_emergencyName: 'Emergency Contact Name',
      f11_emergencyName_ph: 'Name of closest contact',
      f12_emergencyPhone: 'Emergency Contact Phone Number',
      f12_emergencyPhone_ph: 'e.g. 0911000000',
      f13_telegram: 'Do you use Telegram?',
      f13_yes: 'Yes, I use it (አዎ እጠቀማለሁ)',
      f13_no: "No, I don't use it (አይ አልጠቀምም)",

      // Section 3 Fields
      f14_eduLevel: 'Educational Level',
      f14_opt_g8_10: 'Grade 8-10 (ከ 8-10)',
      f14_opt_highSchool: 'High School (ሁለተኛ ደረጃ)',
      f14_opt_diploma: 'Diploma (ዲፕሎማ)',
      f14_opt_degree: "Bachelor's Degree (ዲግሪ)",
      f14_opt_masters: "Master's Degree (ማስተርስ)",
      f14_opt_phd: 'PhD (ፒኤችዲ)',
      f15_institution: 'Institution of study/training',
      f15_institution_ph: 'School, college, or university',
      f16_fieldOfStudy: 'Field of Study',
      f16_fieldOfStudy_ph: 'Major or area of specialization',

      // Section 4 Fields
      f17_joinedYear: 'When did you join this Sunday school?',
      f17_joinedYear_ph: 'e.g. 2015',
      f18_grewUp: "Did you grow up from the children's class?",
      f18_yes: 'Yes (አዎ)',
      f18_no: 'No (አይ)',
      f19_ssGrade: 'What grade are you studying in this Sunday school?',
      f19_notStudying: 'I am not studying (እየተማርኩ አይደለም)',
      f20_whyNotStudying: 'If not studying, why?',
      f20_whyNotStudying_ph: 'Explain reason for not attending class...',
      f21_subSection: 'In which sub-section do you serve?',
      f21_eduDept: 'Education Dept (ትምህርት ክፍል)',
      f21_childrenDept: 'Children Dept (ህፃናት)',
      f21_officeDept: 'Office (ጽ/ቤት)',
      f21_devDept: 'Development Dept (ልማት ክፍል)',
      f21_purchasingDept: 'Purchasing Dept (ግዥ ክፍል)',
      f22_servedOtherParish: 'Have you served in another parish before?',
      f22_no: "No, I haven't served (አይ አላገለገልኩም)",
      f22_yes: 'Yes, I have served (አዎ አገልግያለሁ)',
      f23_prevSubSection: 'If served, in which sub-section did you serve?',
      f23_prevSubSection_ph: 'Specify previous department or role...',

      // Section 5 Fields
      f24_hasFatherConfessor: 'Do you have a father confessor?',
      f24_yes: 'Yes, I have (አዎ አለኝ)',
      f24_no: "No, I don't have (አይ የለኝም)",
      f25_fcName: 'If yes, name of father confessor',
      f25_fcName_ph: "Father confessor's name",
      f26_fcParish: 'The parish where your father confessor serves',
      f26_fcParish_ph: 'Name of parish or church',
      f27_fcPhone: 'Phone number of your father confessor',
      f27_fcPhone_ph: 'e.g. 0911223344'
    },
    am: {
      // General & Actions
      appTitle: 'የሰንበት ትምህርት ቤት አባላት መመዝገቢያ ቅጽ',
      langName: 'አማርኛ',
      switchLang: 'English',
      submit: 'ምዝገባውን አጠናቅቅ',
      submitting: 'በመመዝገብ ላይ...',
      saveChanges: 'ለወጦችን አስቀምጥ',
      cancel: 'ሰርዝ',
      close: 'ዝጋ',
      required: 'ግዴታ',
      optional: 'ምርጫ',
      selectOption: 'ይምረጡ',

      // Section Titles
      sec1Title: 'ክፍል 1፡ የግል መረጃ (Personal Information)',
      sec1Sub: 'የአባሉ መሠረታዊ መረጃዎች',
      sec2Title: 'ክፍል 2፡ የግንኙነት እና የቅርብ ተጠሪ መረጃ (Contact & Emergency)',
      sec2Sub: 'የስልክ ቁጥር እና የቅርብ ተጠሪ መረጃ',
      sec3Title: 'ክፍል 3፡ የትምህርት እና የሥራ ሁኔታ (Educational & Professional)',
      sec3Sub: 'የትምህርት ደረጃ፣ ተቋም እና የሙያ ዘርፍ',
      sec4Title: 'ክፍል 4፡ የሰንበት ትምህርት ቤት እና የአገልግሎት መረጃ (Sunday School & Service)',
      sec4Sub: 'የክፍል ደረጃ፣ የአገልግሎት ዘርፍ እና ታሪክ',
      sec5Title: 'ክፍል 5፡ መንፈሳዊ ሕይወት / የንስሐ አባት (Spiritual Life)',
      sec5Sub: 'የንስሐ አባት እና የመንፈሳዊ ሕይወት መረጃ',

      // Section 1 Fields
      f1_email: 'የኢሜይል አድራሻ (Email)',
      f1_email_ph: 'ምሳሌ፡ member@example.com',
      f2_firstName: 'ስም (First Name)',
      f2_firstName_ph: 'የአባሉ/አባሏ ስም',
      f3_fatherName: 'የአባት ስም (Father\'s Name)',
      f3_fatherName_ph: 'የአባት ስም',
      f4_grandfatherName: 'የአያት ስም (Grandfather\'s Name)',
      f4_grandfatherName_ph: 'የአያት ስም',
      f5_gender: 'ጾታ (Gender)',
      f5_male: 'ወንድ (Male)',
      f5_female: 'ሴት (Female)',
      f6_photo: 'የአባሉ/አባሏ ፎቶ ግራፍ (Photograph)',
      f7_dob: 'የትዉልድ ዘመን (Date of Birth)',
      f8_maritalStatus: 'የትዳር ሁኔታ (Marital Status)',
      f8_single: 'ያላገባ (Single)',
      f8_married: 'ያገባ (Married)',
      f9_spouseName: 'ያገባ ከሆነ የትዳር አጋር ስም',
      f9_spouseName_ph: 'የትዳር አጋር ሙሉ ስም',

      // Section 2 Fields
      f10_phone: 'ስልክ ቁጥር (Phone Number)',
      f10_phone_ph: 'ምሳሌ፡ 0911223344',
      f11_emergencyName: 'የቅርብ ተጠሪ ስም (Emergency Contact Name)',
      f11_emergencyName_ph: 'የቅርብ ተጠሪ ሙሉ ስም',
      f12_emergencyPhone: 'የቅርብ ተጠሪ ስልክ ቁጥር (Emergency Contact Phone)',
      f12_emergencyPhone_ph: 'ምሳሌ፡ 0911000000',
      f13_telegram: 'ቴሌግራም ይጠቀማሉ? (Telegram Usage)',
      f13_yes: 'አዎ እጠቀማለሁ (Yes)',
      f13_no: 'አይ አልጠቀምም (No)',

      // Section 3 Fields
      f14_eduLevel: 'የትምህርት ደረጃ (Educational Level)',
      f14_opt_g8_10: 'ከ 8-10 (Grade 8-10)',
      f14_opt_highSchool: 'ሁለተኛ ደረጃ (High School)',
      f14_opt_diploma: 'ዲፕሎማ (Diploma)',
      f14_opt_degree: 'ዲግሪ (Bachelor\'s Degree)',
      f14_opt_masters: 'ማስተርስ (Master\'s Degree)',
      f14_opt_phd: 'ፒኤችዲ (PhD)',
      f15_institution: 'ያጠኑበት / የሰለጠኑበት ተቋም (Institution)',
      f15_institution_ph: 'የትምህርት ቤቱ፣ የኮሌጁ ወይም የዩኒቨርሲቲው ስም',
      f16_fieldOfStudy: 'የትምህርት አይነት (Field of Study)',
      f16_fieldOfStudy_ph: 'የተማሩበት የትምህርት ዘርፍ',

      // Section 4 Fields
      f17_joinedYear: 'መቸ ነው እዚህ ሰንበት ትምህርት ቤት የተቀላቀሉት?',
      f17_joinedYear_ph: 'ምሳሌ፡ 2015',
      f18_grewUp: 'ከህጻናት ክፍል ነው ያደጉት?',
      f18_yes: 'አዎ (Yes)',
      f18_no: 'አይ (No)',
      f19_ssGrade: 'እዚህ ሰንበት ትምህርት ስንተኛ ክፍል ነው የሚማሩት?',
      f19_notStudying: 'እየተማርኩ አይደለም (I am not studying)',
      f20_whyNotStudying: 'እየተማሩ ካልሆነ ለምን?',
      f20_whyNotStudying_ph: 'የማይማሩበትን ምክንያት ያብራሩ...',
      f21_subSection: 'ምን ንዑስ ክፍል ዉስጥ ነው የሚያገለግሉት?',
      f21_eduDept: 'ትምህርት ክፍል (Education Dept)',
      f21_childrenDept: 'ህፃናት (Children Dept)',
      f21_officeDept: 'ጽ/ቤት (Office)',
      f21_devDept: 'ልማት ክፍል (Development Dept)',
      f21_purchasingDept: 'ግዥ ክፍል (Purchasing Dept)',
      f22_servedOtherParish: 'ከዚህ በፊት በሌላ ደብር አገልግለዋል?',
      f22_no: 'አይ አላገለገልኩም (No)',
      f22_yes: 'አዎ አገልግያለሁ (Yes)',
      f23_prevSubSection: 'ካገለገሉ በምን ንዑስ ክፍል አገለገሉ?',
      f23_prevSubSection_ph: 'ያገለገሉበትን ክፍል ያብራሩ...',

      // Section 5 Fields
      f24_hasFatherConfessor: 'የንስሃ አባት አሎት? (Father Confessor)',
      f24_yes: 'አዎ አለኝ (Yes)',
      f24_no: 'አይ የለኝም (No)',
      f25_fcName: 'መልሶ አዎ ከሆነ የንስሃ አባት ስም',
      f25_fcName_ph: 'የንስሃ አባት ሙሉ ስም',
      f26_fcParish: 'የንስሃ አባትዎ የሚያገለግሉበት ደብር',
      f26_fcParish_ph: 'የደብሩ ወይም ቤተክርስቲያኑ ስም',
      f27_fcPhone: 'የንስሃ አባትዎ ስልክ ቁጥር',
      f27_fcPhone_ph: 'ምሳሌ፡ 0911223344'
    }
  };

  t(key: keyof typeof this.dictionary.en): string {
    const lang = this.currentLang();
    return this.dictionary[lang][key] || this.dictionary['en'][key] || key;
  }
}
