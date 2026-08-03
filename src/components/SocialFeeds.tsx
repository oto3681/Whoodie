import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, ExternalLink, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';

export const SocialFeeds: React.FC = () => {
  const { wpSettings } = useApp();

  const posts = [
    {
      id: 1,
      platform: 'TikTok',
      title: 'Printing 200 Custom Hoodies in 3 Hours! 🔥 #ScreenPrinting #Nairobi',
      likes: '14.2K',
      comments: '342',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
      link: wpSettings.tiktokUrl
    },
    {
      id: 2,
      platform: 'Instagram',
      title: 'High gloss 3D Acrylic Storefront Signage installation completed in Westlands ✨',
      likes: '8.9K',
      comments: '180',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
      link: wpSettings.instagramUrl
    },
    {
      id: 3,
      platform: 'Facebook',
      title: 'Behind the press: Express 24-Hour Funeral Booklet printing department at work.',
      likes: '5.4K',
      comments: '95',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      link: wpSettings.facebookUrl
    }
  ];

  return (
    <section className="bg-slate-900 text-white py-16 border-t border-b border-slate-800 my-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/80 inline-block mb-2">
              <Sparkles className="w-3 h-3 inline mr-1 text-blue-400" /> Social Media Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Watch Our Print Press in Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-medium">
              Follow Woodynat Designers Limited on Facebook, Instagram, and TikTok to see behind-the-scenes video tours, client unboxings, and custom branding tutorials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href={wpSettings.tiktokUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              TikTok
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a 
              href={wpSettings.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              Instagram
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a 
              href={wpSettings.facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              Facebook
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700/60 hover:border-blue-500/50 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative aspect-16/9 bg-slate-950 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=800&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                />

                <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-xs border border-slate-700">
                  {post.platform}
                </span>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600/90 group-hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-100 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-pink-400 font-bold">
                      <Heart className="w-3.5 h-3.5 fill-pink-400" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                    </span>
                  </div>
                  <span className="text-blue-400 font-bold flex items-center gap-1">
                    Watch <Share2 className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
