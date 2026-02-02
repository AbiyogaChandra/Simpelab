import React from 'react';

// Explicitly export specific attributes for usage if needed
interface IconifyAttributes extends React.HTMLAttributes<HTMLElement> {
    icon: string;
    mode?: 'svg' | 'style';
    inline?: boolean;
    width?: string | number;
    height?: string | number;
    rotate?: string | number;
    flip?: string;
    style?: React.CSSProperties; // Explicitly ensure style works
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'iconify-icon': React.DetailedHTMLProps<IconifyAttributes, HTMLElement>;
        }
    }
}

// Augment the React namespace specifically if needed for newer React types
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'iconify-icon': React.DetailedHTMLProps<IconifyAttributes, HTMLElement>;
        }
    }
}

