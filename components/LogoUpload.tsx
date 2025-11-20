import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploadProps {
  logo: string | undefined;
  onLogoChange: (base64: string | undefined) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ logo, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onLogoChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Business Logo (Optional)
      </label>
      
      {!logo ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all group h-32"
        >
          <div className="p-2 bg-indigo-50 rounded-full mb-2 group-hover:bg-indigo-100 transition-colors">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-sm text-gray-500 font-medium group-hover:text-indigo-600">Click to upload logo</span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG (Max 2MB)</span>
        </div>
      ) : (
        <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm group">
          <img src={logo} alt="Business Logo" className="w-full h-full object-contain p-2" />
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default LogoUpload;