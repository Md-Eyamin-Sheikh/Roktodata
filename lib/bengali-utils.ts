export const toBengaliDigits = (num: number | string): string => {
  const bnDigits: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return num.toString().replace(/[0-9]/g, (w) => bnDigits[w] || w);
};

export const toEnglishDigits = (str: string): string => {
  const enDigits: { [key: string]: string } = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return str.replace(/[০-৯]/g, (w) => enDigits[w] || w);
};

export const formatDigits = (num: number | string, lang: 'bn' | 'en' = 'bn'): string => {
  if (lang === 'en') {
    return toEnglishDigits(num.toString());
  }
  return toBengaliDigits(num);
};

export const formatBengaliPhone = (phone: string): string => {
  const clean = toEnglishDigits(phone).replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  return phone;
};
