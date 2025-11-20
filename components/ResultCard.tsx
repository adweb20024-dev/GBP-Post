import React, { useState } from 'react';
import { Copy, Check, ExternalLink, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { GeneratedPost } from '../types';

interface ResultCardProps {
  post: GeneratedPost | null;
  loading: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ post, loading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(post.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Generating copy and image...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] text-center">
        <div className="bg-indigo-50 p-4 rounded-full mb-4">
          <MessageSquare className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate</h3>
        <p className="text-gray-500 max-w-xs">
          Fill out the business details on the left to create a high-converting Google Business Profile update with a custom image.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Generated Preview
        </h2>
        <span className="text-indigo-200 text-xs font-mono">GEMINI + IMAGEN</span>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        
        {post.imageUrl && (
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Generated Image
            </label>
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
               <img 
                src={post.imageUrl} 
                alt="AI Generated" 
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          </div>
        )}

        <div className="flex-grow">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Post Body (Optimized for SEO)
          </label>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
            {post.body}
          </div>
          
          <div className="mt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Call to Action Button
            </label>
            <div className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 border-indigo-200">
              {post.cta}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Body Text
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;