import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, MessageSquare, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            InfluConnect
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Connect Influencers <br />
            with <span className="text-primary">Amazing Brands</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The premier platform for influencer marketing collaborations. 
            Find the perfect match, manage campaigns, and grow together.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup?role=brand">
              <Button size="lg" className="gap-2">
                I'm a Brand <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup?role=influencer">
              <Button size="lg" variant="outline" className="gap-2">
                I'm an Influencer <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Users}
              title="Find Perfect Matches"
              description="Browse verified influencers or discover brands that align with your niche."
            />
            <FeatureCard
              icon={Briefcase}
              title="Campaign Management"
              description="Track deliverables, deadlines, and progress all in one place."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Real-time Messaging"
              description="Communicate directly with your collaborators without leaving the platform."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Analytics & Insights"
              description="Track campaign performance and measure your success."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number={1}
              title="Create Your Profile"
              description="Sign up and build your profile showcasing your expertise and audience."
            />
            <StepCard
              number={2}
              title="Find & Connect"
              description="Browse and send collaboration requests to your ideal partners."
            />
            <StepCard
              number={3}
              title="Collaborate & Grow"
              description="Manage campaigns, track deliverables, and build lasting partnerships."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Collaborating?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of influencers and brands already growing together on InfluConnect.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} InfluConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
        {number}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
