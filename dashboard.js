import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { getDatabase, ref as dbRef, push, set, onValue, remove, get } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import firebaseConfig from './firebase-config.js';
import Analytics from './analytics.js';
import { Chart } from 'https://cdn.jsdelivr.net/npm/chart.js/+esm';

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getDatabase(app);
const IMGUR_CLIENT_ID = '25775838e772fa2';

// التحقق من حالة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'admin.html';
    } else {
        loadWorks();
        loadTestimonials();
    }
});

// دالة تسجيل لخروج
window.logout = () => {
    signOut(auth).then(() => {
        window.location.href = 'admin.html';
    });
};

// دالة تحويل الصورة إلى Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// دالة رفع الصور إلى Imgur
async function uploadToImgur(base64Image) {
    const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: base64Image.split(',')[1],
            type: 'base64'
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error('فشل رفع الصورة إلى Imgur');
    }

    return data;
}

// دالة إظهار الرسائل
function showMessage(type, text) {
    const messageElement = document.getElementById(`${type}Message`);
    if (!messageElement) return;

    messageElement.style.display = 'flex';
    messageElement.querySelector('span').textContent = text;
    messageElement.classList.add('show');

    // إخفاء الرسالة بعد 3 ثواني
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 300);
    }, 3000);
}

// الحصول على اسم القسم
function getCategoryName(category) {
    const categories = {
        'social-media': 'سوشيال ميديا',
        'print': 'فلايرات وبروشورات',
        'roll-up': 'رول أب ولافتات',
        'menu': 'قوائم طعام',
        'business-cards': 'بطاقات شخصية',
        'book-covers': 'أغلفة كتب',
        'invitations': 'بطاقات دعوة',
        'certificates': 'شهادات تقديرية',
        'advertising': 'لوحات إعلانية'
    };
    return categories[category] || category;
}

// دالة تحميل الأعمال
function loadWorks(category = 'all') {
    const worksList = document.getElementById('worksList');
    
    // إظهار حالة التحميل
    worksList.innerHTML = `
        <div class="skeleton-loader skeleton-work">
            <div class="skeleton-image"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-category"></div>
        </div>
        <div class="skeleton-loader skeleton-work">
            <div class="skeleton-image"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-category"></div>
        </div>
        <div class="skeleton-loader skeleton-work">
            <div class="skeleton-image"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-category"></div>
        </div>
    `;

    const worksRef = dbRef(db, 'works');
    
    onValue(worksRef, (snapshot) => {
        worksList.innerHTML = '';
        
        if (snapshot.exists()) {
            let works = [];
            snapshot.forEach((childSnapshot) => {
                works.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // ترتيب الأعمال حسب التاريخ
            works.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            // تصفية الأعمال حسب القسم
            if (category !== 'all') {
                works = works.filter(work => work.category === category);
            }

            if (works.length > 0) {
                works.forEach(work => {
                    const workElement = createWorkElement(work, work.id);
                    worksList.appendChild(workElement);
                });
            } else {
                worksList.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-folder-open"></i>
                        <p>${category === 'all' ? 'لا توجد أعمال حالياً' : 'لا توجد أعمال في هذا القسم'}</p>
                    </div>
                `;
            }
        } else {
            worksList.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-folder-open"></i>
                    <p>لا توجد أعمال حالياً</p>
                </div>
            `;
        }
    });
}

// إنشاء عنصر العمل
function createWorkElement(work, workId) {
    const div = document.createElement('div');
    div.className = 'work-item';
    div.dataset.id = workId;
    div.dataset.category = work.category;
    div.innerHTML = `
        <div class="work-image-container" onclick="openLightbox('${workId}')">
            <img src="${work.imageUrl}" 
                 alt="${work.title}" 
                 class="work-image"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="fallback-image" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#989b9f">
                    <path d="m22.019 16.82-3.13-7.32c-.57-1.34-1.42-2.1-2.39-2.15-.96-.05-1.89.62-2.6 1.9l-1.9 3.41c-.4.72-.97 1.15-1.59 1.2-.63.06-1.26-.27-1.77-.92l-.22-.28c-.71-.89-1.59-1.32-2.49-1.23-.9.09-1.67.71-2.18 1.72l-1.73 3.45c-.62 1.25-.56 2.7.17 3.88.73 1.18 2 1.89 3.39 1.89h12.76c1.34 0 2.59-.67 3.33-1.79.76-1.12.88-2.53.35-3.76ZM6.97 8.381a3.38 3.38 0 1 0 0-6.76 3.38 3.38 0 0 0 0 6.76Z"/>
                </svg>
            </div>
            <div class="portfolio-overlay">
                <i class="fas fa-expand"></i>
            </div>
        </div>
        <div class="work-info">
            <h3>${work.title}</h3>
            <p>
                <i class="fas fa-folder"></i>
                ${getCategoryName(work.category)}
            </p>
        </div>
        <div class="work-actions">
            <button class="action-btn edit-btn" onclick="editWork('${workId}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteWork('${workId}', '${work.imageUrl}', '${work.title}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

// دالة تحميل التقييمات
function loadTestimonials() {
    const testimonialsList = document.getElementById('testimonialsList');
    
    // إظهار حالة التحميل
    testimonialsList.innerHTML = `
        <div class="skeleton-loader skeleton-testimonial">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-name"></div>
            <div class="skeleton-text"></div>
        </div>
        <div class="skeleton-loader skeleton-testimonial">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-name"></div>
            <div class="skeleton-text"></div>
        </div>
    `;

    const testimonialsRef = dbRef(db, 'testimonials');
    
    onValue(testimonialsRef, (snapshot) => {
        testimonialsList.innerHTML = ''; // مسح حالة التحميل
        
        if (snapshot.exists()) {
            let testimonials = [];
            snapshot.forEach((childSnapshot) => {
                testimonials.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // ترتيب التقييمات حسب التاريخ
            testimonials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            testimonials.forEach(testimonial => {
                const testimonialElement = createTestimonialElement(testimonial);
                testimonialsList.appendChild(testimonialElement);
            });
        } else {
            testimonialsList.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-comments"></i>
                    <p>لا توجد تقييمات حالياً</p>
                </div>
            `;
        }
    }, (error) => {
        console.error("Error loading testimonials:", error);
        testimonialsList.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-circle"></i>
                <p>حدث خطأ أثناء تحميل التقييمات</p>
            </div>
        `;
    });
}

// إنشاء عنصر التقييم
function createTestimonialElement(testimonial) {
    const div = document.createElement('div');
    div.className = 'testimonial-item';
    
    // تنسيق التاريخ بالميلادي
    const reviewDate = new Date(testimonial.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
    
    div.innerHTML = `
        <div class="testimonial-avatar">
            ${testimonial.imageUrl ? 
                `<img src="${testimonial.imageUrl}" 
                     alt="${testimonial.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <div class="fallback-avatar" style="display: none;">
                    <i class="fas fa-user"></i>
                 </div>` :
                `<div class="fallback-avatar">
                    <i class="fas fa-user"></i>
                 </div>`
            }
        </div>
        <div class="testimonial-content">
            <div class="testimonial-header">
                <div>
                    <div class="testimonial-name">${testimonial.name}</div>
                    <div class="testimonial-title">${testimonial.title}</div>
                    <div class="testimonial-date">تم التقييم في ${reviewDate}</div>
                </div>
                <div class="testimonial-rating">${stars}</div>
            </div>
            <div class="testimonial-text">${testimonial.text}</div>
        </div>
        <div class="testimonial-actions">
            <button class="action-btn edit-btn" onclick="editTestimonial('${testimonial.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteTestimonial('${testimonial.id}', '${testimonial.name}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

// تحديث دالة تهيئة النجوم
function initRatingStars() {
    // تهيئة نجوم التقييم في نموذج إضافة تقييم جديد
    const ratingStars = document.querySelectorAll('.rating-input i');
    const ratingInput = document.getElementById('rating');

    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            ratingInput.value = rating;
            updateStars(rating, star.parentElement);
        });

        star.addEventListener('mouseover', () => {
            const rating = star.dataset.rating;
            updateStars(rating, star.parentElement);
        });

        star.parentElement.addEventListener('mouseleave', () => {
            const currentRating = ratingInput.value;
            updateStars(currentRating, star.parentElement);
        });
    });

    // تهيئة نجوم التقييم في نموذج التعديل
    const editRatingStars = document.querySelectorAll('#editRatingInput i');
    const editRatingInput = document.getElementById('editRating');

    editRatingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            editRatingInput.value = rating;
            updateStars(rating, star.parentElement);
        });

        star.addEventListener('mouseover', () => {
            const rating = star.dataset.rating;
            updateStars(rating, star.parentElement);
        });

        star.parentElement.addEventListener('mouseleave', () => {
            const currentRating = editRatingInput.value;
            updateStars(currentRating, star.parentElement);
        });
    });
}

// تحديث دالة updateStars
function updateStars(rating, container) {
    if (!container) {
        // إذا لم يتم تمرير container، ابحث عن container الافتراضي
        container = document.querySelector('.rating-input');
        if (!container) return; // إذا لم يتم العثور على container، اخرج من الدالة
    }
    
    const stars = container.querySelectorAll('i');
    if (!stars.length) return; // إذا لم يتم العثور على النجوم، اخرج من الدالة

    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

// إضافة استدعاء دالة التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // الكود الموجود مسبقاً...
    
    // تهيئة نجوم التقييم
    initRatingStars();
});

// إضافة دالة handleWorkSubmit
async function handleWorkSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';

        const category = document.getElementById('category').value;
        const title = document.getElementById('title').value.trim();
        const imageFile = document.getElementById('image').files[0];

        if (!title || !imageFile) {
            throw new Error('جميع الحقول مطلوبة');
        }

        // رفع الصورة إلى Imgur
        const base64Image = await convertToBase64(imageFile);
        const imgurResponse = await uploadToImgur(base64Image);
        
        if (!imgurResponse.success) {
            throw new Error('فشل رفع الصورة');
        }

        const workData = {
            category,
            title,
            imageUrl: imgurResponse.data.link,
            createdAt: new Date().toISOString()
        };

        // إضافة العمل إلى Firebase - تحديث استخدام ref
        const worksRef = dbRef(db, 'works');
        const newWorkRef = push(worksRef);
        await set(newWorkRef, workData);

        showMessage('success', 'تم إضافة العمل بنجاح');
        form.reset();
        loadWorks(); // إعادة تحميل الأعمال

    } catch (error) {
        console.error('Error:', error);
        showMessage('error', error.message || 'حدث خطأ أثناء إضافة العمل');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة عمل';
    }
}

// إضافة مستمع الأحداث للنموذج
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleWorkSubmit);
    }
});

// إضافة دالة handleFilter
function handleFilter(e) {
    if (e.target.classList.contains('filter-btn')) {
        // إزالة الفئة النشطة من جميع الأزرار
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // إضافة الفئة النشطة للزر المحدد
        e.target.classList.add('active');
        
        // الحصول على فئة التصفية
        const category = e.target.dataset.category;
        
        // تحديث عرض الأعمال
        const worksList = document.getElementById('worksList');
        const works = worksList.querySelectorAll('.work-item');
        
        works.forEach(work => {
            if (category === 'all') {
                work.style.display = 'block';
                work.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                const workCategory = work.querySelector('.work-info p').textContent.trim();
                if (getCategoryName(category) === workCategory) {
                    work.style.display = 'block';
                    work.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    work.style.display = 'none';
                }
            }
        });
    }
}

// إضافة مستمع الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // ... الكود الموجود مسبقاً

    // إضافة مستمع لأزرار التصفية
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        filterSection.addEventListener('click', handleFilter);
    }
});

// إضافة دالة handleTestimonialSubmit
async function handleTestimonialSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="material-icons">hourglass_empty</i><span>جاري الإضافة...</span>';

        const testimonialData = {
            name: document.getElementById('clientName').value.trim(),
            title: document.getElementById('clientTitle').value.trim(),
            rating: Number(document.getElementById('rating').value || 5),
            text: document.getElementById('testimonialText').value.trim(),
            createdAt: new Date().toISOString()
        };

        if (!testimonialData.name || !testimonialData.title || !testimonialData.text) {
            throw new Error('جميع الحقول مطلوبة');
        }

        const imageFile = document.getElementById('clientImage').files[0];
        if (imageFile) {
            const base64Image = await convertToBase64(imageFile);
            const imgurResponse = await uploadToImgur(base64Image);
            testimonialData.imageUrl = imgurResponse.data.link;
        }

        // إضافة التقييم إلى Firebase
        const testimonialsRef = dbRef(db, 'testimonials');
        const newTestimonialRef = push(testimonialsRef);
        await set(newTestimonialRef, testimonialData);

        showMessage('success', 'تم إضافة التقييم بنجاح');
        form.reset();
        
        // تحديث النجوم بعد إعادة تعيين النموذج
        const ratingInput = document.querySelector('.rating-input');
        if (ratingInput) {
            updateStars(5, ratingInput);
            document.getElementById('rating').value = '5';
        }
        
        loadTestimonials(); // إعادة تحميل التقييمات

    } catch (error) {
        console.error('Error:', error);
        showMessage('error', error.message || 'حدث خطأ أثناء إضافة التقييم');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="material-icons">add</i><span>إضافة تقييم</span>';
    }
}

// إضافة مستمعي الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // ... الكود الموجود مسبقاً

    // إضافة مستمع لنموذج التقييمات
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', handleTestimonialSubmit);
    }
});

// إضافة دوال فتح وإغلاق Lightbox
window.openDashboardLightbox = (imageUrl, title) => {
    const lightbox = document.getElementById('dashboardLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    lightboxImg.src = imageUrl;
    lightboxImg.alt = title;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
};

window.closeDashboardLightbox = () => {
    const lightbox = document.getElementById('dashboardLightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // إعادة تفعيل التمرير
};

// إضافة مستمع لإغلاق Lightbox بزر ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDashboardLightbox();
    }
});

// دالة تحديث الإحصائيات
async function updateStats() {
    try {
        // تحديث الأرقام
        const stats = await Analytics.getStats();
        
        // التحقق من وجود البيانات
        if (!stats || Object.values(stats).every(val => val === 0)) {
            // إظهار رسالة في حالة عدم وجود بيانات
            document.querySelector('.stats-section').innerHTML = `
                <div style="text-align: center; padding: 40px; background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border);">
                    <i class="fas fa-chart-bar" style="font-size: 48px; color: var(--primary); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--text); margin-bottom: 8px;">تعذر تحميل الإحصائيات</h3>
                    <p style="color: var(--text-secondary);">يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى</p>
                </div>
            `;
            return;
        }

        // إذا توفرت البيانات، عرضها كالمعتاد
        document.getElementById('viewsCount').textContent = stats.views.toLocaleString();
        document.getElementById('visitorsCount').textContent = stats.visitors.toLocaleString();
        document.getElementById('avgTimeCount').textContent = formatTime(stats.avgTime);
        document.getElementById('engagementCount').textContent = `${stats.engagement}%`;

        // تحديث نسب التغيير
        updateStatChange('viewsChange', stats.viewsChange);
        updateStatChange('visitorsChange', stats.visitorsChange);
        updateStatChange('avgTimeChange', stats.avgTimeChange);
        updateStatChange('engagementChange', stats.engagementChange);

        // تحديث الرسوم البيانية
        updateVisitsChart(stats.visitsData);
        updateSourcesChart(stats.sourcesData);

    } catch (error) {
        console.error('Error updating stats:', error);
        // إظهار رسالة خطأ مع أيقونة
        document.querySelector('.stats-section').innerHTML = `
            <div style="text-align: center; padding: 40px; background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border);">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f44336; margin-bottom: 16px;"></i>
                <h3 style="color: var(--text); margin-bottom: 8px;">تعذر تحميل الإحصائيات</h3>
                <p style="color: var(--text-secondary);">حدث خطأ أثناء تحميل البيانات، يرجى المحاولة مرة أخرى</p>
            </div>
        `;
    }
}

// دالة تحديث نسبة التغيير
function updateStatChange(elementId, change) {
    const element = document.getElementById(elementId);
    const container = element.parentElement;
    
    if (change >= 0) {
        container.className = 'stat-change positive';
        container.querySelector('i').className = 'fas fa-arrow-up';
    } else {
        container.className = 'stat-change negative';
        container.querySelector('i').className = 'fas fa-arrow-down';
    }
    
    element.textContent = `${Math.abs(change)}%`;
}

// دالة تنسيق الوقت
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// دالة تحديث رسم الزيارات
function updateVisitsChart(data) {
    const ctx = document.getElementById('visitsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'الزيارات',
                data: data.values,
                borderColor: '#FF4D00',
                backgroundColor: 'rgba(255, 77, 0, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// دالة تحديث رسم المصادر
function updateSourcesChart(data) {
    const ctx = document.getElementById('sourcesChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#FF4D00',
                    '#4CAF50',
                    '#2196F3',
                    '#9C27B0'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// تحديث الإحصائيات كل دقيقة
setInterval(updateStats, 60000);

// تحديث الإحصائيات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateStats);

// تحديث دالة editTestimonial
window.editTestimonial = async (testimonialId) => {
    try {
        const testimonialRef = dbRef(db, `testimonials/${testimonialId}`);
        const snapshot = await get(testimonialRef);
        const testimonial = snapshot.val();

        // تعبئة النموذج بالبيانات الحالية
        document.getElementById('editClientName').value = testimonial.name;
        document.getElementById('editClientTitle').value = testimonial.title;
        document.getElementById('editTestimonialText').value = testimonial.text;
        document.getElementById('editRating').value = testimonial.rating;
        
        // تحديث الصورة الحالية
        if (testimonial.imageUrl) {
            document.getElementById('currentTestimonialImage').src = testimonial.imageUrl;
            document.querySelector('#editTestimonialDialog .current-image').style.display = 'flex';
        } else {
            document.querySelector('#editTestimonialDialog .current-image').style.display = 'none';
        }

        // تحديث النجوم
        updateStars(testimonial.rating, document.getElementById('editRatingInput'));

        // تخزين معرف التقييم والصورة القديمة
        const editForm = document.getElementById('editTestimonialForm');
        editForm.dataset.testimonialId = testimonialId;
        editForm.dataset.oldImageUrl = testimonial.imageUrl || '';

        // إظهار النافذة المنبثقة
        document.getElementById('editTestimonialDialog').classList.add('active');
        document.body.style.overflow = 'hidden';

        // إضافة مستمع الأحداث للنموذج
        editForm.onsubmit = handleEditTestimonialSubmit;
    } catch (error) {
        console.error('Error loading testimonial:', error);
        showMessage('error', 'حدث خطأ أثناء تحميل بيانات التقييم');
    }
};

// إضافة دالة handleEditTestimonialSubmit
async function handleEditTestimonialSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.edit-submit');
    const testimonialId = form.dataset.testimonialId;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="material-icons">hourglass_empty</i><span>جاري التحديث...</span>';

        const testimonialData = {
            name: document.getElementById('editClientName').value.trim(),
            title: document.getElementById('editClientTitle').value.trim(),
            rating: Number(document.getElementById('editRating').value),
            text: document.getElementById('editTestimonialText').value.trim(),
            updatedAt: new Date().toISOString()
        };

        if (!testimonialData.name || !testimonialData.title || !testimonialData.text) {
            throw new Error('جميع الحقول مطلوبة');
        }

        const imageFile = document.getElementById('editClientImage').files[0];
        if (imageFile) {
            const base64Image = await convertToBase64(imageFile);
            const imgurResponse = await uploadToImgur(base64Image);
            testimonialData.imageUrl = imgurResponse.data.link;

            // حذف الصورة القديمة من Imgur
            if (form.dataset.oldImageUrl) {
                try {
                    await fetch(`https://api.imgur.com/3/image/${form.dataset.oldImageUrl.split('/').pop()}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                        }
                    });
                } catch (error) {
                    console.warn('Error deleting old image:', error);
                }
            }
        } else {
            testimonialData.imageUrl = form.dataset.oldImageUrl;
        }

        const testimonialRef = dbRef(db, `testimonials/${testimonialId}`);
        await set(testimonialRef, testimonialData);

        showMessage('success', 'تم تحديث التقييم بنجاح');
        closeEditTestimonialDialog();
        loadTestimonials(); // إعادة تحميل التقييمات

    } catch (error) {
        console.error('Error:', error);
        showMessage('error', error.message || 'حدث خطأ أثناء تحديث التقييم');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="material-icons">save</i><span>حفظ التغييرات</span>';
    }
}

// إضافة دالة إغلاق نافذة تعديل التقييم
window.closeEditTestimonialDialog = () => {
    const dialog = document.getElementById('editTestimonialDialog');
    const form = document.getElementById('editTestimonialForm');
    
    dialog.classList.remove('active');
    document.body.style.overflow = '';
    
    // إعادة تعيين النموذج
    form.reset();
    form.dataset.testimonialId = '';
    form.dataset.oldImageUrl = '';
    
    // إخفاء الصورة الحالية
    document.querySelector('#editTestimonialDialog .current-image').style.display = 'none';
    
    // إعادة تعيين النجوم
    updateStars(5, document.getElementById('editRatingInput'));
};

// إضافة دالة editWork
window.editWork = async (workId) => {
    try {
        const workRef = dbRef(db, `works/${workId}`);
        const snapshot = await get(workRef);
        const work = snapshot.val();

        // تعبئة النموذج بالبيانات الحالية
        document.getElementById('editCategory').value = work.category;
        document.getElementById('editTitle').value = work.title;
        
        // تحديث الصورة الحالية
        const currentImage = document.getElementById('currentImage');
        currentImage.src = work.imageUrl;
        document.querySelector('.current-image').style.display = 'flex';

        // تخزين معرف العمل والصورة القديمة
        const editForm = document.getElementById('editForm');
        editForm.dataset.workId = workId;
        editForm.dataset.oldImageUrl = work.imageUrl;

        // إظهار النافذة المنبثقة
        document.getElementById('editDialog').classList.add('active');
        document.body.style.overflow = 'hidden';

        // إضافة مستمع الأحداث للنموذج
        editForm.onsubmit = handleEditSubmit;
    } catch (error) {
        console.error('Error loading work:', error);
        showMessage('error', 'حدث خطأ أثناء تحميل بيانات العمل');
    }
};

// دالة معالجة تحديث العمل
async function handleEditSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.edit-submit');
    const workId = form.dataset.workId;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="material-icons">hourglass_empty</i><span>جاري التحديث...</span>';
        
        const category = document.getElementById('editCategory').value;
        const title = document.getElementById('editTitle').value;
        const imageFile = document.getElementById('editImage').files[0];
        
        let imageUrl = form.dataset.oldImageUrl;
        
        if (imageFile) {
            const base64Image = await convertToBase64(imageFile);
            const imgurResponse = await uploadToImgur(base64Image);
            imageUrl = imgurResponse.data.link;
            
            // حذف الصورة القديمة من Imgur
            if (form.dataset.oldImageUrl) {
                try {
                    await fetch(`https://api.imgur.com/3/image/${form.dataset.oldImageUrl.split('/').pop()}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                        }
                    });
                } catch (error) {
                    console.warn('Error deleting old image:', error);
                }
            }
        }

        const workData = {
            category,
            title,
            imageUrl,
            updatedAt: new Date().toISOString()
        };

        const workRef = dbRef(db, `works/${workId}`);
        await set(workRef, workData);
        
        showMessage('success', 'تم تحديث العمل بنجاح');
        closeEditDialog();
        loadWorks(); // إعادة تحميل الأعمال

    } catch (error) {
        console.error('Error:', error);
        showMessage('error', 'حدث خطأ أثناء تحديث العمل');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="material-icons">save</i><span>حفظ التغييرات</span>';
    }
}

// دالة إغلاق نافذة التعديل
window.closeEditDialog = () => {
    const dialog = document.getElementById('editDialog');
    const form = document.getElementById('editForm');
    
    dialog.classList.remove('active');
    document.body.style.overflow = '';
    
    // إعادة تعيين النموذج
    form.reset();
    form.dataset.workId = '';
    form.dataset.oldImageUrl = '';
    
    // إخفاء الصورة الحالية
    document.querySelector('.current-image').style.display = 'none';
};

// إضافة مستمعي الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // ... الكود الموجود مسبقاً

    // إضافة مستمع لزر إغلاق نافذة تعديل العمل
    document.getElementById('closeEdit')?.addEventListener('click', () => {
        closeEditDialog();
    });

    // إضافة مستمع لزر إغلاق نافذة تعديل التقييم
    document.getElementById('closeEditTestimonial')?.addEventListener('click', () => {
        closeEditTestimonialDialog();
    });

    // إضافة مستمع لإغلاق النوافذ عند النقر خارجها
    document.getElementById('editDialog')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeEditDialog();
        }
    });

    document.getElementById('editTestimonialDialog')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeEditTestimonialDialog();
        }
    });

    // إضافة مستمع لإغلاق النوافذ بزر ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditDialog();
            closeEditTestimonialDialog();
        }
    });
});

// دالة حذف العمل
window.deleteWork = async (workId, imageUrl, title) => {
    try {
        // إظهار نافذة التأكيد
        const dialog = document.getElementById('confirmDialog');
        const confirmBtn = document.getElementById('confirmDelete');
        const cancelBtn = document.getElementById('cancelDelete');
        
        // تحديث نص التأكيد
        dialog.querySelector('h3').textContent = 'تأكيد حذف العمل';
        dialog.querySelector('p').textContent = `هل أنت متأكد من حذف "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`;
        
        dialog.classList.add('active');
        document.body.style.overflow = 'hidden';

        // إنشاء Promise للتعامل مع التأكيد
        return new Promise((resolve, reject) => {
            const handleConfirm = async () => {
                try {
                    // حذف الصورة من Imgur
                    if (imageUrl) {
                        try {
                            await fetch(`https://api.imgur.com/3/image/${imageUrl.split('/').pop()}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                                }
                            });
                        } catch (error) {
                            console.warn('Error deleting image from Imgur:', error);
                        }
                    }

                    // حذف العمل من Firebase
                    const workRef = dbRef(db, `works/${workId}`);
                    await remove(workRef);
                    
                    showMessage('success', 'تم حذف العمل بنجاح');
                    resolve();
                } catch (error) {
                    console.error('Error deleting work:', error);
                    showMessage('error', 'حدث خطأ أثناء حذف العمل');
                    reject(error);
                } finally {
                    closeConfirmDialog();
                }
            };

            const closeConfirmDialog = () => {
                dialog.classList.remove('active');
                document.body.style.overflow = '';
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', closeConfirmDialog);
            };

            // إضافة مستمعي الأحداث
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', closeConfirmDialog);

            // إغلاق النافذة عند النقر خارجها
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeConfirmDialog();
                }
            });

            // إغلاق النافذة بزر ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeConfirmDialog();
                }
            });
        });
    } catch (error) {
        console.error('Error in deleteWork:', error);
        showMessage('error', 'حدث خطأ غير متوقع');
    }
};

// دالة حذف التقييم
window.deleteTestimonial = async (testimonialId, name) => {
    try {
        // إظهار نافذة التأكيد
        const dialog = document.getElementById('confirmDialog');
        const confirmBtn = document.getElementById('confirmDelete');
        const cancelBtn = document.getElementById('cancelDelete');
        
        // تحديث نص التأكيد
        dialog.querySelector('h3').textContent = 'تأكيد حذف التقييم';
        dialog.querySelector('p').textContent = `هل أنت متأكد من حذف تقييم "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`;
        
        dialog.classList.add('active');
        document.body.style.overflow = 'hidden';

        // إنشاء Promise للتعامل مع التأكيد
        return new Promise((resolve, reject) => {
            const handleConfirm = async () => {
                try {
                    const testimonialRef = dbRef(db, `testimonials/${testimonialId}`);
                    const snapshot = await get(testimonialRef);
                    const testimonial = snapshot.val();

                    // حذف الصورة من Imgur إذا وجدت
                    if (testimonial.imageUrl) {
                        try {
                            await fetch(`https://api.imgur.com/3/image/${testimonial.imageUrl.split('/').pop()}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                                }
                            });
                        } catch (error) {
                            console.warn('Error deleting image from Imgur:', error);
                        }
                    }

                    // حذف التقييم من Firebase
                    await remove(testimonialRef);
                    
                    showMessage('success', 'تم حذف التقييم بنجاح');
                    resolve();
                } catch (error) {
                    console.error('Error deleting testimonial:', error);
                    showMessage('error', 'حدث خطأ أثناء حذف التقييم');
                    reject(error);
                } finally {
                    closeConfirmDialog();
                }
            };

            const closeConfirmDialog = () => {
                dialog.classList.remove('active');
                document.body.style.overflow = '';
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', closeConfirmDialog);
            };

            // إضافة مستمعي الأحداث
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', closeConfirmDialog);

            // إغلاق النافذة عند النقر خارجها
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeConfirmDialog();
                }
            });

            // إغلاق النافذة بزر ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeConfirmDialog();
                }
            });
        });
    } catch (error) {
        console.error('Error in deleteTestimonial:', error);
        showMessage('error', 'حدث طأ غير متوقع');
    }
};