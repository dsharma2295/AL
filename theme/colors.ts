export const colors = {
    // Backgrounds
    background: {
        primary: '#0a0a0f',
        secondary: '#1a1a1a',
        card: 'rgba(255, 255, 255, 0.05)',
        modalOverlay: 'rgba(0, 0, 0, 0.92)',
    },

    // Text
    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        tertiary: 'rgba(255, 255, 255, 0.4)',
        disabled: '#666666',
    },

    // Categories
    category: {
        canDo: '#2ecc71',      // Green
        cannotDo: '#e74c3c',   // Red
        yourRights: '#3498db', // Blue
        quickPhrases: '#f39c12', // Orange
    },

    // Priority
    priority: {
        critical: '#e74c3c',   // Red
        important: '#f39c12',  // Orange
        info: '#95a5a6',       // Gray
    },

    // Actions
    action: {
        primary: '#3498db',    // Blue
        success: '#2ecc71',    // Green
        danger: '#e74c3c',     // Red
        warning: '#f39c12',    // Orange
    },

    // Borders
    border: {
        default: 'rgba(255, 255, 255, 0.1)',
        subtle: 'rgba(255, 255, 255, 0.05)',
    },
} as const;