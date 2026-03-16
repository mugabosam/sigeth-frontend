import {
    BedDouble,
    Brush,
    UtensilsCrossed,
    Users,
    ClipboardList,
    Zap,
    Waves,
    Sun,
    Flower2,
    Wind,
    TreePine,
    CloudSun,
} from "lucide-react";

export interface SubmoduleDesign {
    labelKey: string;
    descriptionKey: string;
    icon: typeof BedDouble;
    accentIcon: typeof BedDouble;
    level: string;
    defaultRoute: string;
    demoUser: string;
    demoPass: string;

    // ── Enhanced Design System ──
    // Gradient for left panel
    gradientFrom: string;
    gradientVia: string;
    gradientTo: string;

    // Accent colors
    accentColor: string;
    accentBgLight: string;
    accentBgDark: string;
    accentBorder: string;
    accentBorderDark: string;
    accentText: string;
    accentTextDark: string;

    // Decorative circle colors
    decorCircle1: string;
    decorCircle2: string;
    decorCircle3: string; // Added third circle

    // Module-specific features (translated keys)
    features: string[];

    // Branding message
    brandingTitlePart1Key: string;
    brandingTitlePart2Key: string; // This will be highlighted
    brandingTitlePart3Key: string;
    brandingDescriptionKey: string;

    // ── NEW: Enhanced Visual Properties ──
    // Background pattern overlay
    patternOverlay?: string;

    // Floating elements for animation
    floatingElements?: {
        icon: any;
        color: string;
        size: string;
        position: string;
        delay: number;
    }[];

    // Ambient glow colors
    ambientGlow1: string;
    ambientGlow2: string;

    // Luxury accent
    luxuryAccent: string;

    // Time of day theme (for dynamic feel)
    timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';

    // Texture overlay
    textureOverlay?: string;

    // Interactive hover effects
    hoverEffect: 'shine' | 'glow' | 'float' | 'pulse';

    // Custom font settings
    fontFamily?: string;

    // Border radius theme
    borderRadius: 'soft' | 'rounded' | 'sharp' | 'luxury';

    // Animation intensity
    animationIntensity: 'subtle' | 'moderate' | 'dynamic';

    // Mood setting
    mood: 'serene' | 'energetic' | 'luxurious' | 'calm' | 'vibrant';
}

export const LOGIN_DESIGNS: Record<string, SubmoduleDesign> = {
    rooms: {
        labelKey: "roomsSubmodule",
        descriptionKey: "roomsSubmoduleDesc",
        icon: BedDouble,
        accentIcon: Users,
        level: "Manager_R",
        defaultRoute: "/rooms-attendant/group-reservation",
        demoUser: "Rooms",
        demoPass: "Guest",

        // ── Enhanced Design System - Oceanfront Luxury ──
        gradientFrom: "from-blue-950 via-blue-800 to-teal-600",
        gradientVia: "via-blue-900",
        gradientTo: "to-teal-800",

        accentColor: "blue",
        accentBgLight: "bg-blue-50/80 backdrop-blur-sm",
        accentBgDark: "bg-blue-900/40 backdrop-blur-sm",
        accentBorder: "border-blue-200/50",
        accentBorderDark: "border-blue-700/30",
        accentText: "text-blue-700",
        accentTextDark: "text-blue-200",

        decorCircle1: "bg-blue-400/10",
        decorCircle2: "bg-teal-500/15",
        decorCircle3: "bg-cyan-400/5",

        // New ambient glows
        ambientGlow1: "bg-blue-500/5",
        ambientGlow2: "bg-teal-400/5",

        luxuryAccent: "bg-gradient-to-r from-amber-200/20 to-amber-400/20",

        features: [
            "roomsFeature1",
            "roomsFeature2",
            "roomsFeature3",
            "roomsFeature4",
        ],

        brandingTitlePart1Key: "roomsBrandingPart1",
        brandingTitlePart2Key: "CoastalLuxury",
        brandingTitlePart3Key: "roomsBrandingPart3",
        brandingDescriptionKey: "roomsBrandingDesc",

        // New properties
        patternOverlay: "url('/patterns/waves.svg')",
        timeOfDay: 'dawn',
        textureOverlay: 'url(/textures/linen.png)',
        hoverEffect: 'shine',
        fontFamily: 'font-serif',
        borderRadius: 'luxury',
        animationIntensity: 'moderate',
        mood: 'serene',

        floatingElements: [
            { icon: Waves, color: 'text-blue-200/20', size: 'w-24 h-24', position: 'top-20 left-20', delay: 0 },
            { icon: Sun, color: 'text-amber-200/20', size: 'w-16 h-16', position: 'bottom-40 right-20', delay: 1 },
            { icon: CloudSun, color: 'text-white/10', size: 'w-20 h-20', position: 'top-60 right-40', delay: 2 },
        ],
    },

    housekeeping: {
        labelKey: "housekeepingSubmodule",
        descriptionKey: "housekeepingSubmoduleDesc",
        icon: Brush,
        accentIcon: ClipboardList,
        level: "Manager_H",
        defaultRoute: "/housekeeping/room-categories",
        demoUser: "House",
        demoPass: "Keep",

        // ── Enhanced Design System - Zen Garden Retreat ──
        gradientFrom: "from-emerald-950 via-emerald-800 to-lime-700",
        gradientVia: "via-emerald-900",
        gradientTo: "to-green-800",

        accentColor: "emerald",
        accentBgLight: "bg-emerald-50/80 backdrop-blur-sm",
        accentBgDark: "bg-emerald-900/40 backdrop-blur-sm",
        accentBorder: "border-emerald-200/50",
        accentBorderDark: "border-emerald-700/30",
        accentText: "text-emerald-700",
        accentTextDark: "text-emerald-200",

        decorCircle1: "bg-emerald-400/10",
        decorCircle2: "bg-lime-500/15",
        decorCircle3: "bg-green-400/5",

        // New ambient glows
        ambientGlow1: "bg-emerald-500/5",
        ambientGlow2: "bg-green-400/5",

        luxuryAccent: "bg-gradient-to-r from-amber-200/20 to-amber-400/20",

        features: [
            "housekeepingFeature1",
            "housekeepingFeature2",
            "housekeepingFeature3",
            "housekeepingFeature4",
        ],

        brandingTitlePart1Key: "housekeepingBrandingPart1",
        brandingTitlePart2Key: "GardenSerenity",
        brandingTitlePart3Key: "housekeepingBrandingPart3",
        brandingDescriptionKey: "housekeepingBrandingDesc",

        // New properties
        patternOverlay: "url('/patterns/leaves.svg')",
        timeOfDay: 'day',
        textureOverlay: 'url(/textures/paper.png)',
        hoverEffect: 'float',
        fontFamily: 'font-sans',
        borderRadius: 'soft',
        animationIntensity: 'subtle',
        mood: 'calm',

        floatingElements: [
            { icon: Flower2, color: 'text-emerald-200/20', size: 'w-20 h-20', position: 'top-32 left-16', delay: 0 },
            { icon: TreePine, color: 'text-green-200/15', size: 'w-28 h-28', position: 'bottom-28 right-24', delay: 1.5 },
            { icon: Wind, color: 'text-lime-200/10', size: 'w-16 h-16', position: 'top-48 right-32', delay: 0.8 },
        ],
    },

    banqueting: {
        labelKey: "banquetingSubmodule",
        descriptionKey: "banquetingSubmoduleDesc",
        icon: UtensilsCrossed,
        accentIcon: Zap,
        level: "Manager_B",
        defaultRoute: "/banqueting/events-lots",
        demoUser: "Banquet",
        demoPass: "Bguest",

        // ── Enhanced Design System - Royal Gala Evening ──
        gradientFrom: "from-purple-950 via-fuchsia-900 to-rose-800",
        gradientVia: "via-purple-900",
        gradientTo: "to-pink-800",

        accentColor: "purple",
        accentBgLight: "bg-purple-50/80 backdrop-blur-sm",
        accentBgDark: "bg-purple-900/40 backdrop-blur-sm",
        accentBorder: "border-purple-200/50",
        accentBorderDark: "border-purple-700/30",
        accentText: "text-purple-700",
        accentTextDark: "text-purple-200",

        decorCircle1: "bg-purple-400/10",
        decorCircle2: "bg-fuchsia-500/15",
        decorCircle3: "bg-rose-400/5",

        // New ambient glows
        ambientGlow1: "bg-purple-500/5",
        ambientGlow2: "bg-fuchsia-400/5",

        luxuryAccent: "bg-gradient-to-r from-amber-200/20 to-amber-400/20",

        features: [
            "banquetingFeature1",
            "banquetingFeature2",
            "banquetingFeature3",
            "banquetingFeature4",
        ],

        brandingTitlePart1Key: "banquetingBrandingPart1",
        brandingTitlePart2Key: "RoyalMemories",
        brandingTitlePart3Key: "banquetingBrandingPart3",
        brandingDescriptionKey: "banquetingBrandingDesc",

        // New properties
        patternOverlay: "url('/patterns/confetti.svg')",
        timeOfDay: 'dusk',
        textureOverlay: 'url(/textures/velvet.png)',
        hoverEffect: 'glow',
        fontFamily: 'font-serif',
        borderRadius: 'rounded',
        animationIntensity: 'dynamic',
        mood: 'vibrant',

        floatingElements: [
            { icon: UtensilsCrossed, color: 'text-purple-200/20', size: 'w-20 h-20', position: 'top-24 left-20', delay: 0 },
            { icon: Zap, color: 'text-amber-200/25', size: 'w-16 h-16', position: 'bottom-32 right-28', delay: 0.5 },
            { icon: Waves, color: 'text-fuchsia-200/15', size: 'w-24 h-24', position: 'top-40 right-40', delay: 1.2 },
            { icon: Sun, color: 'text-rose-200/10', size: 'w-20 h-20', position: 'bottom-48 left-32', delay: 1.8 },
        ],
    },
};

// ── NEW: Theme presets for consistent luxury feel ──
export const LUXURY_PRESETS = {
    gold: "bg-gradient-to-r from-amber-200/30 via-yellow-200/30 to-amber-200/30",
    silver: "bg-gradient-to-r from-gray-200/30 via-slate-200/30 to-gray-200/30",
    platinum: "bg-gradient-to-r from-zinc-200/30 via-stone-200/30 to-zinc-200/30",
    rose: "bg-gradient-to-r from-rose-200/30 via-pink-200/30 to-rose-200/30",
};

// ── NEW: Animation presets ──
export const ANIMATION_PRESETS = {
    subtle: {
        duration: 0.3,
        scale: 1.02,
        opacity: 0.9,
    },
    moderate: {
        duration: 0.5,
        scale: 1.05,
        opacity: 0.8,
    },
    dynamic: {
        duration: 0.7,
        scale: 1.1,
        opacity: 0.7,
    },
};

// ── NEW: Typography scales for different moods ──
export const TYPOGRAPHY_PRESETS = {
    serene: {
        heading: "text-5xl md:text-6xl font-light tracking-wide leading-tight",
        subheading: "text-xl font-light tracking-wide",
        body: "text-base font-normal leading-relaxed",
    },
    energetic: {
        heading: "text-5xl md:text-7xl font-bold tracking-tight leading-none",
        subheading: "text-2xl font-semibold tracking-tight",
        body: "text-base font-medium leading-snug",
    },
    luxurious: {
        heading: "text-5xl md:text-6xl font-serif font-light tracking-wider leading-tight",
        subheading: "text-xl font-serif tracking-wide",
        body: "text-base font-serif leading-relaxed",
    },
    calm: {
        heading: "text-5xl md:text-6xl font-normal tracking-wide leading-relaxed",
        subheading: "text-xl font-light tracking-wide",
        body: "text-base font-light leading-relaxed",
    },
    vibrant: {
        heading: "text-5xl md:text-7xl font-black tracking-tighter leading-none",
        subheading: "text-2xl font-bold tracking-tight",
        body: "text-base font-medium leading-normal",
    },
};

/**
 * Get the design configuration for a specific submodule
 * @param submodule - The submodule identifier (rooms, housekeeping, banqueting)
 * @returns The enhanced design configuration
 */
export function getLoginDesign(submodule: string | undefined): SubmoduleDesign {
    if (!submodule || !LOGIN_DESIGNS[submodule]) {
        return LOGIN_DESIGNS.rooms;
    }
    return LOGIN_DESIGNS[submodule];
}

/**
 * Get typography preset based on mood
 */
export function getTypographyForMood(mood: string) {
    return TYPOGRAPHY_PRESETS[mood as keyof typeof TYPOGRAPHY_PRESETS] || TYPOGRAPHY_PRESETS.serene;
}

/**
 * Get animation preset based on intensity
 */
export function getAnimationForIntensity(intensity: string) {
    return ANIMATION_PRESETS[intensity as keyof typeof ANIMATION_PRESETS] || ANIMATION_PRESETS.moderate;
}

/**
 * Check if a submodule is recognized
 */
export function isValidSubmodule(submodule: string): boolean {
    return Object.keys(LOGIN_DESIGNS).includes(submodule);
}

/**
 * Get all available submodules
 */
export function getAvailableSubmodules(): string[] {
    return Object.keys(LOGIN_DESIGNS);
}

/**
 * Get submodule design by mood
 */
export function getDesignsByMood(mood: string): SubmoduleDesign[] {
    return Object.values(LOGIN_DESIGNS).filter(design => design.mood === mood);
}

// ── NEW: Export color schemes for consistent theming ──
export const COLOR_SCHEMES = {
    ocean: {
        primary: 'blue',
        secondary: 'teal',
        accent: 'cyan',
        gradient: 'from-blue-950 via-blue-900 to-teal-800',
    },
    garden: {
        primary: 'emerald',
        secondary: 'green',
        accent: 'lime',
        gradient: 'from-emerald-950 via-emerald-900 to-green-800',
    },
    royal: {
        primary: 'purple',
        secondary: 'fuchsia',
        accent: 'pink',
        gradient: 'from-purple-950 via-fuchsia-900 to-rose-800',
    },
};