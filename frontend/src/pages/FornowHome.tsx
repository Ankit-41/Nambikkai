import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, BarChart3, Brain, Users, Heart, Stethoscope, Hospital, Trophy, ArrowRight, Play, Shield, Award, Clock, TrendingUp, Zap, Target, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [counts, setCounts] = useState({
    kneePatients: 0,
    aclInjuries: 0,
    aclIndia: 0,
    aclUS: 0,
    marketSize: 0,
    settlements: 0,
    recoveryTime: 0
  });

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setCurrentSection((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      const animateCounts = () => {
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const progress = step / steps;
          
          setCounts({
            kneePatients: Math.floor(15 * progress),
            aclInjuries: Math.floor(2.15 * progress * 100) / 100,
            aclIndia: Math.floor(400 * progress),
            aclUS: Math.floor(300 * progress),
            marketSize: Math.floor(6.9 * progress * 100) / 100,
            settlements: Math.floor(1.2 * progress * 100) / 100,
            recoveryTime: Math.floor(3 + (2 * progress))
          });

          if (step >= steps) {
            clearInterval(interval);
            // Set final values
            setCounts({
              kneePatients: 15,
              aclInjuries: 2.15,
              aclIndia: 400,
              aclUS: 300,
              marketSize: 6.9,
              settlements: 1.2,
              recoveryTime: 5
            });
          }
        }, stepDuration);
      };

      const timer = setTimeout(animateCounts, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const stats = [
    { label: 'Knee Patients/year worldwide', value: counts.kneePatients, suffix: 'M+', icon: Users, color: 'text-blue-300' },
    { label: 'ACL injuries worldwide', value: counts.aclInjuries, suffix: 'M+', icon: Activity, color: 'text-emerald-300' },
    { label: 'ACL tears in India', value: counts.aclIndia, suffix: 'K+', icon: Heart, color: 'text-rose-300' },
    { label: 'ACL tears in US', value: counts.aclUS, suffix: 'K+', icon: Stethoscope, color: 'text-violet-300' },
  ];

  const features = [
    {
      title: 'Dynamic Stability Measurement',
      description: 'Real-time assessment of ligament and muscle stability during movement with precision sensors',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      delay: '0ms'
    },
    {
      title: 'Objective Displacement Data',
      description: 'Accurate anterior-posterior displacement measurements in millimeters for clinical precision',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      delay: '200ms'
    },
    {
      title: 'AI-Powered Analytics',
      description: 'Advanced machine learning algorithms provide trend analysis and predictive insights',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      delay: '400ms'
    },
  ];

  const customerSegments = [
    { 
      title: 'Geriatric Care', 
      description: 'Specialized knee health monitoring for elderly patients with age-related conditions', 
      icon: Users,
      patients: '2.5M+',
      color: 'text-blue-600'
    },
    { 
      title: 'Sports Medicine', 
      description: 'Performance recovery solutions for athletes and active individuals', 
      icon: Trophy,
      patients: '1.8M+',
      color: 'text-green-600'
    },
    { 
      title: 'Hospital Networks', 
      description: 'Comprehensive knee assessment infrastructure for medical facilities', 
      icon: Hospital,
      patients: '500+',
      color: 'text-purple-600'
    },
    { 
      title: 'Rehabilitation Centers', 
      description: 'Post-surgical recovery monitoring and progress tracking systems', 
      icon: Heart,
      patients: '3.2M+',
      color: 'text-red-600'
    },
  ];

  const team = [
    { 
      name: 'Varun Kumar', 
      role: 'Clinical', 
      credentials: 'MBBS, Madurai Medical College',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face' 
    },
    { 
      name: 'Alex Patel', 
      role: 'Strategy, Business', 
      credentials: 'IIT Kanpur, Incoming Product @Microsoft',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' 
    },
    { 
      name: 'Nishanth Shanmukham', 
      role: 'Strategy, Business', 
      credentials: 'IIT Kanpur, Incoming Product @Microsoft',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' 
    },
    { 
      name: 'Sharan', 
      role: 'Technical', 
      credentials: 'PSG College of Engineering, Coimbatore',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face' 
    },
    { 
      name: 'Aditya', 
      role: 'Strategy, Marketing', 
      credentials: 'IIT Madras',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face' 
    },
    { 
      name: 'Rehan', 
      role: 'App Developer, Data Engineer', 
      credentials: 'Full Stack Development',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' 
    },
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Nambikkai
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Features
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className={`space-y-8 text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" />
                FDA Cleared • HIPAA Compliant
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Revolutionizing
                </span>
                <br />
                <span className="text-gray-900">Knee Health</span>
                <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Assessment
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Advanced real-time monitoring technology for orthopedic professionals, 
                providing precise measurements and AI-powered insights for better patient outcomes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  Schedule Demo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg rounded-xl transition-all duration-300"
                >
                  Watch Video
                  <Play className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
            
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop" 
                  alt="Advanced knee monitoring technology" 
                  className="rounded-2xl w-full h-[300px] sm:h-[350px] lg:h-[400px] object-cover shadow-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl shadow-lg">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Statistics */}
      <section className="py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Global Market Impact</h2>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto">
              Addressing the critical need for objective knee health assessment worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 transition-all duration-500 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl" style={{ animationDelay: `${index * 150}ms` }}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-emerald-300 mb-2">
                    {stat.value}{stat.suffix}
                  </div>
                  <p className="text-sm text-blue-100">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 transition-all duration-500 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-emerald-300 mb-3">${counts.marketSize}B</div>
                <p className="text-lg text-blue-100">Global ACL reconstruction market by 2025</p>
                <p className="text-sm text-blue-200 mt-2">5.2% CAGR (2022–2027)</p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 transition-all duration-500 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-emerald-300 mb-3">${counts.settlements}B</div>
                <p className="text-lg text-blue-100">Annual ACL-related settlements in the US</p>
                <p className="text-sm text-blue-200 mt-2">Growing liability costs</p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 transition-all duration-500 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-emerald-300 mb-3">{counts.recoveryTime}</div>
                <p className="text-lg text-blue-100">Months average recovery time</p>
                <p className="text-sm text-blue-200 mt-2">Post ACL surgery</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Cutting-Edge Technology
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">How Our System Works</h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto">
              Advanced sensor technology combined with AI analytics for unprecedented knee health insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <Card key={feature.title} className="group hover:shadow-2xl transition-all duration-700 border-0 shadow-xl overflow-hidden transform hover:-translate-y-4" style={{ animationDelay: feature.delay }}>
                <CardContent className="p-8 relative">
                  <div className={`w-20 h-20 ${feature.bgColor} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className={`w-10 h-10 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Segments */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
              Healthcare Solutions
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">Who We Serve</h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto">
              Comprehensive knee health solutions tailored for diverse healthcare environments
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {customerSegments.map((segment, index) => (
              <Card key={segment.title} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-3 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl transition-shadow duration-300">
                    <segment.icon className={`w-10 h-10 ${segment.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{segment.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{segment.description}</p>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${segment.color} bg-current/10`}>
                    {segment.patients} served
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Real-time Analytics
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
                Experience the Future of Knee Health Assessment
              </h2>
              <div className="space-y-6">
                {[
                  'Real-time data visualization with clinical accuracy',
                  'AI-powered insights and predictive analytics',
                  'Comprehensive progress tracking and reporting',
                  'Multi-user dashboard system for seamless collaboration',
                  'HIPAA-compliant data management and security'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                    <span className="text-lg text-gray-600 group-hover:text-gray-900 transition-colors duration-300">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                View Live Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop" 
                  alt="KneeHealth dashboard interface" 
                  className="rounded-2xl w-full h-[300px] sm:h-[350px] lg:h-[400px] object-cover shadow-lg"
                />
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Live Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 transition-all duration-500 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl">
              <CardContent className="p-10">
                <div className="w-16 h-16 bg-emerald-500/25 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-3xl font-bold text-emerald-300 mb-6">Our Vision</h3>
                <p className="text-lg text-blue-100 leading-relaxed">
                  To revolutionize knee health assessment and rehabilitation through innovative technology, 
                  making precise diagnostics accessible to healthcare providers and patients worldwide.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 transition-all duration-500 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl">
              <CardContent className="p-10">
                <div className="w-16 h-16 bg-blue-500/25 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-3xl font-bold text-blue-300 mb-6">Our Mission</h3>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Empowering healthcare professionals with real-time, objective measurements that enhance 
                  patient outcomes, reduce recovery times, and advance the field of orthopedic care.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
              Expert Team
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto">
              Leading experts in healthcare technology, clinical research, and biomedical innovation
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 lg:gap-8">
            {team.map((member, index) => (
              <Card key={member.name} className="group border-0 shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white">
                <div className="aspect-square overflow-hidden relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.credentials}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Activity className="w-4 h-4 mr-2" />
              Get Started Today
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900">
              Ready to Transform Knee Health Care?
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join leading healthcare providers who trust our technology for precise, 
              real-time knee health assessment and improved patient outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-5 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Schedule Demo
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button 
                onClick={handleLogin}
                variant="outline" 
                size="lg" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-5 text-xl rounded-xl transition-all duration-300"
              >
                Access Platform
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 pt-12 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                HIPAA Compliant
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 text-blue-500 mr-2" />
                FDA Cleared
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-purple-500 mr-2" />
                ISO 13485 Certified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">KneeHealth</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing knee health assessment through innovative technology and AI-powered insights.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
                <li>API</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Team</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Status</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KneeHealth. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;