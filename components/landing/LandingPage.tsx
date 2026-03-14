import { CTASection } from '@/components/landing/CTASection';
import { FeatureSection, type FeatureItem } from '@/components/landing/FeatureSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { IndustriesSection } from '@/components/landing/IndustriesSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { MetricsSection } from '@/components/landing/MetricsSection';
import { getCurrentUser } from '@/lib/auth';

const coreCapabilities: FeatureItem[] = [
  {
    title: 'Real-time Plant Monitoring Dashboard',
    description: 'Centralized visualization of plant operations, sensors, and KPIs.',
    eyebrow: 'Operations'
  },
  {
    title: 'Energy Consumption Analytics',
    description: 'Track and optimize energy usage across equipment and production lines.',
    eyebrow: 'Energy'
  },
  {
    title: 'Equipment Health Monitoring',
    description: 'Monitor equipment condition and detect early signs of failure.',
    eyebrow: 'Reliability'
  },
  {
    title: 'Predictive Maintenance',
    description: 'AI-driven maintenance recommendations based on historical and sensor data.',
    eyebrow: 'AI Maintenance'
  },
  {
    title: 'Emissions Tracking & Sustainability Reporting',
    description: 'Monitor greenhouse gas emissions and environmental compliance.',
    eyebrow: 'ESG'
  },
  {
    title: 'Production Efficiency Analytics',
    description: 'Track OEE, throughput, and quality metrics.',
    eyebrow: 'Performance'
  },
  {
    title: 'Sustainability Scoring',
    description: 'Benchmark sustainability performance against industry standards.',
    eyebrow: 'Benchmarking'
  },
  {
    title: 'Anomaly Detection Engine',
    description: 'AI detection of abnormal behavior in operations.',
    eyebrow: 'Intelligence'
  }
];

const aiCapabilities: FeatureItem[] = [
  {
    title: 'Digital Twin Simulation',
    description: 'Simulate plant operations and test optimization strategies.',
    eyebrow: 'Simulation'
  },
  {
    title: 'AI-Powered Process Optimization',
    description: 'Automatically adjust process parameters for efficiency.',
    eyebrow: 'Optimization'
  },
  {
    title: 'Carbon Footprint Analytics',
    description: 'Track carbon emissions across the entire supply chain.',
    eyebrow: 'Carbon'
  },
  {
    title: 'Natural Language AI Assistant',
    description: 'Chat interface to query plant data and receive insights.',
    eyebrow: 'Assistant'
  },
  {
    title: 'Multi-modal Data Intelligence',
    description: 'Combine sensor data, images, and operational metrics.',
    eyebrow: 'Data Fusion'
  }
];

const platformModules: FeatureItem[] = [
  { title: 'Plant Monitoring', description: 'Live KPIs, telemetry, and production state views.' },
  { title: 'Equipment Analytics', description: 'Condition, health scoring, and asset reliability insights.' },
  { title: 'Energy & Emissions', description: 'Utility demand, intensity, and carbon visibility.' },
  { title: 'Predictive Maintenance', description: 'Risk scoring, recommendations, and planning support.' },
  { title: 'Alerts & Notifications', description: 'Prioritized events with escalation-ready workflows.' },
  { title: 'Compliance & ESG Reporting', description: 'Environmental reporting and sustainability governance.' },
  { title: 'Custom Reports & Benchmarking', description: 'Executive reporting with industry comparison views.' },
  { title: 'Integration APIs', description: 'ERP, MES, SCADA, and historian connectivity.' }
];

export async function LandingPage() {
  const currentUser = await getCurrentUser();
  const dashboardHref = currentUser ? '/dashboard' : '/auth/login';

  return (
    <main className="landing-surface min-h-screen overflow-x-hidden">
      <HeroSection dashboardHref={dashboardHref} />
      <FeatureSection
        badge="Core Platform Capabilities"
        title="Industrial intelligence for performance, uptime, and sustainability"
        description="The core platform brings together plant telemetry, asset diagnostics, efficiency analytics, and emissions visibility into a single manufacturing command system."
        items={coreCapabilities}
        columns="four"
      />
      <FeatureSection
        badge="Advanced AI Capabilities"
        title="Differentiated intelligence layers for modern manufacturing teams"
        description="Beyond dashboards, PlantPulse AI is positioned as an AI engine for scenario testing, optimization, guided investigation, and carbon-aware operations."
        items={aiCapabilities}
        columns="three"
      />
      <FeatureSection
        badge="Platform Modules"
        title="Modular building blocks for the Smart Plant Intelligence Platform"
        description="Each module can stand alone for the hackathon demo while still telling a coherent expansion story toward a broader industrial AI platform."
        items={platformModules}
        columns="four"
      />
      <HowItWorksSection />
      <IndustriesSection />
      <MetricsSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
