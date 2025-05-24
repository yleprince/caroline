// Confetti animation
const end = Date.now() + 3 * 1000;
const colors = ["fcb700", "ff637d", "fff"];

(function frame() {
    confetti({
        particleCount: 2,
        angle: 60,
        spread: 3,
        origin: { x: 0 },
        colors: colors,
        shapes: ["heart"],
        scalar: 2,
    });

    confetti({
        particleCount: 2,
        angle: 120,
        spread: 3,
        origin: { x: 1 },
        colors: colors,
        shapes: ["heart"],
        scalar: 2,
    });

    if (Date.now() < end) {
        requestAnimationFrame(frame);
    }
})();

// Smooth scrolling functionality
document.addEventListener('DOMContentLoaded', function() {
    const scrollButtons = document.querySelectorAll('.scroll-button');
    const sections = document.querySelectorAll('.section');
    let isScrolling = false;
    let lastScrollTime = Date.now();
    let scrollTimeout;
    
    // Button click handling
    scrollButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                isScrolling = true;
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        });
    });

    // Detect scroll speed and direction
    let lastScrollY = window.scrollY;
    let scrollDirection = 0;
    let scrollSpeed = 0;

    function updateScrollMetrics() {
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        const timeDelta = currentTime - lastScrollTime;
        
        scrollSpeed = Math.abs(currentScrollY - lastScrollY) / timeDelta;
        scrollDirection = Math.sign(currentScrollY - lastScrollY);
        
        lastScrollY = currentScrollY;
        lastScrollTime = currentTime;
    }

    // Smooth scroll handling
    document.addEventListener('scroll', () => {
        if (isScrolling) return;
        
        updateScrollMetrics();
        
        // Clear existing timeout
        clearTimeout(scrollTimeout);
        
        // Only snap if scrolling is slow or stopped
        if (scrollSpeed < 0.5) {
            scrollTimeout = setTimeout(() => {
                const windowHeight = window.innerHeight;
                const scrollPosition = window.scrollY;
                const rawIndex = scrollPosition / windowHeight;
                const sectionIndex = Math.round(rawIndex);
                
                // Only snap if we're not already mostly aligned
                if (Math.abs(rawIndex - sectionIndex) > 0.1) {
                    isScrolling = true;
                    sections[sectionIndex]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    setTimeout(() => {
                        isScrolling = false;
                    }, 1000);
                }
            }, 150); // Increased delay before snapping
        }
    }, { passive: true });

    // Intersection Observer for section visibility
    const observer = new IntersectionObserver((entries) => {
        if (isScrolling || scrollSpeed > 0.5) return;

        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.75) {
                const currentTime = Date.now();
                if (currentTime - lastScrollTime > 150) {
                    entry.target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    lastScrollTime = currentTime;
                }
            }
        });
    }, {
        threshold: 0.75
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}); 