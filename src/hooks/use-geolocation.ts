import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// === TYPES & INTERFACES ===
export interface LocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
}

export interface LocationState {
    loading: boolean;
    location: LocationCoordinates | null;
    error: string | null;
    lastUpdated: number | null;
    attempts: number;
    isWatching: boolean;
    hasHighAccuracyFix: boolean;
    permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
    batteryOptimized: boolean;
    signalStrength: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
}

interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    retryAttempts?: number;
    accuracyThreshold?: number;
    backgroundTracking?: boolean;
    adaptiveTimeout?: boolean;
    batteryOptimization?: boolean; // Aggressive battery saving
    deliveryMode?: boolean; // Optimized for delivery riders
    stationaryThreshold?: number; // Distance threshold for considering stationary
    heatReductionMode?: boolean; // Prevents phone heating
}

interface LocationHistory {
    location: LocationCoordinates;
    timestamp: number;
    source: 'gps' | 'network' | 'passive';
    batteryLevel?: number;
    deviceTemperature?: 'normal' | 'warm' | 'hot';
}

interface KenyaLocationContext {
    inNairobi: boolean;
    inMombasa: boolean;
    inKisumu: boolean;
    inMajorCity: boolean;
    networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// === ULTRA-OPTIMIZED FOR ACCURACY & BATTERY MGT ===
class UltraLocationOptimizer {
    private history: LocationHistory[] = [];
    private maxHistorySize = 15;
    private stationaryCount = 0;
    private lastMovementTime = Date.now();
    private batteryLevel = 1.0;
    private isHotDevice = false;
    private networkQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';

    // Kenya-specific optimizations
    private kenyaLocationContext: KenyaLocationContext = {
        inNairobi: false,
        inMombasa: false,
        inKisumu: false,
        inMajorCity: false,
        networkQuality: 'good'
    };

    constructor(private options: Required<GeolocationOptions>) {
        this.initializeBatteryMonitoring();
        this.initializeNetworkQualityDetection();
    }

    private async initializeBatteryMonitoring() {
        try {
            // @ts-ignore - Battery API is experimental but widely supported
            const battery = await navigator.getBattery?.();
            if (battery) {
                this.batteryLevel = battery.level;
                battery.addEventListener('levelchange', () => {
                    this.batteryLevel = battery.level;
                });

                battery.addEventListener('chargingchange', () => {
                    // More aggressive when not charging
                    if (!battery.charging && this.batteryLevel < 0.3) {
                        this.isHotDevice = true;
                    }
                });
            }
        } catch (error) {
            console.debug('Battery API not available');
        }
    }

    private initializeNetworkQualityDetection() {
        try {
            // @ts-ignore - NetworkInformation API
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                this.updateNetworkQuality(connection);
                connection.addEventListener('change', () => {
                    this.updateNetworkQuality(connection);
                });
            }
        } catch (error) {
            console.debug('Network Information API not available');
        }
    }

    private updateNetworkQuality(connection: any) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink || 1;

        if (effectiveType === '4g' && downlink > 2) {
            this.networkQuality = 'excellent';
        } else if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 1)) {
            this.networkQuality = 'good';
        } else if (effectiveType === '3g' || effectiveType === '2g') {
            this.networkQuality = 'fair';
        } else {
            this.networkQuality = 'poor';
        }

        this.kenyaLocationContext.networkQuality = this.networkQuality;
    }

    addLocation(location: LocationCoordinates, source: 'gps' | 'network' | 'passive') {
        // Detect Kenya context
        this.updateKenyaContext(location);

        const historyEntry: LocationHistory = {
            location,
            timestamp: Date.now(),
            source,
            batteryLevel: this.batteryLevel,
            deviceTemperature: this.getDeviceTemperature()
        };

        this.history.push(historyEntry);

        // Adaptive history management based on battery
        const maxSize = this.batteryLevel < 0.2 ? 8 : this.maxHistorySize;
        if (this.history.length > maxSize) {
            this.history = this.history.slice(-maxSize);
        }

        // Update movement tracking
        this.updateMovementTracking(location);
    }

    private updateKenyaContext(location: LocationCoordinates) {
        const { latitude, longitude } = location;

        this.kenyaLocationContext.inNairobi =
            latitude >= -1.444 && latitude <= -1.163 &&
            longitude >= 36.650 && longitude <= 37.103;

        this.kenyaLocationContext.inMombasa =
            latitude >= -4.120 && latitude <= -3.950 &&
            longitude >= 39.580 && longitude <= 39.750;

        this.kenyaLocationContext.inKisumu =
            latitude >= -0.150 && latitude <= -0.050 &&
            longitude >= 34.700 && longitude <= 34.850;

        this.kenyaLocationContext.inMajorCity =
            this.kenyaLocationContext.inNairobi ||
            this.kenyaLocationContext.inMombasa ||
            this.kenyaLocationContext.inKisumu;
    }

    private getDeviceTemperature(): 'normal' | 'warm' | 'hot' {
        // Heuristic based on frequency of location requests and battery drain
        const recentRequests = this.history.filter(h =>
            Date.now() - h.timestamp < 60000
        ).length;

        if (recentRequests > 10 || this.batteryLevel < 0.15) {
            this.isHotDevice = true;
            return 'hot';
        } else if (recentRequests > 6 || this.batteryLevel < 0.3) {
            return 'warm';
        }
        return 'normal';
    }

    private updateMovementTracking(location: LocationCoordinates) {
        if (this.history.length < 2) return;

        const previous = this.history[this.history.length - 2];
        const distance = this.calculateDistance(previous.location, location);

        if (distance < this.options.stationaryThreshold) {
            this.stationaryCount++;
        } else {
            this.stationaryCount = 0;
            this.lastMovementTime = Date.now();
        }
    }

    getBestLocation(): LocationCoordinates | null {
        if (this.history.length === 0) return null;

        const timeWindow = this.getOptimalTimeWindow();
        const recentLocations = this.history.filter(h =>
            Date.now() - h.timestamp < timeWindow
        );

        if (recentLocations.length === 0) return null;

        // Ultra-smart sorting based on multiple factors
        const sorted = recentLocations.sort((a, b) => {
            // 1. Prioritize GPS in major cities (better infrastructure)
            if (this.kenyaLocationContext.inMajorCity) {
                if (a.source === 'gps' && b.source !== 'gps') return -1;
                if (b.source === 'gps' && a.source !== 'gps') return 1;
            }

            // 2. Battery-aware accuracy prioritization
            const aAccuracy = this.getBatteryAdjustedAccuracy(a.location.accuracy);
            const bAccuracy = this.getBatteryAdjustedAccuracy(b.location.accuracy);

            if (Math.abs(aAccuracy - bAccuracy) > 5) {
                return aAccuracy - bAccuracy;
            }

            // 3. Recency with network quality consideration
            const aRecencyScore = this.getRecencyScore(a.timestamp);
            const bRecencyScore = this.getRecencyScore(b.timestamp);

            return bRecencyScore - aRecencyScore;
        });

        return sorted[0]?.location || null;
    }

    private getOptimalTimeWindow(): number {
        // Adaptive time window based on context
        if (this.isHotDevice || this.batteryLevel < 0.2) return 60000; // 1 minute
        if (this.kenyaLocationContext.inMajorCity) return 45000; // 45 seconds in cities
        if (this.networkQuality === 'poor') return 90000; // 1.5 minutes on poor network
        return 30000; // 30 seconds default
    }

    private getBatteryAdjustedAccuracy(accuracy: number): number {
        // When battery is low, be more lenient with accuracy
        if (this.batteryLevel < 0.2) return accuracy * 0.8;
        if (this.batteryLevel < 0.4) return accuracy * 0.9;
        return accuracy;
    }

    private getRecencyScore(timestamp: number): number {
        const age = Date.now() - timestamp;
        const maxAge = this.getOptimalTimeWindow();
        return Math.max(0, (maxAge - age) / maxAge * 100);
    }

    // Enhanced stationary detection with Kenya traffic patterns
    isStationary(): boolean {
        if (this.history.length < 3) return false;

        // In delivery mode, be more sensitive to movement
        if (this.options.deliveryMode) {
            return this.stationaryCount >= 2;
        }

        // In Nairobi traffic, allow for longer stationary periods
        if (this.kenyaLocationContext.inNairobi) {
            return this.stationaryCount >= 4; // Account for traffic jams
        }

        return this.stationaryCount >= 3;
    }

    // Ultra-battery-optimized settings
    getOptimalSettings(): PositionOptions {
        const baseSettings: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000
        };

        // Heat reduction mode
        if (this.options.heatReductionMode || this.isHotDevice) {
            return {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: this.isStationary() ? 300000 : 60000 // 5min/1min cache
            };
        }

        // Battery optimization
        if (this.options.batteryOptimization && this.batteryLevel < 0.3) {
            return {
                enableHighAccuracy: this.kenyaLocationContext.inMajorCity, // Only in cities when low battery
                timeout: 20000,
                maximumAge: this.isStationary() ? 180000 : 30000 // 3min/30sec cache
            };
        }

        // Delivery mode optimizations
        if (this.options.deliveryMode) {
            return {
                enableHighAccuracy: true,
                timeout: this.kenyaLocationContext.inMajorCity ? 10000 : 15000,
                maximumAge: this.isStationary() ? 60000 : 2000 // Aggressive refresh when moving
            };
        }

        // Network-aware settings
        if (this.networkQuality === 'poor') {
            return {
                enableHighAccuracy: false,
                timeout: 25000,
                maximumAge: 15000
            };
        }

        return baseSettings;
    }

    private calculateDistance(pos1: LocationCoordinates, pos2: LocationCoordinates): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = pos1.latitude * Math.PI / 180;
        const φ2 = pos2.latitude * Math.PI / 180;
        const Δφ = (pos2.latitude - pos1.latitude) * Math.PI / 180;
        const Δλ = (pos2.longitude - pos1.longitude) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // Get performance metrics for debugging
    getPerformanceMetrics() {
        return {
            historySize: this.history.length,
            batteryLevel: this.batteryLevel,
            isHotDevice: this.isHotDevice,
            stationaryCount: this.stationaryCount,
            lastMovementTime: this.lastMovementTime,
            kenyaContext: this.kenyaLocationContext,
            networkQuality: this.networkQuality
        };
    }
}

// === MAIN HOOK ===
export function useUltraGeolocation(options: GeolocationOptions = {
}) {
    const defaultOptions: Required<GeolocationOptions> = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
        retryAttempts: 3,
        accuracyThreshold: 20,
        backgroundTracking: false,
        adaptiveTimeout: true,
        batteryOptimization: true, // ON by default
        deliveryMode: false,
        stationaryThreshold: 10, // 10 meters
        heatReductionMode: false,
        ...options
    };

    const [state, setState] = useState<LocationState>({
        loading: true,
        location: null,
        error: null,
        lastUpdated: null,
        attempts: 0,
        isWatching: false,
        hasHighAccuracyFix: false,
        permissionState: 'unknown',
        batteryOptimized: defaultOptions.batteryOptimization,
        signalStrength: 'unknown'
    });

    const watchIdRef = useRef<number | null>(null);
    const optimizerRef = useRef(new UltraLocationOptimizer(defaultOptions));
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);
    const lastKnownLocationRef = useRef<LocationCoordinates | null>(null);
    const performanceMetricsRef = useRef<any>({});

    const isSupported = 'geolocation' in navigator;

    // Enhanced error messages for Kenya context
    const getErrorMessage = (error: GeolocationPositionError): string => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return 'Ongeza location services kwenye browser yako ili tumitumie huduma zetu vizuri.';
            case error.POSITION_UNAVAILABLE:
                return 'Haiwezi kupata location yako. Hakikisha GPS au WiFi imewashwa.';
            case error.TIMEOUT:
                return 'Location request imekataliwa. Tunajaribu na mipangilio mingine...';
            default:
                return `Location error: ${error.message}`;
        }
    };

    // Permission management with better UX
    const checkPermissionStatus = useCallback(async () => {
        if (!navigator.permissions) return;

        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            setState(prev => ({
                ...prev,
                permissionState: permission.state as 'granted' | 'denied' | 'prompt'
            }));

            permission.addEventListener('change', () => {
                setState(prev => ({
                    ...prev,
                    permissionState: permission.state as 'granted' | 'denied' | 'prompt'
                }));
            });
        } catch (error) {
            console.debug('Permission API not available');
        }
    }, []);

    // Ultra-optimized success handler
    const onLocationSuccess = useCallback((position: GeolocationPosition) => {
        if (!mountedRef.current) return;

        const coords = position.coords;
        const newLocation: LocationCoordinates = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed
        };

        // Determine source with Kenya-specific logic
        const source: 'gps' | 'network' | 'passive' = (() => {
            if (coords.accuracy <= 10) return 'gps';
            if (coords.accuracy <= 50) return 'network';
            return 'passive';
        })();

        optimizerRef.current.addLocation(newLocation, source);
        const bestLocation = optimizerRef.current.getBestLocation();
        performanceMetricsRef.current = optimizerRef.current.getPerformanceMetrics();

        if (bestLocation && shouldUpdateLocation(bestLocation)) {
            lastKnownLocationRef.current = bestLocation;

            setState(prev => ({
                ...prev,
                loading: false,
                location: bestLocation,
                error: null,
                lastUpdated: Date.now(),
                hasHighAccuracyFix: source === 'gps',
                signalStrength: getSignalStrength(bestLocation.accuracy),
                attempts: 0 // Reset attempts on success
            }));
        }
    }, []);

    const shouldUpdateLocation = (location: LocationCoordinates): boolean => {
        if (!lastKnownLocationRef.current) return true;

        const lastLocation = lastKnownLocationRef.current;

        // Always update if significantly more accurate
        if (location.accuracy < lastLocation.accuracy * 0.7) return true;

        // Update if accuracy meets threshold
        if (location.accuracy <= defaultOptions.accuracyThreshold) return true;

        // Don't update if new location is much less accurate
        if (location.accuracy > lastLocation.accuracy * 1.5) return false;

        return true;
    };

    const getSignalStrength = (accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' => {
        if (accuracy <= 5) return 'excellent';
        if (accuracy <= 15) return 'good';
        if (accuracy <= 50) return 'fair';
        if (accuracy <= 200) return 'poor';
        return 'unknown';
    };

    // Smart error handler with context awareness
    const onLocationError = useCallback((error: GeolocationPositionError) => {
        if (!mountedRef.current) return;

        setState(prev => {
            const newAttempts = prev.attempts + 1;
            const shouldRetry = newAttempts < defaultOptions.retryAttempts;

            if (shouldRetry && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
                const retryDelay = Math.min(2000 * newAttempts, 8000); // Progressive delay
                retryTimeoutRef.current = setTimeout(() => {
                    if (mountedRef.current) {
                        getCurrentLocation(true);
                    }
                }, retryDelay);
            }

            return {
                ...prev,
                loading: !shouldRetry || error.code === error.PERMISSION_DENIED,
                error: shouldRetry ? `${getErrorMessage(error)} (Jaribu ${newAttempts}/${defaultOptions.retryAttempts})` : getErrorMessage(error),
                attempts: newAttempts
            };
        });
    }, [defaultOptions.retryAttempts]);

    // Ultra-smart location fetching
    const getCurrentLocation = useCallback((useFallback = false) => {
        if (!isSupported) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Browser yako haiwezi kutumia location services.'
            }));
            return;
        }

        setState(prev => ({ ...prev, loading: true }));

        const geoOptions = useFallback
            ? { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
            : optimizerRef.current.getOptimalSettings();

        navigator.geolocation.getCurrentPosition(
            onLocationSuccess,
            onLocationError,
            geoOptions
        );
    }, [isSupported, onLocationSuccess, onLocationError]);

    // Intelligent watching with power management
    const startWatching = useCallback(() => {
        if (!isSupported || watchIdRef.current !== null) return;

        setState(prev => ({ ...prev, isWatching: true }));

        const watchOptions = optimizerRef.current.getOptimalSettings();

        watchIdRef.current = navigator.geolocation.watchPosition(
            onLocationSuccess,
            onLocationError,
            watchOptions
        );

        // Adaptive watching - adjust frequency based on movement and battery
        const adaptiveWatchingInterval = setInterval(() => {
            if (watchIdRef.current && mountedRef.current) {
                const metrics = optimizerRef.current.getPerformanceMetrics();

                // Stop watching if device is too hot or battery too low
                if (metrics.isHotDevice && metrics.batteryLevel < 0.15) {
                    stopWatching();
                    setTimeout(startWatching, 60000); // Restart after 1 minute
                }
            }
        }, 30000);

        return () => clearInterval(adaptiveWatchingInterval);
    }, [isSupported, onLocationSuccess, onLocationError]);

    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            setState(prev => ({ ...prev, isWatching: false }));
        }
    }, []);

    // Convenience methods
    const getLocation = useCallback(() => getCurrentLocation(), [getCurrentLocation]);

    const getLastKnownLocation = useCallback(() => lastKnownLocationRef.current, []);

    const getAccuracyScore = useCallback(() => {
        if (!state.location) return 0;
        const accuracy = state.location.accuracy;
        if (accuracy <= 5) return 100;
        if (accuracy <= 10) return 95;
        if (accuracy <= 20) return 85;
        if (accuracy <= 50) return 70;
        if (accuracy <= 100) return 50;
        return 25;
    }, [state.location]);

    // Performance insights for debugging
    const getPerformanceInsights = useCallback(() => {
        return {
            ...performanceMetricsRef.current,
            accuracyScore: getAccuracyScore(),
            locationAge: state.lastUpdated ? Date.now() - state.lastUpdated : null,
            isOptimal: state.signalStrength === 'excellent' && state.hasHighAccuracyFix
        };
    }, [getAccuracyScore, state.lastUpdated, state.signalStrength, state.hasHighAccuracyFix]);

    // Memoized coordinates for external APIs
    const coordinates = useMemo(() =>
        state.location ? {
            lat: state.location.latitude,
            lng: state.location.longitude,
            accuracy: state.location.accuracy
        } : null,
        [state.location]
    );

    const locationString = useMemo(() =>
        state.location
            ? `${state.location.latitude.toFixed(6)},${state.location.longitude.toFixed(6)}`
            : null,
        [state.location]
    );

    // Initialize with smart defaults
    useEffect(() => {
        mountedRef.current = true;
        checkPermissionStatus();
        getCurrentLocation();

        // Smart background tracking
        if (defaultOptions.backgroundTracking) {
            const startDelay = defaultOptions.deliveryMode ? 1000 : 3000;
            const timer = setTimeout(startWatching, startDelay);
            return () => clearTimeout(timer);
        }

        return () => {
            mountedRef.current = false;
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            stopWatching();
        };
    }, [checkPermissionStatus, getCurrentLocation, defaultOptions.backgroundTracking, defaultOptions.deliveryMode, startWatching, stopWatching]);

    return {
        // State
        ...state,
        isSupported,

        // Actions
        getLocation,
        startWatching,
        stopWatching,
        getLastKnownLocation,

        getAccuracyScore,
        getPerformanceInsights,

        // Quick access
        coordinates,
        locationString,

        inNairobi: performanceMetricsRef.current?.kenyaContext?.inNairobi || false,
        inMombasa: performanceMetricsRef.current?.kenyaContext?.inMombasa || false,
        inMajorCity: performanceMetricsRef.current?.kenyaContext?.inMajorCity || false,

        batteryLevel: performanceMetricsRef.current?.batteryLevel || 1,
        isDeviceHot: performanceMetricsRef.current?.isHotDevice || false,
        networkQuality: performanceMetricsRef.current?.networkQuality || 'unknown'
    };
}