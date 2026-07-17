import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRegisterWorker } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkerRegistrationInputWorkType, type WorkerRegistrationInput } from "@workspace/api-client-react";

const joinFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required").max(15),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  workType: z.enum([
    WorkerRegistrationInputWorkType.delivery,
    WorkerRegistrationInputWorkType.ride_sharing,
    WorkerRegistrationInputWorkType.domestic,
    WorkerRegistrationInputWorkType.construction,
    WorkerRegistrationInputWorkType.freelance,
    WorkerRegistrationInputWorkType.other,
  ], { required_error: "Work type is required" }),
  platform: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});

export function Join() {
  const [isSuccess, setIsSuccess] = useState(false);
  const registerWorker = useRegisterWorker();

  const form = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      state: "",
      platform: "",
      message: "",
    },
  });

  const onSubmit = (data: z.infer<typeof joinFormSchema>) => {
    // Convert empty email to undefined to match API schema
    const submitData = { ...data } as unknown as WorkerRegistrationInput;
    if (!submitData.email) delete submitData.email;

    registerWorker.mutate({ data: submitData }, {
      onSuccess: () => {
        setIsSuccess(true);
      },
      onError: (error) => {
        console.error("Registration failed", error);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="font-heading text-3xl font-black text-primary mb-4">Registration Successful!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Welcome to Gig Connect India. Your voice is now part of the movement. We will contact you soon with updates and community events in your city.
          </p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-white w-full h-12 text-lg font-bold">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-primary font-semibold hover:text-accent transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-primary p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/10"></div>
            <div className="relative z-10">
              <h1 className="font-heading text-3xl md:text-5xl font-black mb-4">Join the Movement</h1>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
                Register to become a member of India's largest support network for gig and platform workers.
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            {registerWorker.isError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-sm font-medium border border-red-200">
                {(registerWorker.error as any)?.data?.error
                  ?? (registerWorker.error as any)?.message
                  ?? "Failed to register. Please check your details and try again."}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ravi Kumar" className="h-12 bg-gray-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="9876543210" className="h-12 bg-gray-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary font-bold">Email Address (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ravi@example.com" type="email" className="h-12 bg-gray-50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Lucknow" className="h-12 bg-gray-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">State *</FormLabel>
                        <FormControl>
                          <Input placeholder="Uttar Pradesh" className="h-12 bg-gray-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="workType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">Primary Work Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-gray-50">
                              <SelectValue placeholder="Select work type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={WorkerRegistrationInputWorkType.delivery}>Delivery (Food/Grocery/Courier)</SelectItem>
                            <SelectItem value={WorkerRegistrationInputWorkType.ride_sharing}>Ride Sharing (Cab/Auto/Bike)</SelectItem>
                            <SelectItem value={WorkerRegistrationInputWorkType.domestic}>Domestic Work</SelectItem>
                            <SelectItem value={WorkerRegistrationInputWorkType.construction}>Construction</SelectItem>
                            <SelectItem value={WorkerRegistrationInputWorkType.freelance}>Freelance / IT / Creative</SelectItem>
                            <SelectItem value={WorkerRegistrationInputWorkType.other}>Other Platform Work</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">Platform / App (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Zomato, Ola, Urban Company" className="h-12 bg-gray-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary font-bold">Message / Main Concern (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about the challenges you face or why you want to join..." 
                          className="min-h-[100px] bg-gray-50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
                    disabled={registerWorker.isPending}
                  >
                    {registerWorker.isPending ? "Submitting..." : "Submit Registration"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    By submitting, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
