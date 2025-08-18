import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Trophy } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = (password: string) => {
    setRegisterData(prev => ({ ...prev, password }));
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(loginData);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
    if (!allRequirementsMet) {
      toast({
        title: "Error",
        description: "Please meet all password requirements",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(registerData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div>
            <h1 className="text-4xl font-bold mb-6">
              Join Our Community
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Connect with developers, designers, and creators. Share your thoughts and grow together in our vibrant community.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <span className="text-gray-300">Share messages up to 500 characters</span>
              </div>
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-gray-300">Earn badges based on your activity</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-green-500" />
                <span className="text-gray-300">Connect with like-minded creators</span>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger value="login" className="data-[state=active]:bg-blue-600">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-blue-600">
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Sign In
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="loginUsername" className="text-gray-300">
                          Username or Email
                        </Label>
                        <Input
                          id="loginUsername"
                          type="text"
                          value={loginData.username}
                          onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                          data-testid="input-login-username"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="loginPassword" className="text-gray-300">
                          Password
                        </Label>
                        <Input
                          id="loginPassword"
                          type="password"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                          data-testid="input-login-password"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={loginMutation.isPending}
                        data-testid="button-login-submit"
                      >
                        {loginMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Signing in...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sign-in-alt mr-2"></i>
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="register">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <i className="fas fa-user-plus mr-2"></i>
                      Register
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="regUsername" className="text-gray-300">
                          Username <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="regUsername"
                          type="text"
                          maxLength={64}
                          value={registerData.username}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                          data-testid="input-register-username"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="regEmail" className="text-gray-300">
                          Email (optional)
                        </Label>
                        <Input
                          id="regEmail"
                          type="email"
                          maxLength={120}
                          value={registerData.email}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          data-testid="input-register-email"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="regPassword" className="text-gray-300">
                          Password <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="regPassword"
                          type="password"
                          value={registerData.password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                          data-testid="input-register-password"
                        />
                        
                        <div className="mt-2 space-y-1 text-sm">
                          {Object.entries(passwordRequirements).map(([key, met]) => (
                            <div 
                              key={key}
                              className={`flex items-center ${met ? 'text-green-400' : 'text-red-400'}`}
                              data-testid={`requirement-${key}`}
                            >
                              <i className={`fas ${met ? 'fa-check' : 'fa-times'} mr-2`}></i>
                              {key === 'length' && 'At least 8 characters'}
                              {key === 'uppercase' && 'One uppercase letter'}
                              {key === 'lowercase' && 'One lowercase letter'}
                              {key === 'number' && 'One number'}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="regConfirmPassword" className="text-gray-300">
                          Confirm Password <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="regConfirmPassword"
                          type="password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                          data-testid="input-register-confirm-password"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={registerMutation.isPending}
                        data-testid="button-register-submit"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating account...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus mr-2"></i>
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}