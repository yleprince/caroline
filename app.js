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

// Firebase Authentication and Database
document.addEventListener('DOMContentLoaded', function() {
    let confirmationResult = null;
    const auth = window.auth;
    const db = window.db;
    const RecaptchaVerifier = window.RecaptchaVerifier;
    const signInWithPhoneNumber = window.signInWithPhoneNumber;

    // Get DOM elements
    const registrationForm = document.getElementById('registration_form');
    const phonePrefix = document.getElementById('phonePrefix');
    const phoneNumber = document.getElementById('phoneNumber');
    const verificationSection = document.getElementById('verification-section');
    const userInfoSection = document.getElementById('user-info-section');
    const verificationCode = document.getElementById('verificationCode');
    const sendCodeBtn = document.getElementById('sendCode');
    const verifyCodeBtn = document.getElementById('verifyCode');
    const submitFormBtn = document.getElementById('submitForm');
    const errorMessage = document.getElementById('error_message');

    // Initialize reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
            sendCodeBtn.disabled = false;
        },
        'expired-callback': () => {
            sendCodeBtn.disabled = true;
            errorMessage.textContent = 'Le CAPTCHA a expiré. Veuillez réessayer.';
            errorMessage.classList.remove('hidden');
        }
    });

    // Send verification code
    sendCodeBtn.addEventListener('click', async () => {
        const fullPhoneNumber = `${phonePrefix.value}${phoneNumber.value.replace(/\s/g, '')}`;
        
        try {
            confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
            
            // Show verification code input
            verificationSection.classList.remove('hidden');
            verifyCodeBtn.classList.remove('hidden');
            sendCodeBtn.classList.add('hidden');
            
            // Hide error message if shown
            errorMessage.classList.add('hidden');
        } catch (error) {
            console.error('Error sending code:', error);
            errorMessage.textContent = getErrorMessage(error.code);
            errorMessage.classList.remove('hidden');
        }
    });

    // Verify code
    verifyCodeBtn.addEventListener('click', async () => {
        const code = verificationCode.value;
        
        try {
            const result = await confirmationResult.confirm(code);
            
            // Show user info form
            userInfoSection.classList.remove('hidden');
            submitFormBtn.classList.remove('hidden');
            verifyCodeBtn.classList.add('hidden');
            
            // Hide error message if shown
            errorMessage.classList.add('hidden');
        } catch (error) {
            console.error('Error verifying code:', error);
            errorMessage.textContent = getErrorMessage(error.code);
            errorMessage.classList.remove('hidden');
        }
    });

    // Handle form submission
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!auth.currentUser) {
            errorMessage.textContent = 'Veuillez d\'abord vérifier votre numéro de téléphone.';
            errorMessage.classList.remove('hidden');
            return;
        }

        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            birthDate: document.getElementById('birthDate').value,
            attendCeremony: document.getElementById('attendCeremony').checked,
            attendDinner: document.getElementById('attendDinner').checked,
            phoneNumber: `${phonePrefix.value}${phoneNumber.value.replace(/\s/g, '')}`,
            registeredAt: new Date(),
        };

        try {
            // Store user data in Firestore
            await db.collection('guests').doc(auth.currentUser.uid).set(userData);
            
            // Close modal and show success message
            registration_modal.close();
            showNotification('Inscription réussie !', 'success');
            
        } catch (error) {
            console.error('Error saving user data:', error);
            errorMessage.textContent = getErrorMessage(error.code);
            errorMessage.classList.remove('hidden');
        }
    });

    // Helper function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} fixed top-4 right-4 z-50 max-w-sm`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Helper function to get error messages in French
    function getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/invalid-phone-number': 'Numéro de téléphone invalide.',
            'auth/code-expired': 'Le code de vérification a expiré.',
            'auth/invalid-verification-code': 'Code de vérification invalide.',
            'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
            'auth/quota-exceeded': 'Quota dépassé. Veuillez réessayer plus tard.',
            'default': 'Une erreur est survenue. Veuillez réessayer.'
        };
        return errorMessages[errorCode] || errorMessages.default;
    }
});

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