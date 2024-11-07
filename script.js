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
    document.getElementById('showMoreBtn').addEventListener('click', function() {
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

    // إضافة وظيفة عرض جميع الصور
    const showAllItem = document.querySelector('.show-all-item');
    const hiddenItems = document.querySelectorAll('.portfolio-item.hidden');
    
    if (showAllItem) {
        showAllItem.addEventListener('click', function() {
            // إظهار جميع العناصر المخفية
            hiddenItems.forEach(item => {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 10);
            });
            
            // إخفاء زر Show All
            showAllItem.style.display = 'none';
        });
    }

    function createWorkElement(work) {
        // تحديد نوع نسبة العرض للصورة
        function getAspectRatio(width, height) {
            if (width === height) return 'square';
            if (width > height) return 'landscape';
            return 'portrait';
        }

        // إنشاء عنصر العمل
        const div = document.createElement('div');
        div.className = 'portfolio-item';
        
        // تحديد نسبة العرض بناءً على أبعاد الصورة
        const img = new Image();
        img.src = work.imageUrl;
        img.onload = function() {
            const aspect = getAspectRatio(this.width, this.height);
            div.setAttribute('data-aspect', aspect);
        };

        div.innerHTML = `
            <div class="portfolio-image-container">
                <img src="${work.imageUrl}" alt="${work.title}" class="work-image">
                <div class="portfolio-overlay">
                    <i class="fas fa-expand view-full"></i>
                </div>
            </div>
            <div class="work-info">
                <h3>${work.title}</h3>
                <p>
                    <i class="fas fa-folder"></i>
                    ${getCategoryName(work.category)}
                </p>
            </div>
        `;
        return div;
    }
});