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
    // Initialize Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Registration form handling
    const registrationForm = document.getElementById('registration_form');
    const errorMessage = document.getElementById('error_message');

    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const birthDate = document.getElementById('birthDate').value;
        const attendCeremony = document.getElementById('attendCeremony').checked;
        const attendDinner = document.getElementById('attendDinner').checked;

        try {
            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Store additional user data in Firestore
            await db.collection('guests').doc(user.uid).set({
                firstName: firstName,
                lastName: lastName,
                birthDate: birthDate,
                attendCeremony: attendCeremony,
                attendDinner: attendDinner,
                email: email,
                registeredAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Close modal and show success message
            registration_modal.close();
            showNotification('Inscription réussie !', 'success');
            
        } catch (error) {
            console.error('Error:', error);
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
            'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
            'auth/invalid-email': 'Adresse email invalide.',
            'auth/operation-not-allowed': 'Opération non autorisée.',
            'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
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