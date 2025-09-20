import React, { useState } from 'react';
import {
  Dumbbell,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ChevronUp,
  Users,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import {useTranslation} from "react-i18next";


const Footer = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  const quickLinks = [
    { name: t('navigation.home'), path: '/' },
    { name: t('navigation.packages'), path: '/packages' },
    { name: t('navigation.qr'), path: '/qr' },
    { name: t('navigation.profile'), path: '/profile' }
  ];

  const programLinks = [
    { name: t('navigation.sessions'), path: '/profile/sessions' },
    { name: t('navigation.payments'), path: '/profile/payments' },
    { name: t('navigation.membership'), path: '/profile/membership-history' }
  ];

  const supportLinks = [
    { name: t('footer.contact_us'), path: '/contact' },
    { name: t('footer.help_center'), path: '/help' },
    { name: t('footer.privacy_policy'), path: '/privacy' },
    { name: t('footer.terms_service'), path: '/terms' }
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
    { name: 'Youtube', icon: Youtube, url: 'https://youtube.com' }
  ];

  const stats = [
    { icon: Users, value: '50K+', label: t('footer.stats.active_users') },
    { icon: Award, value: '500+', label: t('footer.stats.workouts') },
    { icon: Target, value: '95%', label: t('footer.stats.success_rate') },
    { icon: TrendingUp, value: '4.8★', label: t('footer.stats.rating') }
  ];

  return (
    <footer className="bg-dark-06 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-10 to-dark-06"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>

      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-brown-60/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-brown-70/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats Section */}
        <div className={`py-12 border-b border-gray-700/30 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, value, label }, index) => (
              <div
                key={label}
                className={`text-center group transform transition-all duration-700 hover:scale-105 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-dark-15 border border-brown-60/20 rounded-xl group-hover:bg-brown-60/10 group-hover:border-brown-60/40 transition-all duration-300">
                    <Icon className="w-6 h-6 text-brown-60 group-hover:text-brown-70 transition-colors" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-99 mb-1">{value}</div>
                <div className="text-sm text-gray-70">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className={`py-16 transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl  font-roboto text-white font-bold"><span className={" text-brown-60"}>Bull</span>Fit</span>
              </div>

              <p className="text-gray-70 leading-relaxed max-w-md">
                {t('footer.brand_description')}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-80 hover:text-brown-70 transition-colors">
                  <MapPin className="w-4 h-4 text-brown-60" />
                  <span className="text-sm">123 Fitness Street, Wellness City</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-80 hover:text-brown-70 transition-colors">
                  <Phone className="w-4 h-4 text-brown-60" />
                  <span className="text-sm">+998 (93) 447-40-09</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-80 hover:text-brown-70 transition-colors">
                  <Mail className="w-4 h-4 text-brown-60" />
                  <span className="text-sm">info@bullfit.uz</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-99">{t('footer.quick_links')}</h4>
              <ul className="space-y-3">
                {quickLinks.map(({ name, path }) => (
                  <li key={path}>
                    <a
                      href={path}
                      className="text-gray-70 hover:text-brown-70 transition-colors text-sm flex items-center group"
                    >
                      <ChevronUp className="w-3 h-3 mr-2 rotate-90 group-hover:translate-x-1 transition-transform" />
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Programs */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-99">{t('footer.programs')}</h4>
              <ul className="space-y-3">
                {programLinks.map(({ name, path }) => (
                  <li key={path}>
                    <a
                      href={path}
                      className="text-gray-70 hover:text-brown-70 transition-colors text-sm flex items-center group"
                    >
                      <ChevronUp className="w-3 h-3 mr-2 rotate-90 group-hover:translate-x-1 transition-transform" />
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              {/*<div>*/}
              {/*  <h4 className="text-lg font-semibold text-gray-99 mb-2">{t('footer.newsletter_title')}</h4>*/}
              {/*  <p className="text-sm text-gray-70">{t('footer.newsletter_description')}</p>*/}
              {/*</div>*/}

              {/*<div onSubmit={handleSubscribe} className="space-y-4">*/}
              {/*  <div className="relative">*/}
              {/*    <input*/}
              {/*      type="email"*/}
              {/*      value={email}*/}
              {/*      onChange={(e) => setEmail(e.target.value)}*/}
              {/*      placeholder={t('footer.email_placeholder')}*/}
              {/*      className="w-full px-4 py-3 bg-dark-15 border border-gray-700/50 rounded-lg text-gray-99 placeholder-gray-70 focus:outline-none focus:border-brown-60 focus:bg-dark-12 transition-all"*/}
              {/*      required*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*  <button*/}
              {/*    type="button"*/}
              {/*    onClick={handleSubscribe}*/}
              {/*    className="w-full px-4 py-3 bg-brown-60 hover:bg-brown-65 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-brown-60/25"*/}
              {/*  >*/}
              {/*    {t('footer.subscribe')}*/}
              {/*  </button>*/}
              {/*</div>*/}

              {/* Social Links */}
              <div>
                <h5 className="text-sm font-semibold text-gray-99 mb-3">{t('footer.follow_us')}</h5>
                <div className="flex space-x-3">
                  {socialLinks.map(({ name, icon: Icon, url }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-dark-15 border border-gray-700/50 rounded-lg hover:bg-brown-60/10 hover:border-brown-60/50 transition-all duration-300 group"
                    >
                      <Icon className="w-4 h-4 text-gray-70 group-hover:text-brown-60 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className={`py-8 border-t border-gray-700/30 transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

            {/* Language Switcher */}
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

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-gray-70">{t('footer.copyright')}</p>
              <p className="text-xs text-gray-80 mt-1">{t('footer.made_with')}</p>
            </div>

            {/* Support Links */}
            <div className="flex flex-wrap justify-center space-x-6">
              {supportLinks.slice(2).map(({ name, path }) => (
                <a
                  key={path}
                  href={path}
                  className="text-xs text-gray-70 hover:text-brown-70 transition-colors"
                >
                  {name}
                </a>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-8 right-8 p-3 bg-brown-60 hover:bg-brown-65 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  );
};

export default Footer;