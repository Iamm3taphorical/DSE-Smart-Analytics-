import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const { useState, useEffect } = React;

const CustomCursor: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('clickable')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleMouseOver);

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
            document.body.style.cursor = 'auto';
        };
    }, [cursorX, cursorY]); // isVisible dep excluded to avoid re-run flicker

    if (!isVisible) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-emerald-500 mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
                    opacity: 1,
                }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 rounded-full bg-emerald-400"
                style={{
                    x: cursorX, // Direct tracking no spring for dot
                    y: cursorY,
                    translateX: 12, // Center dot in 32px circle (16 - 4 + offset) -> simpler: x maps to top-left
                    translateY: 12,
                }}
            />
        </div>
    );
};

export default CustomCursor;
