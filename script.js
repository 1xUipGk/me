document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    let autoSlideInterval;

    function showCards(index) {
        testimonialCards.forEach((card, i) => {
            card.style.animation = 'none';
            card.offsetHeight;
            
            if (window.innerWidth > 1200) {
                if (i >= index && i < index + 3) {
                    card.style.display = 'block';
                    card.style.animation = `fadeIn 0.5s ease forwards ${(i - index) * 0.1}s`;
                } else {
                    card.style.display = 'none';
                }
            } else if (window.innerWidth > 768) {
                if (i >= index && i < index + 2) {
                    card.style.display = 'block';
                    card.style.animation = `fadeIn 0.5s ease forwards ${(i - index) * 0.1}s`;
                } else {
                    card.style.display = 'none';
                }
            } else {
                card.style.display = i === index ? 'block' : 'none';
                if (i === index) {
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                }
            }
        });
    }

    function nextSlide() {
        const maxIndex = testimonialCards.length - (window.innerWidth > 1200 ? 3 : window.innerWidth > 768 ? 2 : 1);
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        showCards(currentIndex);
    }

    function prevSlide() {
        const maxIndex = testimonialCards.length - (window.innerWidth > 1200 ? 3 : window.innerWidth > 768 ? 2 : 1);
        currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
        showCards(currentIndex);
    }

    // تشغيل التحريك التلقائي
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); // تغيير كل 5 ثواني
    }

    // إيقاف التحريك التلقائي
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // إضافة مستمعي الأحداث للأزرار
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoSlide();
        startAutoSlide(); // إعادة تشغيل العد التنازلي
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoSlide();
        startAutoSlide(); // إعادة تشغيل العد التنازلي
    });

    // إيقاف التحريك التلقائي عند تحويم المؤشر على البطاقات
    document.querySelector('.testimonials-slider').addEventListener('mouseenter', stopAutoSlide);
    document.querySelector('.testimonials-slider').addEventListener('mouseleave', startAutoSlide);

    // تحديث العرض عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        showCards(currentIndex);
    });

    // بدء العرض التلقائي
    showCards(0);
    startAutoSlide();

    // تفعيل زر عرض المزيد
    const showMoreBtn = document.getElementById('showMoreBtn');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            const hiddenServices = document.querySelectorAll('.hidden-service');
            const btnText = this.querySelector('span');
            const btnIcon = this.querySelector('i');
            
            hiddenServices.forEach(service => {
                if (service.style.display === 'none' || !service.style.display) {
                    service.style.display = 'block';
                    service.style.opacity = '0';
                    setTimeout(() => {
                        service.style.opacity = '1';
                        service.style.transform = 'translateY(0)';
                    }, 10);
                    btnText.textContent = 'عرض أقل';
                    btnIcon.style.transform = 'rotate(180deg)';
                } else {
                    service.style.opacity = '0';
                    service.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        service.style.display = 'none';
                    }, 300);
                    btnText.textContent = 'عرض المزيد';
                    btnIcon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    // تحديث كود التصفية لصفحة الأعمال
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioSections = document.querySelectorAll('.portfolio-section');

    // إضافة مستمع أحداث لكل زر
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // منع السلوك الافتراضي للرابط
            
            // إزالة الفئة النشطة من جميع الأزرار
            filterBtns.forEach(b => b.classList.remove('active'));
            // إضافة الفئة النشطة للزر المحدد
            btn.classList.add('active');

            // الحصول على معرف القسم المستهدف
            const targetId = btn.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            // التمرير إلى القسم المستهدف
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // التمرير إلى القسم المحدد عند تحميل الصفحة
    if (window.location.hash) {
        const targetSection = document.querySelector(window.location.hash);
        const targetBtn = document.querySelector(`[href="${window.location.hash}"]`);
        
        if (targetSection && targetBtn) {
            setTimeout(() => {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // تفعيل الزر المناسب
                filterBtns.forEach(b => b.classList.remove('active'));
                targetBtn.classList.add('active');
            }, 100);
        }
    }

    // التحكم في القائمة الجانبية
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const overlay = document.getElementById('overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    // فتح القائمة الجانبية
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            console.log('Menu button clicked'); // للتأكد من عمل الزر
            if (sidebar && overlay) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // إغلاق القائمة الجانبية
    function closeSidebar() {
        console.log('Closing sidebar'); // للتأكد من عمل الإغلاق
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // إغلاق عند النقر على زر الإغلاق
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            closeSidebar();
        });
    }

    // إغلاق عند النقر على الخلفية المعتمة
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeSidebar();
        });
    }

    // إغلاق عند النقر على أي رابط في القائمة
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeSidebar();
        });
    });

    // إغلاق عند الضغط على ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
});