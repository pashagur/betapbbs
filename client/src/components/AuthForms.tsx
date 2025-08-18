import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthForms() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
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

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  };

  const handleSubmit = (e: React.FormEvent, type: "login" | "register") => {
    e.preventDefault();
    
    if (type === "register") {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      
      const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
      if (!allRequirementsMet) {
        alert("Please meet all password requirements!");
        return;
      }
    }
    
    // Redirect to Replit Auth
    window.location.href = "/api/login";
  };

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Register Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <i className="fas fa-user-plus mr-2"></i>
              Register
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, "register")}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="regUsername" className="text-gray-300">Username</Label>
                  <Input
                    id="regUsername"
                    type="text"
                    maxLength={64}
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                    data-testid="input-register-username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="regEmail" className="text-gray-300">Email</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    maxLength={120}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                    data-testid="input-register-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="regPassword" className="text-gray-300">Password</Label>
                  <Input
                    id="regPassword"
                    type="password"
                    value={formData.password}
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
                  <Label htmlFor="regConfirmPassword" className="text-gray-300">Confirm Password</Label>
                  <Input
                    id="regConfirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                    data-testid="input-register-confirm-password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-register"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <i className="fas fa-sign-in-alt mr-2"></i>
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, "login")}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="loginUsername" className="text-gray-300">Username or Email</Label>
                  <Input
                    id="loginUsername"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                    data-testid="input-login-username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="loginPassword" className="text-gray-300">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                    data-testid="input-login-password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-login"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
