import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import "./IntroLoader.css";

function IntroLoader() {
    const location = useLocation();

    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        // Only show the intro on the Home page
        if (location.pathname !== "/") {
            setVisible(false);
            return;
        }

        // Check if intro was already shown in this browser session
        const introShown = sessionStorage.getItem("tokyo_trendz_intro_shown");

        if (introShown === "true") {
            setVisible(false);
            return;
        }

        // Show intro
        setVisible(true);
        setClosing(false);

        // Mark intro as shown immediately
        sessionStorage.setItem("tokyo_trendz_intro_shown", "true");

        // Start closing animation
        const closeTimer = setTimeout(() => {
            setClosing(true);
        }, 2500);

        // Completely remove intro
        const hideTimer = setTimeout(() => {
            setVisible(false);
        }, 3100);

        return () => {
            clearTimeout(closeTimer);
            clearTimeout(hideTimer);
        };
    }, [location.pathname]);

    // Don't render anything if intro shouldn't be shown
    if (!visible || location.pathname !== "/") {
        return null;
    }

    return (
        <div className={`intro-loader ${closing ? "intro-closing" : ""}`}>

            <div className="intro-red-glow"></div>

            <div className="intro-content">

                <div className="intro-logo">
                    TT
                </div>

                <div className="intro-brand">
                    <span>TOKYO</span>
                    <span>TRENDZ</span>
                </div>

                <div className="intro-divider">
                    <div className="intro-divider-fill"></div>
                </div>

                <p className="intro-tagline">
                    WEAR YOUR OWN TREND.
                </p>

            </div>

            <div className="intro-top-text">
                TOKYO / 2026
            </div>

            <div className="intro-bottom-text">
                STREETWEAR
            </div>

        </div>
    );
}

export default IntroLoader;