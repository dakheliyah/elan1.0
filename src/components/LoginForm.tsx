
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Validation functions
const validateEmail = (email: string): string | true => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return true;
};

const validatePassword = (password: string): string | true => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return true;
};

// Types
interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loginError, setLoginError] = React.useState<string>('');
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Watch form values for real-time validation and error clearing
  const watchedValues = watch();
  React.useEffect(() => {
    if (loginError && (watchedValues.email || watchedValues.password)) {
      setLoginError('');
    }
  }, [watchedValues.email, watchedValues.password, loginError]);

  // Mock login API function - replace with actual API call
  const loginAPI = async (email: string, password: string): Promise<LoginResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock authentication logic
    if (email === 'admin@elan.com' && password === 'password') {
      return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        message: 'Login successful'
      };
    } else {
      return {
        success: false,
        message: 'Email or password is incorrect'
      };
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    // Clear previous errors
    setLoginError('');
    clearErrors();
    
    // Validate email
    const emailValidation = validateEmail(data.email);
    if (emailValidation !== true) {
      setError('email', { message: emailValidation });
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (passwordValidation !== true) {
      setError('password', { message: passwordValidation });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login for:', data.email);
      const response = await loginAPI(data.email, data.password);
      
      if (response.success) {
        console.log('Login successful, token:', response.token);
        
        // Store JWT token (in production, use secure storage)
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userEmail', data.email);
        }
        
        // Show success state
        setShowSuccess(true);
        
        // Show success toast
        toast({
          title: 'Login Successful',
          description: 'Welcome back to Elan!',
        });
        
        // Redirect after short delay to show success state
        setTimeout(() => {
          if (onLogin) {
            onLogin(data.email, data.password);
          }
          
          // Clear sensitive data from memory
          reset();
          setShowSuccess(false);
        }, 2000);
        
      } else {
        setLoginError(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setLoginError('Network error. Please check your connection and try again.');
      } else {
        setLoginError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isValid && !isLoading) {
      handleSubmit(onSubmit)();
    }
  };

  // Success state render
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center animate-fade-in">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <div className="h-6 w-6 text-green-600">✓</div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Success!</h1>
            <p className="mt-2 text-sm text-gray-600">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Elan</h1>
          <p className="mt-2 text-sm text-gray-600">Event Management Platform</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" onKeyDown={handleKeyDown}>
            {/* General Error Message */}
            {loginError && (
              <div 
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm transition-all duration-300 animate-fade-in"
                role="alert"
                aria-live="polite"
              >
                {loginError}
              </div>
            )}
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  validate: validateEmail
                })}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={isLoading}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p 
                  id="email-error"
                  className="text-red-600 text-sm mt-1 animate-fade-in"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  validate: validatePassword
                })}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={isLoading}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="current-password"
              />
              {errors.password && (
                <p 
                  id="password-error"
                  className="text-red-600 text-sm mt-1 animate-fade-in"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transform hover:scale-[1.02] active:scale-[0.98]"
              aria-describedby="button-description"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div 
                    className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                    aria-hidden="true"
                  ></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div id="button-description" className="sr-only">
              {!isValid ? 'Please fill in all required fields to enable login' : 'Press Enter or click to sign in'}
            </div>
          </form>
          
          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Demo credentials: admin@elan.com / password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
