import React, { useState, useEffect } from 'react';
import { Play, Dumbbell, Target, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FloatingIcon from '../../components/FloatingIcon.jsx';
import useTypingAnimation from "../../hooks/useTypingAnimation.js";



const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const subtitle = t('hero.subtitle');
  const typedSubtitle = useTypingAnimation(subtitle, 80);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { key: 'personalized', icon: Target },
    { key: 'progress', icon: TrendingUp },
    { key: 'community', icon: Users },
    { key: 'expert', icon: Dumbbell }
  ];

  return (
    <div className="min-h-screen bg-dark-06 relative overflow-hidden">
      {/* Floating icons */}
      <FloatingIcon icon={Dumbbell} delay={0} position="top-25 left-10 md:left-20" />
      <FloatingIcon icon={Target} delay={1} position="top-50 md:top-40 right-16 md:right-32" />
      <FloatingIcon icon={TrendingUp} delay={2} position="bottom-40 left-16 md:left-30" />
      <FloatingIcon icon={Users} delay={1.5} position="bottom-32 right-20 md:right-24" />


      <div className="relative z-10 container">
        <div className="min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">

            {/* Left Content */}
            <div className={`space-y-8 transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
            }`}>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-99 leading-tight">
                  {t('hero.title')}
                </h1>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brown-60 leading-tight">
                  {typedSubtitle}
                  <span className="animate-pulse text-brown-70">|</span>
                </h2>
              </div>

              <p className="text-lg md:text-xl text-gray-70 max-w-2xl leading-relaxed">
                {t('hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button className="group bg-brown-60 hover:bg-brown-65 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-brown-60/25">
                  {t('hero.start_training')}
                </button>

                <button className="group flex items-center justify-center gap-3 bg-transparent border-2 border-gray-700/50 hover:border-brown-70 text-gray-90 hover:text-brown-70 px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {t('hero.watch_demo')}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {features.map(({ key, icon: Icon }, index) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-4 bg-dark-12/50 border border-gray-700/30 rounded-lg backdrop-blur-sm transform transition-all duration-500 hover:bg-dark-15/50 hover:border-brown-70/30 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100 + 600}ms` }}
                  >
                    <div className="p-2 bg-brown-60/10 rounded-lg">
                      <Icon className="w-5 h-5 text-brown-70" />
                    </div>
                    <span className="text-gray-90 font-medium text-sm">
                      {t(`hero.features.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual Element */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
            }`}>

              {/* 3D Layered Cards Stack */}
              <div className="relative w-full max-w-sm mx-auto h-96">

                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-brown-60/30 via-brown-70/10 to-transparent rounded-3xl blur-2xl"></div>

                {/* Card Stack */}
                <div className="relative h-full">

                  {/* Back Card */}
                  <div className="absolute top-8 left-4 right-0 h-80 bg-dark-15 border border-gray-700/40 rounded-2xl transform rotate-6 transition-transform hover:rotate-12 shadow-2xl">
                    <div className="p-6 h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-brown-60/20 rounded-full flex items-center justify-center">
                          <Target className="w-6 h-6 text-brown-60" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-70">Goals</div>
                          <div className="text-lg font-bold text-gray-99">85%</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-2 bg-dark-20 rounded-full overflow-hidden">
                          <div className="h-full w-4/5 bg-gradient-to-r from-brown-60 to-brown-70 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-xs text-gray-70">Weekly Progress</div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Card */}
                  <div className="absolute top-4 left-2 right-2 h-80 bg-dark-12 border border-gray-700/50 rounded-2xl transform rotate-3 transition-transform hover:rotate-6 shadow-xl">
                    <div className="p-6 h-full flex flex-col justify-center items-center text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-brown-60 to-brown-70 rounded-2xl flex items-center justify-center animate-bounce">
                          <Dumbbell className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-brown-90 rounded-full animate-ping"></div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-99">1,247</div>
                        <div className="text-sm text-gray-70">Calories Burned</div>
                      </div>
                      <div className="flex space-x-4 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-brown-60">45</div>
                          <div className="text-gray-70">min</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-brown-60">12</div>
                          <div className="text-gray-70">sets</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Front Card */}
                  <div className="absolute top-0 left-0 right-4 h-80 bg-gradient-to-br from-dark-10 to-dark-15 border border-brown-60/30 rounded-2xl transform hover:-rotate-3 transition-all duration-300 shadow-2xl">
                    <div className="p-6 h-full">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-brown-60 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-gray-90">Live Session</span>
                        </div>
                        <div className="text-xs text-gray-70">12:34 PM</div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="text-sm text-gray-70 mb-2">Heart Rate</div>
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl font-bold text-brown-60">142</div>
                            <div className="text-sm text-gray-70">bpm</div>
                            <div className="flex space-x-1">
                              {[1,2,3,4,5].map((i) => (
                                <div key={i} className={`w-1 bg-brown-60 rounded-full animate-pulse`}
                                     style={{height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s`}}>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-70">Steps Today</span>
                            <span className="font-bold text-gray-99">8,432</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-70">Distance</span>
                            <span className="font-bold text-gray-99">6.2 km</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-70">Active Time</span>
                            <span className="font-bold text-brown-60">2h 15m</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="h-1 bg-dark-25 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-brown-60 to-brown-70 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-70 mt-2">Daily Goal: 75% Complete</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 right-8 w-6 h-6 bg-brown-70/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-0 -left-6 w-8 h-8 border-2 border-brown-60/40 rounded-lg rotate-45 animate-spin-slow"></div>
                <div className="absolute top-1/2 -right-3 w-4 h-4 bg-brown-80/50 rounded-full animate-pulse"></div>

              </div>
            </div>


          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-06 to-transparent"></div>

      </div>



    </div>
  );
};

export default HeroSection;