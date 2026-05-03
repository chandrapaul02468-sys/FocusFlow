import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, ArrowRight, Zap, Users, Shield, Github } from 'lucide-react';
import { motion } from 'motion/react';

export function Landing() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#141414] selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <CheckSquare className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tighter">FocusFlow</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
          </div>
          <button 
            onClick={signIn}
            className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-xl active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-template-columns-[1.2fr_0.8fr] gap-16 items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
                Manage work, <br />
                <span className="text-indigo-600">better.</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-lg mb-12 leading-relaxed">
                A collaborative workspace to streamline your tasks, track progress, 
                and collaborate with your team in real-time.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={signIn}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-2 group"
                >
                  Start for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex -space-x-3 items-center">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-12 h-12 rounded-full border-4 border-[#FDFCFB]" />
                  ))}
                  <span className="pl-6 text-sm font-semibold text-gray-400">+500 users already joined</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-100 relative z-10"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-50 rounded-xl"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-indigo-50 rounded-2xl flex items-end p-4">
                    <div className="w-full h-1/2 bg-indigo-200 rounded-t-lg"></div>
                  </div>
                  <div className="h-32 bg-gray-50 rounded-2xl"></div>
                </div>
                <div className="h-40 bg-gray-50 rounded-2xl"></div>
              </div>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-50 -z-10"></div>
          </div>
        </div>
      </main>

      {/* Social Proof */}
      <section className="border-y border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-12">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-30 grayscale">
            <Zap />
            <Shield />
            <Github />
            <CheckSquare />
          </div>
        </div>
      </section>
    </div>
  );
}
