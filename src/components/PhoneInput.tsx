import React, { useState, useEffect } from 'react';
import COUNTRY_CODES_JSON from './countries.json';
 
interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  length: number;
  flag: string;
}

const COUNTRY_CODES = COUNTRY_CODES_JSON as CountryCode[];
 
interface PhoneInputProps {
  value: string; // expects "+91 9876543210" or similar
  onChange: (value: string) => void;
  onValidate?: (isValid: boolean) => void;
  required?: boolean;
}
 
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onValidate,
  required = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [localNumber, setLocalNumber] = useState('');
 
  // Parse initial value (e.g., "+91 9876543210")
  useEffect(() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length >= 2) {
        const dial = parts[0];
        const num = parts.slice(1).join('');
        const found = COUNTRY_CODES.find(c => c.dialCode === dial);
        if (found) {
          setSelectedCountry(found);
          setLocalNumber(num);
          return;
        }
      }
      setLocalNumber(value);
    }
  }, [value]);
 
  const validate = (country: CountryCode, num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    let isValid = false;
 
    if (!cleanNum) {
      isValid = !required;
    } else {
      isValid = cleanNum.length === country.length;
    }
 
    if (onValidate) {
      onValidate(isValid);
    }
  };
 
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const found = COUNTRY_CODES.find(c => c.code === code);
    if (found) {
      setSelectedCountry(found);
      const cleanNum = localNumber.replace(/\D/g, '');
      const fullVal = `${found.dialCode} ${cleanNum}`;
      onChange(fullVal);
      validate(found, cleanNum);
    }
  };
 
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanNum = rawVal.replace(/\D/g, '');
    setLocalNumber(cleanNum);
 
    const fullVal = `${selectedCountry.dialCode} ${cleanNum}`;
    onChange(fullVal);
    validate(selectedCountry, cleanNum);
  };
 
  const hasError = localNumber.length > 0 && localNumber.length !== selectedCountry.length;
 
  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <select
          value={selectedCountry.code}
          onChange={handleCountryChange}
          className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-2.5 py-2 outline-none focus:border-[#9b51e0] focus:ring-1 focus:ring-[#9b51e0] shrink-0"
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} ({c.dialCode})
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={`Enter ${selectedCountry.length}-digit number`}
          className={`grow px-3 py-2 bg-slate-50 border ${
            hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-[#9b51e0]'
          } rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#9b51e0]/20 transition-all`}
        />
      </div>
      {hasError && (
        <p className="text-[10px] text-rose-500 font-medium">
          Phone number must have exactly {selectedCountry.length} digits for {selectedCountry.name}.
        </p>
      )}
    </div>
  );
};
