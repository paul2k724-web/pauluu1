
document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initScrollAnimations();
    initNavbar();
    initCounterAnimation();
    initProgressBars();
    initTiltEffect();
    initContactForm();
    initSmoothScroll();

    // Dynamic Content Loading
    loadContent();
});

async function loadContent() {
    // Load content independently with caching for instant load
    const contentTasks = [
        fetchAndRender('content/skills.json', renderSkills, 'skills_cache_v1'),
        fetchAndRender('content/timeline.json', renderTimeline, 'timeline_cache_v1'),
        fetchAndRender('content/projects.json', renderProjects, 'projects_cache_v1'),
        fetchAndRender('content/certificates.json', renderCertificates, 'certs_cache_v1')
    ];
}

async function fetchAndRender(url, renderCallback, cacheKey) {
    // 1. Cache Strategy: Render immediately if available
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const data = JSON.parse(cached);
            if (Array.isArray(data)) {
                renderCallback(data);
                refreshAnimations();
            }
        } catch (e) {
            console.warn('Cache error:', e);
        }
    }

    // 2. Network Strategy: Fetch fresh data, render, and update cache
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Render fresh data
        renderCallback(data.items);
        refreshAnimations();

        // Update cache
        localStorage.setItem(cacheKey, JSON.stringify(data.items));
    } catch (e) {
        console.warn(`Failed to load ${url}`, e);
    }
}

function refreshAnimations() {
    // Re-init animations for newly added content
    requestAnimationFrame(() => {
        initScrollAnimations();
        initTiltEffect();
        initProgressBars();
    });
}

function renderSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    container.innerHTML = skills.map(skill => `
        <div class="skill-card glass-card animate-on-scroll" data-category="${skill.category_id || 'general'}">
            <div class="skill-glow"></div>
            <div class="skill-icon">
                <i class="${skill.icon || 'fas fa-code'}"></i>
            </div>
            <h3 class="skill-title">${skill.title}</h3>
            <p class="skill-description">${skill.description}</p>
            <ul class="skill-list">
                ${(skill.list_items || []).map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}
            </ul>
            <div class="skill-progress">
                <div class="progress-bar" data-progress="${skill.progress || 0}"></div>
                <span class="progress-label">${skill.progress || 0}% Complete</span>
            </div>
        </div>
    `).join('');
}

function renderTimeline(events) {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const line = '<div class="timeline-line"></div>';
    const items = events.map(event => `
        <div class="timeline-item animate-on-scroll" data-side="${event.side || 'left'}">
            <div class="timeline-dot ${event.status_class === 'current' ? 'active' : ''} ${event.status_class === 'future' ? 'future' : ''}"></div>
            <div class="timeline-content glass-card ${event.status_class || ''}">
                <span class="timeline-date">${event.date_label}</span>
                <h3 class="timeline-title">${event.title}</h3>
                <p class="timeline-description">${event.description}</p>
                <div class="timeline-tags">
                    ${(event.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = line + items;
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = projects.map(project => `
        <div class="project-card glass-card animate-on-scroll" data-tilt>
            <div class="project-image">
                ${project.image ?
            `<img src="${project.image}" alt="${project.title}" class="project-img-content">` :
            `<div class="project-placeholder">
                        <i class="${project.icon_class || 'fas fa-laptop-code'}"></i>
                    </div>`
        }
                <div class="project-overlay">
                    ${project.live_link ? `<a href="${project.live_link}" class="project-link"><i class="fas fa-external-link-alt"></i></a>` : ''}
                    ${project.github_link ? `<a href="${project.github_link}" class="project-link"><i class="fab fa-github"></i></a>` : ''}
                </div>
            </div>
            <div class="project-content">
                <span class="project-category">${project.category}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-learned">
                    <h4>What I Learned:</h4>
                    <ul>
                        ${(project.learnings || []).map(learn => `<li>${learn}</li>`).join('')}
                    </ul>
                </div>
                <div class="project-tech">
                    ${(project.tech_stack || []).map(tech => `<span>${tech}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function renderCertificates(certs) {
    const container = document.getElementById('certificates-container');
    if (!container) return;

    container.innerHTML = certs.map(cert => {
        let badgeClass = 'planned'; // Default
        if (cert.status === 'In Progress') badgeClass = 'in-progress';
        if (cert.status === 'Upcoming') badgeClass = 'upcoming';

        return `
        <div class="cert-card glass-card animate-on-scroll">
            <div class="cert-badge ${badgeClass}">
                <span>${cert.status}</span>
            </div>
            <div class="cert-icon">
                ${cert.image ?
                `<img src="${cert.image}" alt="${cert.title}" class="cert-image">` :
                `<i class="${cert.icon || 'fas fa-certificate'}"></i>`
            }
            </div>
            <h3 class="cert-title">${cert.title}</h3>
            ${cert.certificate_link ? `<a href="${cert.certificate_link}" target="_blank" class="cert-link">View Certificate <i class="fas fa-external-link-alt"></i></a>` : ''}
            <p class="cert-description">${cert.description}</p>
            <div class="cert-progress">
                <div class="cert-progress-bar" style="--progress: ${cert.progress || 0}%"></div>
                <span>${cert.progress || 0}% Prepared</span>
            </div>
            <div class="cert-topics">
                ${(cert.topics || []).map(topic => `<span>${topic}</span>`).join('')}
            </div>
        </div>
    `}).join('');
}

function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 4 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;

    const colors = ['#00f0ff', '#7b2dff', '#ff00ea', '#00ff88'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        opacity: ${Math.random() * 0.5 + 0.2};
        box-shadow: 0 0 ${size * 2}px ${color};
        animation: particleFloat ${duration}s ease-in-out ${delay}s infinite;
        pointer-events: none;
    `;

    container.appendChild(particle);
}

const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes particleFloat {
        0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
        }
        25% {
            transform: translateY(-30px) translateX(20px) scale(1.1);
            opacity: 0.6;
        }
        50% {
            transform: translateY(-50px) translateX(-10px) scale(0.9);
            opacity: 0.4;
        }
        75% {
            transform: translateY(-20px) translateX(-30px) scale(1.05);
            opacity: 0.5;
        }
    }
`;
document.head.appendChild(particleStyles);

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                const progressBars = entry.target.querySelectorAll('.progress-bar');
                progressBars.forEach(bar => {
                    const progress = bar.getAttribute('data-progress');
                    bar.style.setProperty('--progress', progress + '%');
                });
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.getAttribute('data-count'));
                animateCounter(target, countTo);
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const progress = bar.getAttribute('data-progress');
                setTimeout(() => {
                    bar.style.setProperty('--width', progress + '%');
                }, 300);
            }
        });
    }, observerOptions);

    progressBars.forEach(bar => observer.observe(bar));
}

function initTiltEffect() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            let isValid = true;

            if (name.trim().length < 2) {
                showError('name', 'Please enter a valid name');
                isValid = false;
            } else {
                clearError('name');
            }

            if (!isValidEmail(email)) {
                showError('email', 'Please enter a valid email');
                isValid = false;
            } else {
                clearError('email');
            }

            if (subject.trim().length < 3) {
                showError('subject', 'Please enter a subject');
                isValid = false;
            } else {
                clearError('subject');
            }

            if (message.trim().length < 10) {
                showError('message', 'Please enter a longer message');
                isValid = false;
            } else {
                clearError('message');
            }

            if (isValid) {
                const button = form.querySelector('.btn-submit');
                const originalText = button.querySelector('.btn-text').textContent;
                button.querySelector('.btn-text').textContent = 'Sending...';
                button.disabled = true;

                // Send to FormSubmit.co
                const formData = new FormData(form);

                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                    .then(response => {
                        if (response.ok) {
                            button.querySelector('.btn-text').textContent = 'Message Sent!';
                            button.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)';
                            form.reset();

                            setTimeout(() => {
                                button.querySelector('.btn-text').textContent = originalText;
                                button.style.background = '';
                                button.disabled = false;
                            }, 3000);
                        } else {
                            throw new Error('Form submission failed');
                        }
                    })
                    .catch(error => {
                        button.querySelector('.btn-text').textContent = 'Error! Try again.';
                        button.style.background = 'var(--error-color, #ff4757)';
                        console.error('Submission error:', error);

                        setTimeout(() => {
                            button.querySelector('.btn-text').textContent = originalText;
                            button.style.background = '';
                            button.disabled = false;
                        }, 3000);
                    });
            }
        });
    }
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.parentElement;

    let errorEl = formGroup.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.style.cssText = 'color: #ff4757; font-size: 0.8rem; margin-top: 0.5rem; display: block;';
        formGroup.appendChild(errorEl);
    }
    errorEl.textContent = message;
    field.style.borderColor = '#ff4757';
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.parentElement;
    const errorEl = formGroup.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
    field.style.borderColor = '';
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

const glowElements = document.querySelectorAll('.skill-card, .project-card, .cert-card');
glowElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mouse-x', x + '%');
        el.style.setProperty('--mouse-y', y + '%');
    });
});

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.shape');

    parallaxElements.forEach((el, index) => {
        const speed = (index + 1) * 0.1;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

console.log('%c Welcome to my Portfolio! ', 'background: linear-gradient(135deg, #00f0ff, #7b2dff); color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%c Built with passion and curiosity ', 'color: #00f0ff; font-size: 12px;');
/* ---------- About profile upload + preview (append to script.js) ---------- */
