import React, { useState } from 'react';
import { MapPin, Sparkles, LayoutTemplate, AlertCircle } from 'lucide-react';
import InputField from './components/InputField';
import ResultCard from './components/ResultCard';
import { generateGBPPost } from './services/geminiService';
import { PostFormData, GeneratedPost, LoadingState } from './types';

const App: React.FC = () => {
  const [formData, setFormData] = useState<PostFormData>({
    businessName: '',
    category: '',
    city: '',
    audience: '',
    topic: '',
  });

  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(LoadingState.LOADING);
    setError(null);

    try {
      const result = await generateGBPPost(formData);
      setGeneratedPost(result);
      setStatus(LoadingState.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(LoadingState.ERROR);
    }
  };

  const fillDemoData = () => {
    setFormData({
      businessName: "Crumb & Kettle",
      category: "Artisan Bakery",
      city: "Portland, OR",
      audience: "Locals seeking organic pastries",
      topic: "Weekend Special Sourdough Promotion"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">LocalBoost AI</h1>
              <p className="text-xs text-gray-500 font-medium -mt-1">Google Business Profile Optimizer</p>
            </div>
          </div>
          <button 
            onClick={fillDemoData}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <LayoutTemplate className="w-4 h-4" />
            Load Demo Data
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Business Details</h2>
                <p className="text-sm text-gray-500">Define the context for your post.</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <InputField
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g. The Cozy Corner"
                  required
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Coffee Shop"
                    required
                  />
                  <InputField
                    label="Service Area/City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Austin, TX"
                    required
                  />
                </div>

                <InputField
                  label="Target Audience"
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  placeholder="e.g. Students, Families"
                  required
                />

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Post Topic
                  </h3>
                  <InputField
                    label="What is this post about?"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g. New summer menu launch"
                    required
                    isTextArea
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === LoadingState.LOADING}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-md transition-all 
                    ${status === LoadingState.LOADING 
                      ? 'bg-indigo-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]'}`}
                >
                  {status === LoadingState.LOADING ? 'Generating...' : 'Generate Post'}
                </button>
              </form>
            </div>
            
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-800 mb-1">Pro Tip</h4>
              <p className="text-xs text-blue-600 leading-relaxed">
                Google Business Profile posts expire after 6 months (unless they are event posts). Regular updates (1-2 times per week) signal to Google that your business is active.
              </p>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ResultCard 
              post={generatedPost} 
              loading={status === LoadingState.LOADING} 
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;