'use client';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function UrlInput({ value, onChange, disabled }: UrlInputProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Enter URLs
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="https://example.com&#10;https://another-site.com&#10;&#10;Enter one URL per line..."
        className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 text-gray-800 placeholder-gray-400"
      />
      <p className="text-xs text-gray-500">
        Enter one URL per line. URLs must include http:// or https://
      </p>
    </div>
  );
}
