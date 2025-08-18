import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Trophy, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Navigation */}
      <nav className="navbar border-b border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">Community Board</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">v1.2.1 • Build: 2024-01-15</span>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-login"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to Community Board
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our vibrant community of developers, designers, and creators. 
            Share your thoughts, connect with others, and grow together.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <h3 className="text-xl font-semibold">Share Messages</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Post messages up to 500 characters and engage with the community through meaningful conversations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h3 className="text-xl font-semibold">Earn Badges</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Progress through badge tiers from New Member to Gold Contributor based on your activity and contributions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-500" />
                <h3 className="text-xl font-semibold">Build Community</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Connect with like-minded individuals and be part of a growing community of passionate creators.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-lg mb-6">
              Start your journey today and become part of our amazing community!
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/auth'}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
              data-testid="button-join-now"
            >
              Join Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
