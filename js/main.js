document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check local storage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (!prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    const updateThemeIcon = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        themeToggles.forEach(toggle => {
            toggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
            toggle.setAttribute('aria-label', `Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`);
        });
    };
    updateThemeIcon();

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            let targetTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            if (targetTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
            updateThemeIcon();
        });
    });

    // 2. Nav Scroll Behavior & 12. Back to Top Button
    const navbar = document.querySelector('.navbar');
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            if(navbar) navbar.classList.add('scrolled');
        } else {
            if(navbar) navbar.classList.remove('scrolled');
        }

        if (window.scrollY > 400) {
            if(backToTop) backToTop.classList.add('visible');
        } else {
            if(backToTop) backToTop.classList.remove('visible');
        }
    });

    // 3. Active Nav Link (Intersection Observer)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a:not(.btn-resume)');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-30% 0px -70% 0px' });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // 4. Mobile Overlay Menu
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const overlayLinks = document.querySelectorAll('.mobile-overlay .nav-links a');
    
    if (mobileToggle && mobileOverlay) {
        mobileToggle.addEventListener('click', () => {
            mobileOverlay.classList.toggle('open');
            mobileToggle.textContent = mobileOverlay.classList.contains('open') ? '✕' : '☰';
        });

        overlayLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileOverlay.classList.remove('open');
                mobileToggle.textContent = '☰';
            });
        });
    }

    // 5. Hero Stagger Animation & 6. Scroll Reveal
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        // Hero Stagger
        const staggerElements = document.querySelectorAll('.stagger-in');
        staggerElements.forEach((el, index) => {
            el.style.transition = `opacity 0.6s ease ${index * 120}ms, transform 0.6s ease ${index * 120}ms`;
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100);
        });

        // Scroll Reveal
        const revealElements = document.querySelectorAll('.reveal-up');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 7. Counter Animation
    const counters = document.querySelectorAll('.stat-num[data-target]');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !prefersReducedMotion) {
                const targetEl = entry.target;
                const target = parseInt(targetEl.getAttribute('data-target'));
                const suffix = targetEl.getAttribute('data-suffix') || '';
                
                let start = 0;
                const duration = 1200; // 1.2s
                const startTime = performance.now();
                
                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Ease out quad
                    const easeOut = progress * (2 - progress);
                    const current = Math.floor(easeOut * target);
                    
                    targetEl.textContent = current + suffix;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        targetEl.textContent = target + suffix;
                    }
                };
                
                requestAnimationFrame(updateCounter);
                observer.unobserve(targetEl);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));

    // 8. Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.accordion-icon');
            const isOpen = content.style.maxHeight;

            // Close all others
            document.querySelectorAll('.accordion-content').forEach(c => {
                c.style.maxHeight = null;
                c.previousElementSibling.querySelector('.accordion-icon').textContent = '[+]';
                c.previousElementSibling.setAttribute('aria-expanded', 'false');
            });

            // Toggle current
            if (!isOpen) {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.textContent = '[-]';
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // 9. Project Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.classList.remove('hide');
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.classList.add('hide');
                    }, 400); // match CSS transition duration
                }
            });
        });
    });

    // 10. Click to copy email
    const copyEmailTrigger = document.querySelector('.copy-email');
    if (copyEmailTrigger) {
        copyEmailTrigger.addEventListener('click', () => {
            const email = copyEmailTrigger.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                const tooltip = copyEmailTrigger.querySelector('.copy-tooltip');
                tooltip.textContent = 'Copied!';
                tooltip.classList.add('show');
                
                setTimeout(() => {
                    tooltip.classList.remove('show');
                    setTimeout(() => {
                        tooltip.textContent = 'Click to copy';
                    }, 200);
                }, 2000);
            });
        });
    }

    // 11. Contact Form Validation
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const msgInput = document.getElementById('message');
            
            // Name
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Name is required');
                isValid = false;
            } else {
                clearError(nameInput);
            }
            
            // Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Email is required');
                isValid = false;
            } else if (!emailRegex.test(emailInput.value.trim())) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError(emailInput);
            }
            
            // Message
            if (msgInput.value.trim().length < 20) {
                showError(msgInput, 'Message must be at least 20 characters');
                isValid = false;
            } else {
                clearError(msgInput);
            }
            
            if (isValid) {
                // Submit logic would go here. For now, alert success.
                const btn = form.querySelector('.btn-submit');
                const origText = btn.textContent;
                btn.textContent = 'Sending...';
                
                setTimeout(() => {
                    btn.textContent = 'Message Sent!';
                    btn.style.backgroundColor = 'var(--accent-green)';
                    form.reset();
                    
                    setTimeout(() => {
                        btn.textContent = origText;
                        btn.style.backgroundColor = 'var(--accent)';
                    }, 3000);
                }, 1000);
            }
        });
    }
    
    function showError(input, message) {
        const group = input.closest('.form-group');
        group.classList.add('has-error');
        group.querySelector('.form-error').textContent = message;
    }
    
    function clearError(input) {
        const group = input.closest('.form-group');
        group.classList.remove('has-error');
    }
});
