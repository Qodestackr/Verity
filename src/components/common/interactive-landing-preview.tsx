"use client";

import { useState, useEffect, useRef, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
    ShoppingCart, Package, ChevronRight, RefreshCw,
    MoreHorizontal, Search, Bell, User, Settings, Plus,
    Filter, CheckCircle, Clock, XCircle,
    CreditCard, Calendar, Eye, ArrowUpRight, BarChart,
    LayoutDashboard, ClipboardList, Zap, Truck
} from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
};

const itemFadeIn = {
    hidden: { opacity: 0, y: 5 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2 }
    }
};

const buttonHover = {
    rest: { scale: 1 },
    hover: {
        scale: 1.05,
        transition: { duration: 0.2, type: "spring", stiffness: 400 }
    },
    tap: { scale: 0.95 }
};

const notificationVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.8 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 30
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 }
    }
};

export const InteractivePreview = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState('success');
    const [isHovering, setIsHovering] = useState(Array(7).fill(false));
    const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
    const [chartData, setChartData] = useState([30, 45, 60, 80, 65, 90, 100]);
    const [isTyping, setIsTyping] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);
    const [notificationCount, setNotificationCount] = useState(3);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const searchRef = useRef(null);

    const router = useRouter()

    useEffect(() => {
        if (isTyping) {
            const text = "beer distributors";
            let index = 0;

            const typeInterval = setInterval(() => {
                if (index <= text.length) {
                    setSearchValue(text.substring(0, index));
                    index++;
                } else {
                    clearInterval(typeInterval);
                    setIsTyping(false);

                    setTimeout(() => {
                        setShowTooltip(true);
                        setTimeout(() => setShowTooltip(false), 2000);
                    }, 500);
                }
            }, 120);

            return () => clearInterval(typeInterval);
        }
    }, [isTyping]);

    useEffect(() => {
        const randomTimeout = setTimeout(() => {
            if (activeTab === 'dashboard') {
                setIsTyping(true);
            }
        }, 2000);

        return () => clearTimeout(randomTimeout);
    }, [activeTab]);

    useEffect(() => {
        if (isLoading) {
            setLoadingProgress(0);
            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 15;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    // Sim data loading with progress
    const refreshData = () => {
        setIsLoading(true);

        setTimeout(() => {
            // Update chart data with new random values
            setChartData(Array(7)?.fill(0).map(() => Math.floor(Math.random() * 70) + 30));
            setIsLoading(false);
            setNotificationType('success');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 2000);
        }, 700);
    };

    const handleOrdersClick = () => {
        setActiveTab('orders');
    };

    const triggerNotification = () => {
        setNotificationCount(prev => prev + 1);
        setNotificationType('new');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
    };

    // Generate chart data based on timeframe
    const changeTimeframe = (timeframe: SetStateAction<string>) => {
        setSelectedTimeframe(timeframe);
        setIsLoading(true);

        // API to get new chart data
        setTimeout(() => {
            if (timeframe === 'daily') {
                setChartData([40, 35, 60, 75, 65, 50, 45]);
            } else if (timeframe === 'monthly') {
                setChartData([60, 65, 70, 85, 90, 95, 100]);
            } else {
                setChartData([30, 45, 60, 80, 65, 90, 100]);
            }

            setIsLoading(false);
        }, 600);
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'dashboard': return <LayoutDashboard className="h-4 w-4" />;
            case 'orders': return <ClipboardList className="h-4 w-4" />;
            case 'inventory': return <Package className="h-4 w-4" />;
            case 'reports': return <BarChart className="h-4 w-4" />;
            default: return null;
        }
    };

    // Labels for the chart
    const chartLabels = selectedTimeframe === 'daily'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : selectedTimeframe === 'monthly'
            ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
            : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];

    return (
        <MotionConfig transition={{ duration: 0.2 }}>
            <motion.div
                variants={fadeIn}
                className="relative mx-auto max-w-4xl rounded-xl border dark:border-gray-800 bg-white dark:bg-[#1E1E2D] shadow-xl overflow-hidden"
                whileHover={{
                    y: -5,
                    transition: { type: "spring", stiffness: 300 }
                }}
            >
                <div className="bg-gray-100 dark:bg-[#1E1E2D] p-2 flex items-center justify-between border-b dark:border-gray-800">
                    <div className="flex gap-2 px-2">
                        <motion.div
                            className="w-3 h-3 rounded-full bg-red-500 cursor-pointer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        />
                        <motion.div
                            className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        />
                        <motion.div
                            className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        />
                    </div>

                    <div className="flex-1 mx-4 relative">
                        <div className="bg-white/90 dark:bg-gray-800 rounded-full px-4 py-1 text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <Search className="h-3 w-3 mr-2" />
                            <span ref={searchRef}>app.alcorabooks.co{searchValue ? "/search?q=" + searchValue : ""}</span>
                        </div>

                        {showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-primary dark:bg-primary text-white px-3 py-1 rounded text-xs z-10 whitespace-nowrap"
                            >
                                Looking for beer distributors? Try the Alcorabooks!
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        className="relative"
                                        variants={buttonHover}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-gray-500 dark:text-gray-400"
                                            onClick={triggerNotification}
                                        >
                                            <Bell className="h-3 w-3" />
                                        </Button>
                                        {notificationCount > 0 && (
                                            <motion.div
                                                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                                                initial={{ scale: 0.5 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500 }}
                                            />
                                        )}
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">You have {notificationCount} notifications</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        variants={buttonHover}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 dark:text-gray-400">
                                            <Settings className="h-3 w-3" />
                                        </Button>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Platform settings</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#252837] px-4 py-2 flex items-center justify-between border-b dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <motion.h2
                            className="text-base font-normal flex items-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 500 }}
                        >
                            <Zap className="h-4 w-4 mr-2 text-primary" />
                            Alcorabooks
                        </motion.h2>

                        <div className="hidden sm:flex border-b border-gray-200 dark:border-gray-700">
                            {['dashboard', 'orders', 'inventory', 'reports'].map((tab) => (
                                <TooltipProvider key={tab}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-3 py-2 text-xs font-medium relative ${activeTab === tab
                                                    ? 'text-primary dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'} 
                          flex items-center gap-2`}
                                                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {getTabIcon(tab)}
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                {activeTab === tab && (
                                                    <motion.div
                                                        layoutId="tabIndicator"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">View {tab}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mr-3 pr-2">
                        <motion.div
                            variants={buttonHover}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 gap-1 relative overflow-hidden"
                                onClick={refreshData}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                        <span className="ml-1">Loading</span>
                                        <motion.div
                                            className="absolute bottom-0 left-0 h-0.5 bg-primary"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${loadingProgress}%` }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-3 w-3" />
                                        <span className="ml-1">Refresh</span>
                                    </>
                                )}
                            </Button>
                        </motion.div>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        variants={buttonHover}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="text-xs h-8 gap-1"
                                            onClick={handleOrdersClick}
                                        >
                                            <Plus className="h-3 w-3" />
                                            <span>New Order</span>
                                        </Button>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Create a new order</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.div
                                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <User className="h-4 w-4 text-primary" />
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs">My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs">
                                    <User className="mr-2 h-3 w-3" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                    <Settings className="mr-2 h-3 w-3" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs">
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-[#1E1E2D] h-[360px] overflow-hidden relative">
                    {isLoading && (
                        <motion.div
                            className="absolute inset-0 bg-black/10 dark:bg-black/20 z-10 flex items-center justify-center backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center shadow-lg"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                <RefreshCw className="h-5 w-5 text-primary animate-spin mb-2" />
                                <p className="text-xs">Fetching latest data...</p>
                                <Progress value={loadingProgress} className="w-40 mt-2 h-1" />
                            </motion.div>
                        </motion.div>
                    )}
                    <AnimatePresence>
                        {showNotification && (
                            <motion.div
                                className={`absolute top-4 right-4 rounded-lg py-2 px-3 z-20 flex items-center shadow-lg ${notificationType === 'success'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-primary/90 text-white'
                                    }`}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={notificationVariants}
                            >
                                {notificationType === 'success' ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        <span className="text-xs">Data refreshed successfully!</span>
                                    </>
                                ) : (
                                    <>
                                        <Bell className="h-4 w-4 mr-2" />
                                        <span className="text-xs">New order from Nairobi Spirits!</span>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={tabVariants}
                            className="h-full"
                        >
                            {activeTab === 'dashboard' && (
                                <div className="p-4 grid grid-cols-12 gap-4">
                                    <motion.div
                                        className="col-span-12 sm:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                                        whileHover={{ y: -3, boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.2)" }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        variants={itemFadeIn}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Today's Orders</p>
                                                <motion.p
                                                    className="text-xl font-bold mt-1 text-gray-900 dark:text-white"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    142
                                                </motion.p>
                                            </div>
                                            <motion.div
                                                whileHover={{ rotate: 15, scale: 1.1 }}
                                                className="bg-primary/10 p-2 rounded-lg"
                                            >
                                                <ShoppingCart className="h-4 w-4 text-primary" />
                                            </motion.div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1">
                                            <motion.div
                                                animate={{ x: [0, 3, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <ChevronRight className="h-3 w-3 text-green-500" />
                                            </motion.div>
                                            <span className="text-xs text-green-500">12% from yesterday</span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="col-span-12 sm:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                                        whileHover={{ y: -3, boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.2)" }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        variants={itemFadeIn}
                                        custom={1}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Inventory Alerts</p>
                                                <motion.p
                                                    className="text-xl font-bold mt-1 text-gray-900 dark:text-white"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    8
                                                </motion.p>
                                            </div>
                                            <motion.div
                                                whileHover={{ rotate: 15, scale: 1.1 }}
                                                className="bg-yellow-500/10 p-2 rounded-lg"
                                            >
                                                <Package className="h-4 w-4 text-yellow-500" />
                                            </motion.div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1">
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                <XCircle className="h-3 w-3 text-red-500" />
                                            </motion.div>
                                            <span className="text-xs text-red-500">3 critical items</span>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        className="col-span-12 sm:col-span-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 relative"
                                        whileHover={{ y: -3, boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.2)" }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        variants={itemFadeIn}
                                        custom={2}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-gray-500 dark:text-gray-400 text-xs flex items-center">
                                                <BarChart className="h-3 w-3 mr-1 text-primary" />
                                                Sales Performance
                                            </h3>

                                            <div className="flex gap-2">
                                                <div className="flex text-xs bg-gray-100 dark:bg-gray-700/50 rounded-full p-0.5">
                                                    {['daily', 'weekly', 'monthly'].map(timeframe => (
                                                        <button
                                                            key={timeframe}
                                                            onClick={() => changeTimeframe(timeframe)}
                                                            className={`px-2 py-0.5 rounded-full text-xs ${selectedTimeframe === timeframe
                                                                ? 'bg-primary text-white'
                                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                                                                } transition-colors`}
                                                        >
                                                            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative h-28">
                                            {/* Chart background grid */}
                                            <div className="absolute inset-0 grid grid-rows-4 gap-0">
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className="border-t border-gray-100 dark:border-gray-700/50" />
                                                ))}
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 h-full">
                                                {chartData.map((h, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${h}%` }}
                                                            transition={{
                                                                duration: 0.8,
                                                                delay: i * 0.05,
                                                                type: "spring"
                                                            }}
                                                            className={`w-full bg-gradient-to-t ${i === chartData.indexOf(Math.max(...chartData))
                                                                ? 'from-green-500 to-green-400'
                                                                : 'from-primary to-primary/70'
                                                                } rounded-t-sm relative group`}
                                                            onMouseEnter={() => {
                                                                const newHovering = [...isHovering];
                                                                newHovering[i] = true;
                                                                setIsHovering(newHovering);
                                                            }}
                                                            onMouseLeave={() => {
                                                                const newHovering = [...isHovering];
                                                                newHovering[i] = false;
                                                                setIsHovering(newHovering);
                                                            }}
                                                        >
                                                            {isHovering[i] && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-0.5 px-1.5 rounded whitespace-nowrap z-10"
                                                                >
                                                                    {h.toFixed(1)}%
                                                                </motion.div>
                                                            )}
                                                        </motion.div>
                                                        <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">{chartLabels[i]}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        className="col-span-12 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                                        variants={itemFadeIn}
                                        custom={3}
                                        whileHover={{ boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.2)" }}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-gray-500 dark:text-gray-400 text-xs flex items-center">
                                                <ClipboardList className="h-3 w-3 mr-1 text-primary" />
                                                Recent Orders
                                            </h3>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={handleOrdersClick}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View All
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {[
                                                {
                                                    id: '#142',
                                                    customer: 'Nairobi Spirits',
                                                    amount: '24,800',
                                                    status: 'completed',
                                                    time: '2 hours ago',
                                                    icon: CheckCircle,
                                                    iconColor: 'text-green-500'
                                                },
                                                {
                                                    id: '#141',
                                                    customer: 'Coast Distributors',
                                                    amount: '18,500',
                                                    status: 'shipped',
                                                    time: '5 hours ago',
                                                    icon: Truck,
                                                    iconColor: 'text-blue-500'
                                                },
                                                {
                                                    id: '#140',
                                                    customer: 'Thika Wines',
                                                    amount: '32,400',
                                                    status: 'processing',
                                                    time: '6 hours ago',
                                                    icon: Clock,
                                                    iconColor: 'text-yellow-500'
                                                }
                                            ].map((order, index) => (
                                                <motion.div
                                                    key={order.id}
                                                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded transition-colors cursor-pointer"
                                                    variants={itemFadeIn}
                                                    custom={index + 4}
                                                    whileHover={{
                                                        backgroundColor: "rgba(124, 58, 237, 0.05)",
                                                        x: 2
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <motion.div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${order.status === 'completed' ? 'bg-green-500/10' :
                                                                order.status === 'shipped' ? 'bg-blue-500/10' :
                                                                    'bg-yellow-500/10'
                                                                }`}
                                                            whileHover={{ scale: 1.1 }}
                                                        >
                                                            <order.icon className={`h-3 w-3 ${order.iconColor}`} />
                                                        </motion.div>
                                                        <div>
                                                            <div className="flex items-center">
                                                                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{order.id}</p>
                                                                <span className="text-xs text-gray-500 ml-2">({order.time})</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{order.amount}</p>
                                                        <Badge
                                                            variant={order.status === 'completed' ? 'default' : 'outline'}
                                                            className={`text-xs capitalize px-2 py-0 h-5 ${order.status === 'completed'
                                                                ? 'bg-green-500/90 hover:bg-green-500/90 text-white'
                                                                : order.status === 'shipped'
                                                                    ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/10'
                                                                    : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10'
                                                                }`}
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
                                                                    <MoreHorizontal className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-32">
                                                                <DropdownMenuItem className="text-xs">View details</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-xs">Track shipment</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-xs">Print invoice</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div className="p-4 h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-1">
                                            <h2 className="text-sm font-medium text-gray-800 dark:text-white">Orders</h2>
                                            <Badge className="bg-green-600/20 text-slate-700 dark:text-slate-100 text-xs">
                                                25 new today
                                            </Badge>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Search orders..."
                                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs py-1 pl-7 pr-2 w-32 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                                />
                                            </div>

                                            <Button size="sm" className="text-xs h-7 gap-1">
                                                <Filter className="h-3 w-3" />
                                                Filter
                                            </Button>
                                        </div>
                                    </div>
                                    <motion.div
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1"
                                        variants={itemFadeIn}
                                    >
                                        <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="col-span-2 text-xs">Order ID</div>
                                            <div className="col-span-3">Customer</div>
                                            <div className="col-span-2 text-xs">Date</div>
                                            <div className="col-span-2 text-xs">Amount</div>
                                            <div className="col-span-2 text-xs">Status</div>
                                            <div className="col-span-1 text-right">Actions</div>
                                        </div>

                                        {[
                                            {
                                                id: '#142',
                                                customer: 'Nairobi Spirits',
                                                date: 'Today',
                                                amount: '24,800',
                                                status: 'completed',
                                                icon: CheckCircle,
                                                iconColor: 'text-green-500'
                                            },
                                            {
                                                id: '#141',
                                                customer: 'Coast Distributors',
                                                date: 'Yesterday',
                                                amount: '18,500',
                                                status: 'shipped',
                                                icon: Truck,
                                                iconColor: 'text-blue-500'
                                            },
                                            {
                                                id: '#140',
                                                customer: 'Thika Wines',
                                                date: '2 days ago',
                                                amount: '32,400',
                                                status: 'processing',
                                                icon: Clock,
                                                iconColor: 'text-yellow-500'
                                            },
                                            {
                                                id: '#139',
                                                customer: 'Eldoret Drinks',
                                                date: '3 days ago',
                                                amount: '15,200',
                                                status: 'completed',
                                                icon: CheckCircle,
                                                iconColor: 'text-green-500'
                                            },
                                            {
                                                id: '#138',
                                                customer: 'Mombasa Liquor',
                                                date: '1 week ago',
                                                amount: '42,100',
                                                status: 'completed',
                                                icon: CheckCircle,
                                                iconColor: 'text-green-500'
                                            }
                                        ].map((order, index) => (
                                            <motion.div
                                                key={order.id}
                                                className="grid grid-cols-12 items-center p-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-xs cursor-pointer"
                                                variants={itemFadeIn}
                                                custom={index}
                                                whileHover={{
                                                    backgroundColor: "rgba(124, 58, 237, 0.05)",
                                                    x: 2
                                                }}
                                            >
                                                <div className="col-span-2 font-medium text-gray-800 dark:text-gray-200 flex items-center">
                                                    <order.icon className={`h-3 w-3 mr-1 ${order.iconColor}`} />
                                                    {order.id}
                                                </div>
                                                <div className="col-span-3 text-gray-700 dark:text-gray-300">{order.customer}</div>
                                                <div className="col-span-2 text-gray-500 dark:text-gray-400 flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                                    {order.date}
                                                </div>
                                                <div className="col-span-2 text-gray-700 dark:text-gray-300 flex items-center">
                                                    <CreditCard className="h-3 w-3 mr-1 text-gray-400" />
                                                    {order.amount}
                                                </div>
                                                <div className="col-span-2">
                                                    <Badge
                                                        variant={
                                                            order.status === 'completed' ? 'default' :
                                                                order.status === 'shipped' ? 'secondary' : 'outline'
                                                        }
                                                        className={`text-xs capitalize px-2 py-0 h-5 ${order.status === 'completed'
                                                            ? 'bg-green-500/90 hover:bg-green-500/90 text-white'
                                                            : order.status === 'shipped'
                                                                ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/10'
                                                                : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10'
                                                            }`}
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
                                                                <MoreHorizontal className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-32">
                                                            <DropdownMenuItem className="text-xs">View details</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-xs">Track shipment</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-xs">Print invoice</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Showing 1-5 of 142 orders
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="outline" size="sm" className="h-6 w-6 p-0 text-xs">
                                                1
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-xs">
                                                2
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-xs">
                                                ...
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-xs">
                                                12
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'inventory' || activeTab === 'reports') && (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                    <div className="text-center">
                                        {activeTab === 'inventory' ? (
                                            <Package className="h-10 w-10 mx-auto mb-3 text-primary/40" />
                                        ) : (
                                            <BarChart className="h-10 w-10 mx-auto mb-3 text-primary/40" />
                                        )}
                                        <p className="text-sm">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module</p>
                                        <p className="text-xs mt-1">This section is part of the demo</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    <motion.div
                        className="absolute right-4 bottom-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 }}
                        onClick={() => router.push('/sign-up')}
                    >
                        <motion.button
                            className="bg-primary text-white cursor-pointer rounded-full p-2 shadow-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleOrdersClick}
                        >
                            <ArrowUpRight className="h-4 w-4" />
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </MotionConfig>
    );
};

export default InteractivePreview;