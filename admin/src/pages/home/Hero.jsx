import React, { useState, useEffect } from 'react';
import { Play, Dumbbell, Target, TrendingUp, Users } from 'lucide-react';

// Mock i18n hook - replace with your actual i18n implementation
const useTranslation = () => {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      "hero.title": "Helps for your",
      "hero.subtitle": "ideal body fitness",
      "hero.description": "Motivate users with benefits and positive reinforcement, and offer modifications and progress tracking.",
      "hero.start_training": "Start Training",
      "hero.watch_demo": "Watch Demo",
      "hero.features.personalized": "Personalized Workouts",
      "hero.features.progress": "Progress Tracking",
      "hero.features.community": "Community Support",
      "hero.features.expert": "Expert Guidance"
    },
    ru: {
      "hero.title": "Помощь для вашего",
      "hero.subtitle": "идеального тела и фитнеса",
      "hero.description": "Мотивируйте пользователей преимуществами и положительным подкреплением, предлагайте модификации и отслеживание прогресса.",
      "hero.start_training": "Начать Тренировки",
      "hero.watch_demo": "Смотреть Демо",
      "hero.features.personalized": "Персональные Тренировки",
      "hero.features.progress": "Отслеживание Прогресса",
      "hero.features.community": "Поддержка Сообщества",
      "hero.features.expert": "Экспертное Руководство"
    },
    uz: {
      "hero.title": "Sizning uchun yordam",
      "hero.subtitle": "ideal tana fitnesiga",
      "hero.description": "Foydalanuvchilarni afzalliklar va ijobiy rag'batlantirish bilan motivatsiyalang, o'zgarishlar va progress kuzatishni taklif qiling.",
      "hero.start_training": "Mashq Qilishni Boshlash",
      "hero.watch_demo": "Demo Ko'rish",
      "hero.features.personalized": "Shaxsiy Mashqlar",
      "hero.features.progress": "Progress Kuzatuvi",
      "hero.features.community": "Jamoa Yordami",
      "hero.features.expert": "Ekspert Yo'riqnomasi"
    }
  };

  const t = (key) => translations[language][key] || key;

  return { t, i18n: { changeLanguage: setLanguage, language } };
};

// Typing animation hook
const useTypingAnimation = (text, speed = 100) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return displayText;
};

// Floating icons animation component
const FloatingIcon = ({ icon: Icon, delay = 0, position }) => {
  return (
    <div
      className={`absolute ${position} animate-bounce`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      <div className="bg-dark-15 border border-gray-700/30 rounded-full p-3 backdrop-blur-sm">
        <Icon className="w-6 h-6 text-brown-70" />
      </div>
    </div>
  );
};

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
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-10 via-dark-06 to-dark-12"></div>

      {/* Floating icons */}
      <FloatingIcon icon={Dumbbell} delay={0} position="top-20 left-10 md:left-20" />
      <FloatingIcon icon={Target} delay={1} position="top-40 right-16 md:right-32" />
      <FloatingIcon icon={TrendingUp} delay={2} position="bottom-40 left-16 md:left-40" />
      <FloatingIcon icon={Users} delay={1.5} position="bottom-32 right-20 md:right-24" />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex space-x-2">
          {['en', 'ru', 'uz'].map((lang) => (
            <button
              key={lang}
              onClick={() => i18n.changeLanguage(lang)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                i18n.language === lang
                  ? 'bg-brown-60 text-white'
                  : 'bg-dark-15 text-gray-70 hover:text-brown-70 hover:bg-dark-20'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

              {/* Main visual container */}
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-brown-60/20 to-brown-70/10 rounded-3xl blur-3xl"></div>

                {/* Main content area */}
                <div className="relative bg-dark-12/50 border border-gray-700/30 rounded-3xl p-8 backdrop-blur-sm">

                  {/* Fitness icon/illustration replacement */}
                  <div className="text-center space-y-6">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-brown-60 to-brown-70 rounded-full flex items-center justify-center transform animate-pulse">
                      <Dumbbell className="w-16 h-16 text-white" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-99">Fitness</h3>
                      <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-brown-60 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-brown-70 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-brown-80 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Stats/metrics */}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brown-60">500+</div>
                      <div className="text-xs text-gray-70">Workouts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brown-60">50k+</div>
                      <div className="text-xs text-gray-70">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brown-60">4.8★</div>
                      <div className="text-xs text-gray-70">Rating</div>
                    </div>
                  </div>
                </div>

                {/* Floating elements around the main container */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-brown-70 rounded-full animate-ping"></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 border-2 border-brown-60 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-06 to-transparent"></div>
    </div>
  );
};

export default HeroSection;