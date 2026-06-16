import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  // 1. Get setCurrentUser from Context so we can update the app state instantly
  const { currentUser, setCurrentUser } = useApp(); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Login Form Data
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Register Form Data
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '452001', 
    password: '',
    confirmPassword: '',
  });

  if (currentUser) {
    navigate('/browse');
    return null;
  }

  // --- 1. LOGIN LOGIC (Fixed) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        console.log("Login Data Received:", userData); // Debugging

        // 1. Update Browser Storage (Persist)
        localStorage.setItem("user", JSON.stringify(userData));
        
        // 2. Update React State INSTANTLY (Fixes "Shows nothing" issue)
        setCurrentUser(userData);
        
        toast.success(`Welcome back, ${userData.fullName}!`);
        navigate('/browse'); 
      } else {
        toast.error('Invalid Email or Password');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server connection failed. Is Backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. REGISTER LOGIC ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    setIsLoading(true);

    const backendPayload = {
      fullName: registerData.name, 
      email: registerData.email,
      phoneNumber: registerData.phone,
      address: registerData.address,
      pincode: registerData.pincode,
      password: registerData.password
    };

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      const message = await response.text();

      if (response.ok) {
        toast.success('Account created! Logging you in...');
        
        // Auto-Login after Register (Better UX)
        // We reuse the login logic essentially
        // Ideally, the register API should return the User object too, 
        // but for now, we ask them to login or switch tabs.
        const loginTab = document.getElementById('login-tab-trigger');
        if (loginTab) loginTab.click();
        
        // Pre-fill login email for convenience
        setLoginData(prev => ({ ...prev, email: registerData.email }));
        
      } else {
        toast.error(message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-primary">nearShare</h1>
            <p className="text-lg text-muted-foreground">
              Share items with your neighbors,<br />build community trust
            </p>
            <div className="pt-8">
              <img 
                src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400" 
                alt="Community sharing" 
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="mb-6 text-center md:hidden">
              <h1 className="text-3xl font-bold text-primary">nearShare</h1>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" id="login-tab-trigger">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* LOGIN FORM */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="john@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER FORM */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      value={registerData.address}
                      onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="452001"
                      value={registerData.pincode}
                      onChange={(e) => setRegisterData({ ...registerData, pincode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the Terms & Conditions
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Register"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}