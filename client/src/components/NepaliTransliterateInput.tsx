/**
 * NepaliTransliterateInput — A wrapper around react-transliterate
 * that lets users type in Romanized English and get Nepali (Devanagari) suggestions.
 *
 * Drop-in replacement for <input> on any Nepali text field.
 */

import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

interface NepaliTransliterateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function NepaliTransliterateInput({
  value,
  onChange,
  placeholder,
  className,
  style,
}: NepaliTransliterateInputProps) {
  return (
    <ReactTransliterate
      value={value}
      onChangeText={(val: string) => onChange(val)}
      lang="ne"
      containerClassName="np-transliterate-container"
      activeItemClassName="np-transliterate-active"
      renderComponent={(props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input
          {...props}
          type="text"
          className={className || "form-field__input form-field__input--np"}
          style={style}
          placeholder={placeholder}
        />
      )}
    />
  );
}
