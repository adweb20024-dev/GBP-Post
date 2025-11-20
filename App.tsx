
import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, ArrowLeft, Store, Plus, Edit2, Trash2, CheckCircle, ArrowRight } from 'lucide-react';
import InputField from './components/InputField';
import ResultCard from './components/ResultCard';
import { generateGBPPost } from './services/geminiService';
import { PostFormData, GeneratedPost, LoadingState, BusinessProfile } from './types';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'business' | 'create'>('business');
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Data State
  const [formData, setFormData] = useState<PostFormData>({
    businessName: '',
    category: '',
    city: '',
    audience: '',
    topic: ''
  });

  const [savedBusinesses, setSavedBusinesses] = useState<BusinessProfile[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  
  // Generation State
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  // Load businesses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gbp_saved_businesses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedBusinesses(parsed);
        // If no businesses, default to editing mode
        if (parsed.length === 0) setIsEditingBusiness(true);
      } catch (e) {
        console.error("Failed to parse saved businesses", e);
        setIsEditingBusiness(true);
      }
    } else {
      setIsEditingBusiness(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // PAGE 1 ACTIONS
  const handleSaveBusiness = () => {
    if (!formData.businessName || !formData.category) {
      setError("Business Name and Category are required.");
      return;
    }

    const newId = selectedBusinessId || Date.now().toString();
    const newProfile: BusinessProfile = {
      id: newId,
      businessName: formData.businessName,
      category: formData.category,
      city: formData.city,
      audience: formData.audience
    };

    let updatedList;
    if (selectedBusinessId && savedBusinesses.some(b => b.id === selectedBusinessId)) {
      // Update existing
      updatedList = savedBusinesses.map(b => b.id === selectedBusinessId ? newProfile : b);
    } else {
      // Add new
      updatedList = [...savedBusinesses, newProfile];
    }
    
    setSavedBusinesses(updatedList);
    localStorage.setItem('gbp_saved_businesses', JSON.stringify(updatedList));
    setSelectedBusinessId(newId);
    setIsEditingBusiness(false);
    setError(null);
  };

  const handleSaveAndContinue = () => {
    handleSaveBusiness();
    if (formData.businessName && formData.category) {
      setView('create');
    }
  };

  const handleEditBusiness = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const business = savedBusinesses.find(b => b.id === id);
    if (business) {
      setFormData({ ...business, topic: '' });
      setSelectedBusinessId(id);
      setIsEditingBusiness(true);
    }
  };

  const handleDeleteBusiness = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = savedBusinesses.filter(b => b.id !== id);
    setSavedBusinesses(updatedList);
    localStorage.setItem('gbp_saved_businesses', JSON.stringify(updatedList));
    if (updatedList.length === 0) {
      setIsEditingBusiness(true);
      resetForm();
    }
  };

  const handleSelectBusiness = (business: BusinessProfile) => {
    setFormData({
      businessName: business.businessName,
      category: business.category,
      city: business.city,
      audience: business.audience,
      topic: ''
    });
    setSelectedBusinessId(business.id);
    setView('create');
    setGeneratedPost(null);
  };

  const handleAddNewClick = () => {
    resetForm();
    setIsEditingBusiness(true);
  };

  const resetForm = () => {
    setFormData({
      businessName: '',
      category: '',
      city: '',
      audience: '',
      topic: ''
    });
    setSelectedBusinessId('');
    setError(null);
  };

  // PAGE 2 ACTIONS
  const handleSubmitPost = async (e: React.FormEvent) => {
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

  const handleBackToBusinesses = () => {
    setView('business');
    setIsEditingBusiness(false);
    setGeneratedPost(null);
  };

  // --- VIEWS ---

  const renderBusinessPage = () => (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Businesses</h2>
        <p className="text-gray-500">Select a business profile to generate posts for, or add a new one.</p>
      </div>

      {isEditingBusiness ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-600" />
              {selectedBusinessId ? 'Edit Business Profile' : 'Add New Business'}
            </h3>
            {savedBusinesses.length > 0 && (
              <button onClick={() => setIsEditingBusiness(false)} className="text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
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
                  label="City / Service Area"
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
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveAndContinue}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Save & Continue <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { handleSaveBusiness(); setIsEditingBusiness(false); }}
                className="flex-1 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Save Only
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Add New Card */}
            <button
              onClick={handleAddNewClick}
              className="min-h-[160px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Add New Business</span>
            </button>

            {/* Existing Business Cards */}
            {savedBusinesses.map((business) => (
              <div 
                key={business.id}
                onClick={() => handleSelectBusiness(business)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative group"
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleEditBusiness(business.id, e)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteBusiness(business.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold mb-4">
                  {business.businessName.substring(0, 2).toUpperCase()}
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-1">{business.businessName}</h3>
                <p className="text-sm text-gray-500 mb-4">{business.category} • {business.city}</p>
                
                <div className="flex items-center text-indigo-600 text-sm font-medium">
                  Select Profile <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCreatePage = () => (
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Column */}
      <div className="lg:col-span-5 xl:col-span-4">
        <button 
          onClick={handleBackToBusinesses}
          className="mb-6 flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Businesses
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-500" />
              {formData.businessName}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{formData.category} in {formData.city}</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmitPost}>
              <InputField
                label="What is this post about?"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g. We are launching a new summer menu with fresh strawberry tarts!"
                required
                isTextArea
              />

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                  <span className="block">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === LoadingState.LOADING || !formData.topic}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-md transition-all flex items-center justify-center gap-2
                  ${status === LoadingState.LOADING || !formData.topic
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]'}`}
              >
                {status === LoadingState.LOADING ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Post
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
           <h4 className="text-sm font-bold text-indigo-900 mb-1">Ready to post?</h4>
           <p className="text-xs text-indigo-700">
             Once generated, copy the text and download the image to post directly to your Google Business Profile updates.
           </p>
        </div>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-7 xl:col-span-8 min-h-[600px]">
        <ResultCard 
          post={generatedPost} 
          loading={status === LoadingState.LOADING}
          formData={formData}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => setView('business')} style={{cursor: 'pointer'}}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">LocalBoost AI</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
              {view === 'business' ? 'Step 1: Select Business' : 'Step 2: Create Post'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 sm:px-6 lg:px-8 w-full">
        {view === 'business' ? renderBusinessPage() : renderCreatePage()}
      </main>
    </div>
  );
};

export default App;
