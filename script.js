(function() {
    "use strict";

    // ========== SAFE DOM HELPER ==========
    function safeSet(id, value, type = 'text') {
        const element = document.getElementById(id);
        if (!element) return;
        if (type === 'html') {
            element.innerHTML = value;
        } else if (type === 'class') {
            element.className = value;
        } else {
            element.textContent = value;
        }
    }

    function safeQuery(selector, callback) {
        const element = document.querySelector(selector);
        if (element) callback(element);
    }

    // ========== LOADING SCREEN ==========
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingPercentage = document.getElementById('loadingPercentage');
    let configLoaded = false;
    let animationCompleted = false;
    
    function generateLoadingStars() {
        const starsContainer = document.getElementById('loadingStars');
        if (!starsContainer) return;
        
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'loading-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            star.style.width = (Math.random() * 3 + 1) + 'px';
            star.style.height = star.style.width;
            starsContainer.appendChild(star);
        }
    }
    
    generateLoadingStars();
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 100) {
            progress += Math.floor(Math.random() * 5) + 1;
            if (progress > 100) progress = 100;
            if (loadingPercentage) {
                loadingPercentage.textContent = progress + '%';
            }
        } else {
            clearInterval(progressInterval);
        }
    }, 80);
    
    function checkAndHideLoading() {
        if (configLoaded && animationCompleted) {
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                    loadingScreen.classList.add('finished');
                    setTimeout(() => {
                        if (loadingScreen) loadingScreen.style.display = 'none';
                    }, 800);
                }
                clearInterval(progressInterval);
            }, 300);
        }
    }
    
    setTimeout(() => {
        animationCompleted = true;
        if (loadingPercentage) loadingPercentage.textContent = '100%';
        checkAndHideLoading();
    }, 4000);

    // ========== CONFIGURATION ==========
    let CONFIG = null;
    let PORTAL_URLS = { rover: '#', stardome: '#' };

    async function loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) throw new Error('Config file not found');
            CONFIG = await response.json();
            applyConfig();
            configLoaded = true;
            checkAndHideLoading();
        } catch (error) {
            console.error('❌ Error loading config.json:', error);
            configLoaded = true;
            checkAndHideLoading();
            showErrorMessage('Please ensure config.json exists in the same directory');
        }
    }

    function showErrorMessage(msg) {
        const content = document.querySelector('.content');
        if (content) {
            content.innerHTML = `
                <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; color: #ff6b6b; text-align: center;">
                    <div>
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h2>Configuration Error</h2>
                        <p>${msg}</p>
                    </div>
                </div>
            `;
        }
    }

    function applyConfig() {
        if (!CONFIG) return;

        // Page Title
        if (CONFIG.club) {
            document.title = `${CONFIG.club.name || 'Astro CET'} | ${CONFIG.club.college || ''}`;
        }

        // Navigation
        safeSet('logo', `🌙 ${CONFIG.club?.fullName || 'Astro CET'}`);
        const navLinks = document.getElementById('navLinks');
        if (navLinks && CONFIG.navigation) {
            navLinks.innerHTML = CONFIG.navigation.map(item => 
                `<a href="${item.href}">${item.name}</a>`
            ).join('');
        }

        // Hero
        safeSet('heroTitle', CONFIG.hero?.title);
        safeSet('heroSubtitle', CONFIG.hero?.subtitle);
        safeSet('collegeName', CONFIG.club?.college);
        safeSet('heroButtonIcon', `fas ${CONFIG.hero?.buttonIcon || 'fa-star'}`, 'class');
        safeSet('heroButtonText', CONFIG.hero?.buttonText);
        safeSet('heroHint', `✦ established ${CONFIG.club?.established || 2019} ✦`, 'html');

        // About
        safeSet('aboutTitle', `About ${CONFIG.club?.fullName || 'Us'}`);
        safeSet('aboutHighlight', CONFIG.about?.description);
        safeSet('aboutFullText', CONFIG.about?.fullText);
        safeSet('visionTitle', CONFIG.about?.vision?.title);
        safeSet('visionText', CONFIG.about?.vision?.text);
        safeSet('missionTitle', CONFIG.about?.mission?.title);
        safeSet('missionText', CONFIG.about?.mission?.text);

        // Wings
        safeSet('wingsTitle', 'Cosmic Wings');
        
        if (CONFIG.wings?.rover) {
            safeSet('roverIcon', `fas ${CONFIG.wings.rover.icon}`, 'class');
            safeSet('roverEmoji', CONFIG.wings.rover.emoji);
            safeSet('roverName', CONFIG.wings.rover.name);
            safeSet('roverDesc', CONFIG.wings.rover.description);
            safeSet('roverEmojiLarge', CONFIG.wings.rover.emojiLarge);
            safeSet('roverHint', `<i class="fas fa-arrow-right"></i> ${CONFIG.wings.rover.hint}`, 'html');
            PORTAL_URLS.rover = CONFIG.wings.rover.url;
        }

        if (CONFIG.wings?.stardome) {
            safeSet('stardomeIcon', `fas ${CONFIG.wings.stardome.icon}`, 'class');
            safeSet('stardomeEmoji', CONFIG.wings.stardome.emoji);
            safeSet('stardomeName', CONFIG.wings.stardome.name);
            safeSet('stardomeDesc', CONFIG.wings.stardome.description);
            safeSet('stardomeEmojiLarge', CONFIG.wings.stardome.emojiLarge);
            safeSet('stardomeHint', `<i class="fas fa-arrow-right"></i> ${CONFIG.wings.stardome.hint}`, 'html');
            PORTAL_URLS.stardome = CONFIG.wings.stardome.url;
        }

        safeSet('wingsHint', '✨ click on any wing to explore ✨', 'html');

        // Events
        safeSet('eventsTitle', 'Past Events');
        const eventsGrid = document.getElementById('eventsGrid');
        if (eventsGrid && CONFIG.events) {
            eventsGrid.innerHTML = CONFIG.events.map(event => `
                <div class="event-card">
                    <div class="event-date">${event.date}</div>
                    <i class="fas ${event.icon}"></i>
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                </div>
            `).join('');
        }

        // Announcement
        if (CONFIG.announcement) {
            safeSet('announcementIcon', `fas ${CONFIG.announcement.icon}`, 'class');
            safeSet('announcementTitle', CONFIG.announcement.title);
            safeSet('announcementText', CONFIG.announcement.description);
        }

        // Gallery
        safeSet('galleryTitle', 'Cosmic Gallery');
        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid && CONFIG.gallery) {
            galleryGrid.innerHTML = CONFIG.gallery.map(item => `
                <div class="gallery-item">
                    <img src="${item.url}" alt="${item.alt}">
                </div>
            `).join('');
        }

        // Team
        safeSet('teamTitle', 'Stellar Crew');
        const teamGrid = document.getElementById('teamGrid');
        if (teamGrid && CONFIG.team) {
            teamGrid.innerHTML = CONFIG.team.map(member => `
                <div class="team-member">
                    <div class="avatar"><i class="fas ${member.icon}"></i></div>
                    <h4>${member.name}</h4>
                    <p>${member.role}</p>
                </div>
            `).join('');
        }

        // Contact
        safeSet('contactTitle', `Contact ${CONFIG.club?.fullName || 'Us'}`);
        
        const contactInfoCards = document.getElementById('contactInfoCards');
        if (contactInfoCards && CONFIG.contact?.info) {
            contactInfoCards.innerHTML = CONFIG.contact.info.map(info => `
                <div class="contact-card">
                    <div class="contact-card-icon"><i class="fas ${info.icon}"></i></div>
                    <div class="contact-card-content">
                        <h4>${info.title}</h4>
                        <p>${info.lines.join('<br>')}</p>
                    </div>
                    <div class="contact-card-glow"></div>
                </div>
            `).join('');
        }

        // Form
        if (CONFIG.contact?.form) {
            safeSet('formTitle', CONFIG.contact.form.title);
            safeSet('nameLabel', CONFIG.contact.form.nameLabel);
            safeSet('emailLabel', CONFIG.contact.form.emailLabel);
            safeSet('subjectLabel', CONFIG.contact.form.subjectLabel);
            safeSet('messageLabel', CONFIG.contact.form.messageLabel);
            safeSet('submitButtonText', CONFIG.contact.form.submitText);
            
            safeQuery('#name', el => el.placeholder = CONFIG.contact.form.namePlaceholder);
            safeQuery('#email', el => el.placeholder = CONFIG.contact.form.emailPlaceholder);
            safeQuery('#subject', el => el.placeholder = CONFIG.contact.form.subjectPlaceholder);
            safeQuery('#message', el => el.placeholder = CONFIG.contact.form.messagePlaceholder);
        }

        // Social
        safeSet('socialTitle', CONFIG.contact?.socialTitle);
        safeSet('socialSubtitle', CONFIG.contact?.socialSubtitle);
        
        const socialLinks = document.getElementById('socialLinks');
        if (socialLinks && CONFIG.contact?.social) {
            socialLinks.innerHTML = CONFIG.contact.social.map(social => `
                <a href="${social.url}" class="social-link" data-tooltip="${social.name}" target="_blank">
                    <i class="fab ${social.icon}"></i>
                    <span class="social-bg"></span>
                </a>
            `).join('');
        }

        // Footer
        safeSet('footerCopyright', CONFIG.footer?.copyright);
        safeSet('footerTagline', CONFIG.footer?.tagline, 'html');
    }

    // ========== CANVAS STARFIELD ==========
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let width, height;
    let stars = [];
    let shootingStars = [];
    const STAR_COUNT = 200;

    let mouseX = 0;
    let mouseY = 0;
    let mousePresent = false;

    function initStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random(),
                radius: Math.random() * 2.2 + 0.8,
                brightness: Math.random() * 0.5 + 0.5,
                speed: 0.02 + Math.random() * 0.03,
                color: Math.random() > 0.8 ? 'rgba(180, 220, 255, 1)' : 'rgba(255, 240, 200, 1)'
            });
        }
    }

    function resizeCanvas() {
        if (!canvas) return;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function drawNebula() {
        if (!ctx) return;
        
        const grad1 = ctx.createRadialGradient(width * 0.3, height * 0.4, 50, width * 0.5, height * 0.5, 800);
        grad1.addColorStop(0, 'rgba(80, 40, 140, 0.15)');
        grad1.addColorStop(0.7, 'rgba(10, 5, 30, 0.1)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);
        
        const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.2, 30, width * 0.7, height * 0.3, 600);
        grad2.addColorStop(0, 'rgba(0, 200, 255, 0.06)');
        grad2.addColorStop(1, 'transparent');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);
        
        const grad3 = ctx.createRadialGradient(width * 0.1, height * 0.8, 40, width * 0.3, height * 0.7, 500);
        grad3.addColorStop(0, 'rgba(168, 85, 247, 0.08)');
        grad3.addColorStop(1, 'transparent');
        ctx.fillStyle = grad3;
        ctx.fillRect(0, 0, width, height);
    }

    function drawStars() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        drawNebula();
        
        const scrollY = window.scrollY;
        const time = Date.now() * 0.002;
        
        stars.forEach(star => {
            let xPos = star.x * width;
            let yPos = star.y * height;
            
            const parallaxOffset = scrollY * 0.02 * star.speed;
            yPos = (yPos - parallaxOffset) % height;
            if (yPos < 0) yPos += height;
            
            const flicker = Math.sin(time + star.x * 10) * 0.2 + 0.8;
            let alpha = star.brightness * flicker;
            
            if (mousePresent) {
                const dx = mouseX - xPos;
                const dy = mouseY - yPos;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const glowDistance = 250;
                
                if (distance < glowDistance) {
                    const brightnessBoost = 1 + (1 - distance / glowDistance) * 4.0;
                    alpha = Math.min(alpha * brightnessBoost, 1);
                    
                    const extraTwinkle = Math.sin(time * 6 + star.x * 40) * 0.3;
                    alpha = Math.min(alpha + extraTwinkle, 1);
                    
                    const sizeBoost = 1 + (1 - distance / glowDistance) * 1.2;
                    ctx.shadowBlur = star.radius * 10 * sizeBoost;
                    ctx.shadowColor = '#a78bfa';
                } else {
                    ctx.shadowBlur = star.radius * 3;
                    ctx.shadowColor = '#b39ddb';
                }
            } else {
                ctx.shadowBlur = star.radius * 3;
                ctx.shadowColor = '#b39ddb';
            }
            
            ctx.beginPath();
            ctx.fillStyle = star.color.replace('1)', `${alpha})`);
            
            let starSize = star.radius * 0.7;
            if (mousePresent) {
                const dx = mouseX - xPos;
                const dy = mouseY - yPos;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 250) {
                    starSize *= 1 + (1 - distance / 250) * 0.8;
                }
            }
            
            ctx.arc(xPos, yPos, starSize, 0, Math.PI * 2);
            ctx.fill();
            
            if (star.radius > 1.8) {
                ctx.shadowBlur = 20;
                ctx.fillStyle = `rgba(220, 240, 255, ${alpha * 1.5})`;
                ctx.arc(xPos, yPos, star.radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        ctx.shadowBlur = 0;
    }

    function updateShootingStars() {
        if (Math.random() < 0.005 && shootingStars.length < 2) {
            shootingStars.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.3,
                len: 80 + Math.random() * 150,
                speed: 5 + Math.random() * 8,
                angle: -0.3 + Math.random() * 0.6,
                life: 1.0,
                width: 2 + Math.random() * 3
            });
        }
        
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed + 0.3;
            star.life -= 0.008;
            
            if (star.life <= 0.02 || star.x < -100 || star.x > width + 100 || star.y > height + 100) {
                shootingStars.splice(i, 1);
            }
        }
    }

    function drawShootingStars() {
        if (!ctx) return;
        shootingStars.forEach(star => {
            const alpha = star.life * 0.9;
            const gradient = ctx.createLinearGradient(star.x, star.y, star.x - Math.cos(star.angle) * star.len, star.y - Math.sin(star.angle) * star.len);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(200, 180, 255, ${alpha * 0.6})`);
            gradient.addColorStop(1, 'rgba(180, 140, 255, 0)');
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = star.width;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#a78bfa';
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - Math.cos(star.angle) * star.len, star.y - Math.sin(star.angle) * star.len);
            ctx.stroke();
        });
        ctx.shadowBlur = 0;
    }

    function animateStarfield() {
        if (ctx) {
            drawStars();
            updateShootingStars();
            drawShootingStars();
        }
        requestAnimationFrame(animateStarfield);
    }

    // ========== PAGE NAVIGATION ==========
    function triggerPortal(wingType) {
        if (PORTAL_URLS[wingType] && PORTAL_URLS[wingType] !== '#') {
            window.location.href = PORTAL_URLS[wingType];
        }
    }

    // ========== EVENT LISTENERS ==========
    function setupEventListeners() {
        const roverCard = document.getElementById('roverWingCard');
        const stardomeCard = document.getElementById('stardomeWingCard');
        const heroButton = document.getElementById('heroButton');
        
        if (roverCard) {
            roverCard.addEventListener('click', (e) => {
                e.preventDefault();
                triggerPortal('rover');
            });
        }
        
        if (stardomeCard) {
            stardomeCard.addEventListener('click', (e) => {
                e.preventDefault();
                triggerPortal('stardome');
            });
        }
        
        if (heroButton) {
            heroButton.addEventListener('click', () => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
            });
        }

        const formButton = document.querySelector('.submit-button');
        if (formButton) {
            formButton.addEventListener('click', (e) => {
                e.preventDefault();
                const inputs = document.querySelectorAll('.contact-form-enhanced input, .contact-form-enhanced textarea');
                const hasContent = Array.from(inputs).some(input => input.value.trim() !== '');
                
                if (hasContent) {
                    const originalHTML = formButton.innerHTML;
                    formButton.innerHTML = '<span>🚀 Signal Sent!</span><i class="fas fa-check"></i>';
                    setTimeout(() => { formButton.innerHTML = originalHTML; }, 2000);
                    inputs.forEach(input => input.value = '');
                }
            });
        }
    }

    // ========== SCROLL ANIMATIONS ==========
    function setupScrollAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.15 });
        fadeElements.forEach(el => observer.observe(el));
    }

    // ========== SMOOTH SCROLL ==========
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor || anchor.classList.contains('wing-card')) return;
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });

    // ========== MOUSE PARALLAX & STAR GLOW ==========
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mousePresent = true;
        
        const hero = document.querySelector('.hero');
        if (hero) {
            const moveX = (e.clientX / window.innerWidth - 0.5) * 12;
            const moveY = (e.clientY / window.innerHeight - 0.5) * 12;
            hero.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
        
        document.querySelectorAll('.wing-card').forEach((card) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 400) {
                const tiltX = dy / 15;
                const tiltY = -dx / 15;
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02) translateY(-10px)`;
            } else {
                card.style.transform = '';
            }
        });
    });

    document.addEventListener('mouseleave', () => {
        mousePresent = false;
        
        const hero = document.querySelector('.hero');
        if (hero) hero.style.transform = '';
        
        document.querySelectorAll('.wing-card').forEach(card => {
            card.style.transform = '';
        });
    });

    // ========== INITIALIZATION ==========
    async function init() {
        if (canvas) {
            resizeCanvas();
            initStars();
            animateStarfield();
        }
        
        await loadConfig();
        setupEventListeners();
        setupScrollAnimations();
        
        setTimeout(() => {
            const fadeElements = document.querySelectorAll('.fade-in');
            fadeElements.forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
                    el.classList.add('visible');
                }
            });
        }, 100);
    }

    window.addEventListener('resize', () => {
        if (canvas) {
            resizeCanvas();
            initStars();
        }
    });

    init();

    console.log('🌟 Astro CET - Loading complete!');
})();