import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar, Users, Music, Sparkles } from "lucide-react";
import molineLogo from "@/assets/moline-cross-logo.png";
const Index = () => {
  return <div className="min-h-screen bg-secondary/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent" />
        
        {/* Floating confetti elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-confetti" style={{
          animationDelay: "0s"
        }} />
          <div className="absolute top-40 right-20 w-3 h-3 bg-secondary/30 rounded-full animate-confetti" style={{
          animationDelay: "0.5s"
        }} />
          <div className="absolute top-60 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-confetti" style={{
          animationDelay: "1s"
        }} />
          <div className="absolute top-32 right-1/3 w-3 h-3 bg-secondary/30 rounded-full animate-confetti" style={{
          animationDelay: "1.5s"
        }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center animate-fade-in px-[100px]">
          <div className="mb-8 flex justify-center mx-0 my-0 py-0">
            <img src={molineLogo} alt="The Moline Cross" className="h-48 md:h-32 w-auto" />
          </div>
          <h1 className="text-4xl font-serif text-foreground mb-6 leading-tight font-bold md:text-7xl">
            Plan your perfect celebration
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed mx-[200px]">
            Create unforgettable moments at The Moline Cross
          </p>
          <Link to="/booking">
            <Button size="lg" variant="gradient" className="text-lg px-12 py-6 text-white shadow-2xl rounded-">
              Start Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="p-8 hover:scale-105 transition-transform duration-300 animate-slide-up" style={{
          animationDelay: "0.1s"
        }}>
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl mb-3 text-center font-serif font-bold">Easy Booking</h3>
            <p className="text-muted-foreground text-center leading-relaxed">
              Simple online booking process with instant confirmation
            </p>
          </GlassCard>

          <GlassCard className="p-8 hover:scale-105 transition-transform duration-300 animate-slide-up" style={{
          animationDelay: "0.2s"
        }}>
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-serif mb-3 text-center font-bold">Flexible Spaces</h3>
            <p className="text-muted-foreground text-center leading-relaxed">
              Function room for up to 120 guests or lounge for 50 guests
            </p>
          </GlassCard>

          <GlassCard className="p-8 hover:scale-105 transition-transform duration-300 animate-slide-up" style={{
          animationDelay: "0.3s"
        }}>
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-serif mb-3 text-center font-bold">Full Service</h3>
            <p className="text-muted-foreground text-center leading-relaxed">
              Optional DJ services, catering, and late bar available
            </p>
          </GlassCard>
        </div>
      </div>
    </div>;
};
export default Index;