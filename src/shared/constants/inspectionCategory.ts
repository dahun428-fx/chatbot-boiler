// inspectionCategory.ts

export type InspectionCode =
  | 'MET'
  | 'HEM'
  | 'IMM'
  | 'CAR'
  | 'ABD'
  | 'GEN'
  | 'PUL'
  | 'NEU'
  | 'URI'
  | 'FEM'
  | 'MUS'
  | 'OPH'
  | 'ENT';

export type InspectionCategoryItem = {
  code: InspectionCode;
  label: {
    ko: string;
    en: string;
  };
  fullName: {
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
};

export const InspectionCategories: Record<InspectionCode, InspectionCategoryItem> = {
  MET: {
    code: 'MET',
    label: { ko: '대사/내분비계', en: 'Metabolism / Endocrine' },
    fullName: { en: 'METabolic / Endocrine' },
    description: {
      ko: '호르몬, 혈당 등 대사 기능 관련 검사',
      en: 'Checks metabolism and hormonal function.',
    },
  },
  HEM: {
    code: 'HEM',
    label: { ko: '혈액검사', en: 'Blood Test' },
    fullName: { en: 'HEMatology' },
    description: {
      ko: '혈액을 통해 건강 상태를 파악합니다.',
      en: 'Analyzes blood for overall health.',
    },
  },
  IMM: {
    code: 'IMM',
    label: { ko: '감염/면역계', en: 'Infection / Immune' },
    fullName: { en: 'IMMune / Infection' },
    description: {
      ko: '면역력 및 감염 여부 검사',
      en: 'Checks immunity and infections.',
    },
  },
  CAR: {
    code: 'CAR',
    label: { ko: '심혈관계', en: 'Cardiovascular' },
    fullName: { en: 'CARdiovascular' },
    description: {
      ko: '심장과 혈관 관련 검사',
      en: 'Checks heart and blood vessel health.',
    },
  },
  ABD: {
    code: 'ABD',
    label: { ko: '복부/소화기계', en: 'Abdomen / Digestive' },
    fullName: { en: 'ABDominal / Gastrointestinal' },
    description: {
      ko: '소화기관 관련 검사',
      en: 'Examines digestive system health.',
    },
  },
  GEN: {
    code: 'GEN',
    label: { ko: '전신/신체계측', en: 'Body Measurement' },
    fullName: { en: 'GENeral / Anthropometry' },
    description: {
      ko: '신체 계측 관련 검사',
      en: 'Measures body size and weight.',
    },
  },
  PUL: {
    code: 'PUL',
    label: { ko: '폐/호흡기계', en: 'Pulmonary' },
    fullName: { en: 'PULmonary' },
    description: {
      ko: '폐 기능 및 호흡기 검사',
      en: 'Checks lungs and respiratory health.',
    },
  },
  NEU: {
    code: 'NEU',
    label: { ko: '뇌/신경계', en: 'Neurology' },
    fullName: { en: 'NEUrology' },
    description: {
      ko: '뇌 및 신경 관련 검사',
      en: 'Examines brain and nerves.',
    },
  },
  URI: {
    code: 'URI',
    label: { ko: '비뇨기계', en: 'Urology' },
    fullName: { en: 'URIlogy' },
    description: {
      ko: '소변과 관련된 검사',
      en: 'Checks urinary system health.',
    },
  },
  FEM: {
    code: 'FEM',
    label: { ko: '여성건강', en: 'Women’s Health' },
    fullName: { en: 'FEMale Health (Gynecology)' },
    description: {
      ko: '여성 생식기 및 관련 검사',
      en: 'Focuses on women’s reproductive health.',
    },
  },
  MUS: {
    code: 'MUS',
    label: { ko: '뼈/근골격계', en: 'Musculoskeletal' },
    fullName: { en: 'MUSculoskeletal' },
    description: {
      ko: '뼈 및 근육 관련 검사',
      en: 'Examines bones and muscles.',
    },
  },
  OPH: {
    code: 'OPH',
    label: { ko: '눈/시력', en: 'Ophthalmology' },
    fullName: { en: 'OPHthalmology' },
    description: {
      ko: '눈의 상태 및 시력 검사',
      en: 'Checks vision and eye health.',
    },
  },
  ENT: {
    code: 'ENT',
    label: { ko: '이비인후계', en: 'ENT' },
    fullName: { en: 'ENT (Ear, Nose, Throat)' },
    description: {
      ko: '귀, 코, 목 검사',
      en: 'Ear, nose, and throat exams.',
    },
  },
};
