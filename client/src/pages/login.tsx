import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Phone, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to continue",
        variant: "destructive",
      });
      return;
    }

    if (phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const success = await login(phoneNumber, name.trim() || undefined);
    
    if (!success) {
      toast({
        title: "Login failed",
        description: "Please check your details and try again",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-medical-teal/5 to-medical-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="login-title">
            MediChat Agent
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="login-subtitle">
            Healthcare Student Support Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your phone number to continue your medical consultation
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 h-12 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    data-testid="input-phone"
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name (Optional)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    data-testid="input-name"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                data-testid="button-login"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Continue to Chat"
                )}
              </Button>
            </form>

            {/* Info Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to receive medical consultation support from Dr. MediBot.
                <br />
                <span className="text-medical-green font-medium">Secure • Professional • Confidential</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Need help? Contact your medical institution for support
          </p>
        </div>
      </div>
    </div>
  );
}