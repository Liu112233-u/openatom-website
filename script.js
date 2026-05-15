/**
 * 开放原子开源社团官网 - 脚本
 * 2026 Edition
 */

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initParticles();
    initStatCounters();
    initScrollReveal();
    initJoinForm();
});

/* =====================
   导航栏
   ===================== */
function initNav() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // 滚动变色
    const onScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 移动端菜单
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // 点击链接后关闭菜单
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // 滚动时高亮当前菜单项
    const sections = document.querySelectorAll('section[id]');
    const navLinks = navMenu.querySelectorAll('a[href^="#"]');

    const highlightNav = () => {
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', highlightNav, { passive: true });
}

/* =====================
   粒子背景
   ===================== */
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    const resize = () => {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    };

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() > 0.5 ? 187 : 270; // cyan or purple
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
            ctx.fill();
        }
    }

    const createParticles = () => {
        particles = [];
        const count = Math.min(Math.floor((w * h) / 8000), 120);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };

    let mouseX = -1000, mouseY = -1000;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }, { passive: true });

    canvas.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    const drawLines = () => {
        const maxDist = 150;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            // 鼠标连线
            if (mouseX > 0) {
                const dx = particles[i].x - mouseX;
                const dy = particles[i].y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist / 120) * 0.2})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    };

    let animId;
    const animate = () => {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        animId = requestAnimationFrame(animate);
    };

    const debouncedResize = debounce(() => {
        resize();
        createParticles();
    }, 250);

    resize();
    createParticles();
    animate();

    window.addEventListener('resize', debouncedResize, { passive: true });

    // 页面不可见时暂停动画
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            animate();
        }
    });
}

/* =====================
   数字动画计数器
   ===================== */
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-num[data-target]');
    if (stats.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                animateCount(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateCount(el, target) {
    const duration = 2000;
    const start = performance.now();
    const formatted = formatNumber(target);

    const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(eased * target);
        el.textContent = formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = formatted;
        }
    };

    requestAnimationFrame(update);
}

function formatNumber(num) {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + '千万';
    if (num >= 10000) return (num / 10000).toFixed(0) + '万+';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    return num.toLocaleString('zh-CN');
}

/* =====================
   滚动显示动画
   ===================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.about-card, .project-card, .activity-card, .news-card, .partner-item, .timeline-item, .section-header, .join-info, .join-form-wrapper');
    reveals.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach((el, i) => {
        // 交错动画
        const parent = el.parentElement;
        const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'));
        const siblingIndex = siblings.indexOf(el);
        el.style.transitionDelay = `${siblingIndex * 80}ms`;
        observer.observe(el);
    });
}

/* =====================
   加入我们表单
   ===================== */
function initJoinForm() {
    const form = document.getElementById('joinForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>提交中...</span>';
        submitBtn.disabled = true;

        // 模拟提交（实际项目中这里应该发送到后端）
        await new Promise(resolve => setTimeout(resolve, 1200));

        form.style.display = 'none';
        success.style.display = 'block';
        success.style.animation = 'fadeInUp 0.5s ease forwards';

        // 自动重置（可选）
        // setTimeout(() => { form.reset(); form.style.display = ''; success.style.display = 'none'; }, 5000);
    });

    // 输入验证提示
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            if (input.validity.valid) {
                input.parentElement.classList.add('valid');
                input.parentElement.classList.remove('invalid');
            } else if (input.value) {
                input.parentElement.classList.add('invalid');
                input.parentElement.classList.remove('valid');
            } else {
                input.parentElement.classList.remove('valid', 'invalid');
            }
        });
    });
}

/* =====================
   工具函数
   ===================== */
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// CSS 动画
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.nav-menu a.active {
    color: var(--primary) !important;
}
`;
document.head.appendChild(styleSheet);

/* =====================
   键盘快捷键
   ===================== */
document.addEventListener('keydown', (e) => {
    // Esc 关闭移动端菜单
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // G 键滚动到顶部
    if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        document.activeElement.tagName !== 'SELECT') {
        // 小写 g
    }
});

console.log('%c⚛️ 开放原子开源社团', 'font-size: 20px; font-weight: bold; color: #00D4FF;');
console.log('%c推动全球开源事业发展 · 2026', 'font-size: 12px; color: #888;');
