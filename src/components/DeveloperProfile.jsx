import React, { useEffect } from 'react';
import { X, Github, Facebook, Globe, Mail, MapPin, Code2, Database, Layout, Server, MessageCircle, GitBranch, Box, Cloud, Zap, Edit, Cpu, Layers, Terminal, Atom, Wind, HardDrive, Network, Globe2, FileCode, Linkedin } from 'lucide-react';

const DeveloperProfile = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const skills = {
    frontend: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS', 'JavaScript', 'TypeScript'],
    backend: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs', 'GraphQL'],
    tools: ['Git', 'Docker', 'AWS', 'Firebase', 'Vercel', 'VS Code']
  };

  const skillIcons = {
    // Frontend
    'React': Atom,
    'Next.js': Globe2,
    'Vue.js': Layers,
    'Tailwind CSS': Wind,
    'JavaScript': FileCode,
    'TypeScript': Code2,
    // Backend
    'Node.js': Server,
    'Express': Zap,
    'MongoDB': Database,
    'PostgreSQL': HardDrive,
    'REST APIs': Network,
    'GraphQL': GitBranch,
    // Tools
    'Git': GitBranch,
    'Docker': Box,
    'AWS': Cloud,
    'Firebase': Zap,
    'Vercel': Edit,
    'VS Code': Terminal
  };

  const socialLinks = [
    { icon: Github, label: 'GitHub', url: 'https://github.com/salahuddingfx', bg: '#1F2937', iconBg: 'rgba(255,255,255,0.2)' },
    { icon: MessageCircle, label: 'WhatsApp', url: 'https://wa.me/8801570249299', bg: '#25D366', iconBg: 'rgba(255,255,255,0.2)' },
    { icon: Facebook, label: 'Facebook', url: 'https://facebook.com/salahuddingfx', bg: '#1877F2', iconBg: 'rgba(255,255,255,0.2)' },
    { icon: Globe, label: 'Portfolio', url: 'https://salahuddin.codes', bg: '#BE123C', iconBg: 'rgba(255,255,255,0.2)' },
    { icon: Mail, label: 'Personal Email', url: 'mailto:salauddinkaderappy@gmail.com', bg: '#DC2626', iconBg: 'rgba(255,255,255,0.2)' }
  ];

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto animate-slide-up relative custom-scrollbar scroll-smooth"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-maroon text-white p-6 sm:p-8 md:p-10 overflow-hidden sticky top-0 z-50 shadow-xl">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 hover:rotate-90 duration-300 z-30 backdrop-blur-md"
            aria-label="Close developer profile"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 sm:gap-7">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0 border-4 border-white/30 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300 rotate-3 group-hover:rotate-0">
                <img
                  src="https://github.com/salahuddingfx.png"
                  alt="Salah Uddin Kader"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <span className="text-5xl sm:text-6xl font-bold hidden">SK</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">Salah Uddin Kader</h2>
              <p className="text-white/95 text-base sm:text-lg mb-3 font-medium drop-shadow-md">Full Stack Developer | MERN Stack Expert</p>
              <div className="inline-flex items-center justify-center md:justify-start space-x-2 text-sm sm:text-base text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Cox's Bazar, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 md:p-10 space-y-7 sm:space-y-9">
          {/* About */}
          <div className="animate-fade-in-up">
            <div className="flex items-center mb-4 sm:mb-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-maroon rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-maroon dark:text-pink-600">About Me</h3>
            </div>
            <p className="text-sm sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed border-l-4 border-maroon dark:border-pink-600 pl-4 sm:pl-6 py-1 italic shadow-sm bg-maroon/5 dark:bg-pink-600/5 rounded-r-2xl">
              "I am Salah Uddin Kader, a passionate Full Stack Developer specializing in the MERN stack with 1.5+ years of professional experience.
              I pride myself on creating high-performance, visually stunning e-commerce solutions and custom web applications.
              Based in the heart of Cox's Bazar, I'm dedicated to delivering excellence and helping businesses thrive in the digital landscape.
              Let's build something extraordinary together!"
            </p>
          </div>

          {/* Tech Stack */}
          <div className="animate-fade-in-up stagger-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-maroon dark:text-pink-600 mb-5 sm:mb-6">Tech Stack & Skills</h3>
            <div className="space-y-5 sm:space-y-6">
              {/* Frontend */}
              <div className="group">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Layout className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">Frontend Development</h4>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {skills.frontend.map((skill, index) => {
                    const Icon = skillIcons[skill];
                    return (
                      <span
                        key={skill}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-xl text-xs sm:text-sm font-bold border-2 border-blue-100 dark:border-blue-800 hover:scale-105 hover:shadow-lg hover:border-blue-400 transition-all duration-300 cursor-pointer flex items-center gap-2 group/skill"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {Icon && <Icon className="h-4 w-4 text-blue-500 group-hover/skill:rotate-12 transition-transform" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Backend */}
              <div className="group">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">Backend Development</h4>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {skills.backend.map((skill, index) => {
                    const Icon = skillIcons[skill];
                    return (
                      <span
                        key={skill}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-xl text-xs sm:text-sm font-bold border-2 border-green-100 dark:border-green-800 hover:scale-105 hover:shadow-lg hover:border-green-400 transition-all duration-300 cursor-pointer flex items-center gap-2 group/skill"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {Icon && <Icon className="h-4 w-4 text-green-500 group-hover/skill:rotate-12 transition-transform" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Tools */}
              <div className="group">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Box className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-maroon dark:text-pink-600">Tools & Technologies</h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {skills.tools.map((skill, index) => {
                    const IconComponent = skillIcons[skill];
                    return (
                      <div
                        key={skill}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 rounded-2xl text-xs sm:text-sm font-bold border-2 border-purple-100 dark:border-purple-900 shadow-sm hover:shadow-purple-200 dark:hover:shadow-black/40 hover:scale-105 hover:border-purple-400 transition-all duration-300 flex items-center gap-2 group/tool"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 group-hover/tool:rotate-12 transition-transform" />
                        )}
                        <span>{skill}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="animate-fade-in-up stagger-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-maroon dark:text-pink-600 mb-4 sm:mb-5">Connect With Me</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {socialLinks.map(({ icon: IconComponent, label, url, bg, iconBg }) => {
                const Icon = IconComponent;
                return (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 sm:p-6 text-white rounded-3xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group overflow-hidden relative"
                    style={{ backgroundColor: bg }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                      <Icon className="h-16 w-16" />
                    </div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-all duration-300 shadow-lg relative z-10"
                      style={{ backgroundColor: iconBg }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-base sm:text-xl font-bold block">{label}</span>
                      <span className="text-xs text-white/70 font-medium">Follow Profile →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-maroon p-6 sm:p-8 rounded-3xl text-center shadow-2xl animate-fade-in-up stagger-3">
            <h4 className="text-2xl sm:text-3xl font-bold text-white mb-2">Need a Developer?</h4>
            <p className="text-sm sm:text-base text-white/90 mb-5">
              I'm available for freelance projects and full-time opportunities
            </p>
            <a
              href="mailto:salauddinkaderappy@gmail.com"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-maroon font-bold text-lg rounded-2xl hover:bg-cream-light hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <Mail className="h-6 w-6" />
              <span>Direct Hire / Collaborate</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfile;