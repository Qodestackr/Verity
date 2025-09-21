"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion"
import {
  Warehouse, Package, ShoppingCart, Truck,
  Store, BookOpen, CreditCard, BarChart,
  ShieldCheck, Smartphone, Clock, Users, ChevronDown,
  Check, Zap,
  CheckCircle,
  MessageSquareQuote,
  Twitter,
  Star,
  PlayCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Input } from "@/components/ui/input"
// import { TestimonialCarousel } from "@/components/testimonial-carousel"
import { useKeenSlider } from "keen-slider/react"
import 'keen-slider/keen-slider.min.css'
import "keen-slider/keen-slider.min.css"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { InteractivePreview } from "../components/common/interactive-landing-preview"

// ===== ANIMATION CONFIGS =====
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const cardHover = {
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
}

const pulse = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// ===== COMPONENT =====
export default function HomePage() {
  const [activeTab, setActiveTab] = useState("retailers")
  const [isScrolled, setIsScrolled] = useState(false)
  const controls = useAnimation()
  const featuresRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 })

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-rotate testimonials
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    created: (s) => s.moveToIdx(currentSlide),
    slideChanged: (s) => setCurrentSlide(s.track.details.rel)
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (slider.current) slider.current.next()
    }, 5000)
    return () => clearInterval(interval)
  }, [slider])

  return (
    <div className="min-h-screen bg-background antialiased">
      {/* === HERO SECTION (3D Perspective) === */}
      <section className="relative pt-2 pb-22 overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        {/* Floating Shapes (Animated) */}
        <motion.div
          className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-primary/10 blur-3xl -z-10"
          animate={{
            y: [0, 20, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="container px-4">
          <motion.div
            className="max-w-5xl mx-auto text-center space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="rounded-full px-2 py-1 text-sm font-medium">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Trusted by 550+ Businesses
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-3xl md:text-5xl font-light tracking-tight leading-tight">
              Simplify Your Liquor
              <span className="block mt-1 bg-gradient-to-r from-primary to-emerald-500 dark:to-emerald-600 bg-clip-text text-transparent">
                Business Operations
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
              Verity connects the entire liquor supply chain with inventory management, smart logistics, built-in accounting,
              and instant payments.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 text-base h-12 shadow-lg group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Start Free 30-Day Trial</span>
                  <Zap className="ml-2 h-4 w-4 fill-current" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 text-base border-2 group"
              >
                <span className="group-hover:translate-x-0.5 transition-transform">Watch Demo</span>
                <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </Button>
            </motion.div>

            {/* Animated Platform Mockup */}
            <motion.div
              variants={fadeInUp}
              className="relative mt-12 mx-1 mx-auto max-w-6xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <InteractivePreview />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* === VALUE PROPOSITIONS (Animated Stats) === */}
      <section className="py-6 bg-primary/2.5">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-3 gap-2 sm:gap-5 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {[
              { icon: BarChart, value: '98%', label: 'Reduction in Order Errors', desc: 'Reduction in manual errors' },
              { icon: Clock, value: '4.8x', label: 'Faster Fulfillment', desc: 'Order fulfillment speed' },
              { icon: Users, value: '550+', label: 'Happy Customers', desc: 'Across Kenya' },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover="hover"
                className="group relative"
              >
                <motion.div
                  variants={cardHover}
                  className="bg-background rounded-xl p-2 border shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xl text-emerald-600 font-semibold mb-1">{item.value}</div>
                      <h3 className="text-lg font-normal">{item.label}</h3>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* === FEATURE SHOWCASE (Interactive Tabs) === */}
      <section id="features" ref={featuresRef} className="max-w-5xl mx-auto py-10">
        <div className="w-full px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-4"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-2 rounded-full">
              Built for Scale
            </Badge>
            <h2 className="text-3xl font-normal tracking-tight mb-2">
              Solutions Tailored for Your Business
            </h2>
            <p className="text-muted-foreground text-sm">
              Customized solutions for each part of your distribution network
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              className="flex justify-center mb-0.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TabsList className="bg-muted/50 p-1 rounded-full border">
                {['retailers', 'wholesalers', 'distributors'].map((role) => (
                  <TabsTrigger
                    key={role}
                    value={role}
                    className="data-[state=active]:shadow-sm rounded-full px-4 cursor-pointer capitalize"
                  >
                    {role}
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value={activeTab}>
                  <div className="grid md:grid-cols-3 gap-3 max-w-5xl mx-auto">
                    {features[activeTab].map((feature: any, index: number) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        whileHover="hover"
                        className="group relative"
                      >
                        <motion.div
                          variants={cardHover}
                          className="h-full bg-background rounded-xl border p-3 shadow-sm flex flex-col"
                        >
                          <div className="flex items-center mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <feature.icon className="h-5 w-5 text-emerald-700" />
                            </div>
                            <h3 className="text-lg font-normal ml-1.5">{feature.title}</h3>
                          </div>
                          <p className="text-muted-foreground text-sm mb-1">{feature.description}</p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>

      {/* === TESTIMONIALS (Auto-Rotating Carousel) === */}
      <section id="testimonials" className="py-4 bg-primary/2.5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <Badge variant="outline" className="mb-2 rounded-full">
              Social Proof
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              Trusted by Kenya's Top Distributors
            </h2>

            <div ref={sliderRef} className="keen-slider mt-1">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="keen-slider__slide">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="p-0">
                      <div className="text-4xl leading-none mb-2">“</div>
                      <p className="text-sm text-muted-foreground mb-">
                        {testimonial.quote}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-900">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">AV</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER (Comprehensive) === */}
      <footer className="py-6 bg-background">
        <div className="container px-2">
          {/* Bottom Footer */}
          <div className="border-t mt-8 pt-4 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Veritybooks. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ===== DATA =====
const features: any = {
  retailers: [
    {
      icon: Smartphone,
      title: "Mobile-First POS",
      description: "Cloud-based POS system with offline support and instant receipt printing"
    },
    {
      icon: Truck,
      title: "Real-Time Tracking",
      description: "Live order tracking with delivery ETAs and driver communication"
    },
    {
      icon: Package,
      title: "Smart Inventory",
      description: "Automated stock alerts and predictive ordering based on sales trends"
    }
  ],
  wholesalers: [
    {
      icon: Store,
      title: "Order Automation",
      description: "Automated order processing with smart credit limit management"
    },
    {
      icon: BarChart,
      title: "Sales Analytics",
      description: "Real-time sales dashboards and profitability analysis"
    },
    {
      icon: CreditCard,
      title: "Instant Payments",
      description: "Integrated mobile money payments with automatic reconciliation"
    }
  ],
  distributors: [
    {
      icon: Warehouse,
      title: "Warehouse Management",
      description: "Multi-location inventory tracking with batch expiration monitoring"
    },
    {
      icon: Truck,
      title: "Route Optimization",
      description: "AI-powered delivery routing with real-time GPS tracking"
    },
    {
      icon: Users,
      title: "Network Management",
      description: "Centralized control of wholesalers and retailers"
    }
  ]
}

// ===== TESTIMONIALS DATA =====
const testimonials = [
  {
    quote: "Veritybooks reduced our order processing time by 80% and eliminated stockouts completely. The real-time tracking is a game-changer!",
    name: "Alex Mwangi",
    role: "CEO, Nairobi Spirits",
    avatar: "/avatars/alex-mwangi.jpg",
    rating: 5,
    video: "/testimonials/alex-review.mp4",
    socialProof: {
      platform: "Twitter",
      handle: "@alexmwangi",
      post: "Just switched to @Veritybooks - our distribution network has never been smoother. Highly recommend! #LiquorTech"
    }
  },
  {
    quote: "Our beer and spirits revenue grew by 42% in just 3 months thanks to Veritybooks's inventory forecasting. The AI recommendations are scarily accurate.",
    name: "Sarah Kariuki",
    role: "Operations Director, Coast Distributors",
    avatar: "/avatars/sarah-k.jpg",
    rating: 5,
    featured: true, // Highlights this testimonial
    stats: [
      { value: "40%", label: "Revenue Growth" },
      { value: "3x", label: "Order Accuracy" }
    ]
  },
  {
    quote: "I regained 15 hours/week by automating purchase orders. Now I focus on growing my business instead clunky mails and paperwork.",
    name: "James Omondi",
    role: "Owner, Thika Wines & Spirits",
    avatar: "/avatars/james-o.jpg",
    rating: 4,
    verification: {
      verified: true,
      method: "M-Pesa Transaction ID #TX4872"
    }
  }
]

// ===== TESTIMONIAL COMPONENT =====
const TestimonialCard = ({ testimonial }: any) => {
  const [playing, setPlaying] = useState(false)

  return (
    <motion.div
      className="relative"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Featured Badge */}
      {testimonial.featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Badge className="rounded-full px-3 py-1 bg-primary/90 text-white shadow-lg">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Featured Review
          </Badge>
        </div>
      )}

      <Card className={`overflow-hidden ${testimonial.featured ? "border-primary/30 ring-1 ring-primary/10" : ""}`}>
        {/* Video Testimonial Trigger */}
        {testimonial.video && (
          <div
            className="relative h-40 bg-gray-100 cursor-pointer group"
            onClick={() => setPlaying(true)}
          >
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
            </div>
            {/* <Image
              src={`${testimonial.video.replace('.mp4', '.jpg')}`}
              alt={testimonial.name}
              fill
              className="object-cover"
            /> */}
          </div>
        )}

        <CardContent className="p-6">
          {/* Rating */}
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-lg italic mb-6">
            "{testimonial.quote}"
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={testimonial.avatar} />
                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {testimonial.verification?.verified && (
                <Badge className="absolute -bottom-1 -right-1 rounded-full p-0 h-5 w-5 bg-green-500 border-2 border-background">
                  <Check className="h-3 w-3 text-white" />
                </Badge>
              )}
            </div>
            <div>
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>
          </div>

          {/* Stats (for featured testimonials) */}
          {testimonial.stats && (
            <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
              {testimonial.stats.map((stat: any, i: number) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Social Proof */}
          {testimonial.socialProof && (
            <Card className="mt-4 bg-muted/50">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">{testimonial.socialProof.platform}</span>
                  <span className="text-muted-foreground">{testimonial.socialProof.handle}</span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 text-sm">
                {testimonial.socialProof.post}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog open={playing} onOpenChange={setPlaying}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <video
            controls
            autoPlay
            className="w-full aspect-video"
            src={testimonial.video}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ===== IMPLEMENTATION IN SECTION =====
<section id="testimonials" className="py-20 bg-gradient-to-b from-primary/5 to-background">
  <div className="container px-4">
    <div className="max-w-4xl mx-auto text-center mb-16">
      <Badge variant="secondary" className="rounded-full px-4 py-1 mb-4">
        <MessageSquareQuote className="h-4 w-4 mr-2" />
        Social Proof
      </Badge>
      <h2 className="text-3xl font-bold tracking-tight mb-4">
        Trusted by Kenya's Top Distributors
      </h2>
      <p className="text-muted-foreground">
        Don't just take our word for it - see what industry leaders say
      </p>
    </div>

    {/* Testimonial Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <TestimonialCard key={index} testimonial={testimonial} />
      ))}
    </div>

    {/* Trust Indicators */}
    <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-8">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Avatar key={i} className="h-10 w-10 border-2 border-background">
              <AvatarFallback className="bg-primary/10 text-primary">UA {i}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="text-left">
          <p className="font-medium">550+ Happy Clients</p>
          <p className="text-sm text-muted-foreground">Across East Africa</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-500/10 rounded-full">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="text-left">
          <p className="font-medium">Verified Reviews</p>
          <p className="text-sm text-muted-foreground">Real customer experiences</p>
        </div>
      </div>
    </div>
  </div>
</section>