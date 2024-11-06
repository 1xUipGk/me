import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { getDatabase, ref as dbRef, push, set, onValue, remove, get } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import firebaseConfig from './firebase-config.js';

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

// دالة تسجيل الخروج
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
    messageElement.querySelector('span').textContent = text;
    messageElement.classList.add('show');
    setTimeout(() => {
        messageElement.classList.remove('show');
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

// تحميل الأعمال
function loadWorks(category = 'all') {
    const worksRef = dbRef(db, 'works');
    onValue(worksRef, (snapshot) => {
        const worksList = document.getElementById('worksList');
        worksList.innerHTML = '';
        
        snapshot.forEach((childSnapshot) => {
            const work = childSnapshot.val();
            const workId = childSnapshot.key;
            
            if (category === 'all' || work.category === category) {
                const workElement = createWorkElement(work, workId);
                worksList.appendChild(workElement);
            }
        });
    });
}

// إنشاء عنصر العمل
function createWorkElement(work, workId) {
    const div = document.createElement('div');
    div.className = 'work-item';
    div.innerHTML = `
        <div class="work-image-container">
            <img src="${work.imageUrl}" alt="${work.title}" class="work-image">
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
            <button class="action-btn delete-btn" onclick="deleteWork('${workId}', '${work.imageUrl}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

// تحميل التقييمات
function loadTestimonials() {
    const testimonialsRef = dbRef(db, 'testimonials');
    onValue(testimonialsRef, (snapshot) => {
        const testimonialsList = document.getElementById('testimonialsList');
        testimonialsList.innerHTML = '';
        
        let testimonials = [];
        snapshot.forEach((childSnapshot) => {
            testimonials.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        testimonials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        testimonials.forEach(testimonial => {
            const testimonialElement = createTestimonialElement(testimonial);
            testimonialsList.appendChild(testimonialElement);
        });
    });
}

// إنشاء عنصر التقييم
function createTestimonialElement(testimonial) {
    const div = document.createElement('div');
    div.className = 'testimonial-item';
    
    const reviewDate = new Date(testimonial.createdAt).toLocaleDateString('ar-SA');
    const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
    
    div.innerHTML = `
        <div class="testimonial-avatar">
            ${testimonial.imageUrl ? 
                `<img src="${testimonial.imageUrl}" alt="${testimonial.name}">` :
                `<i class="fas fa-user"></i>`}
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
            <button class="action-btn delete-btn" onclick="deleteTestimonial('${testimonial.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

// تحديث النجوم
function updateStars(rating) {
    const stars = document.querySelectorAll('.rating-input i');
    stars.forEach(star => {
        const starRating = star.dataset.rating;
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

// إضافة مستمعي الأحداث
document.addEventListener('DOMContentLoaded', () => {
    // مستمع نموذج رفع الأعمال
    document.getElementById('uploadForm').addEventListener('submit', handleWorkSubmit);
    
    // مستمع نموذج التقييمات
    document.getElementById('testimonialForm').addEventListener('submit', handleTestimonialSubmit);
    
    // مستمع أزرار التصفية
    document.getElementById('filterBtns').addEventListener('click', handleFilter);
    
    // مستمع النجوم
    const ratingStars = document.querySelectorAll('.rating-input i');
    const ratingText = document.querySelector('.rating-text');
    const ratingInput = document.getElementById('rating');

    const ratingTexts = [
        'بحاجة إلى تحسين',
        'مقبول',
        'جيد',
        'جيد جداً',
        'ممتاز'
    ];

    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            ratingInput.value = rating;
            updateStars(rating);
            if (ratingText) {
                ratingText.textContent = ratingTexts[rating - 1];
            }
        });

        star.addEventListener('mouseover', () => {
            const rating = star.dataset.rating;
            updateStars(rating);
            if (ratingText) {
                ratingText.textContent = ratingTexts[rating - 1];
            }
        });
    });

    if (ratingStars.length > 0) {
        const starsContainer = ratingStars[0].parentElement;
        starsContainer.addEventListener('mouseleave', () => {
            const currentRating = ratingInput.value;
            updateStars(currentRating);
            if (ratingText) {
                ratingText.textContent = ratingTexts[currentRating - 1];
            }
        });
    }
});

// تصدير الدوال للنافذة العامة
window.editWork = async (workId) => {
    try {
        const workRef = dbRef(db, `works/${workId}`);
        const snapshot = await get(workRef);
        const work = snapshot.val();

        document.getElementById('category').value = work.category;
        document.getElementById('title').value = work.title;
        
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = 'تحديث العمل';
        submitBtn.dataset.editId = workId;
        submitBtn.dataset.oldImageUrl = work.imageUrl;

        document.querySelector('.upload-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading work:', error);
        showMessage('error', 'حدث خطأ أثناء تحميل بيانات العمل');
    }
};

window.deleteWork = async (workId, imageUrl) => {
    if (confirm('هل أنت متأكد من حذف هذا العمل؟')) {
        try {
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

            const workRef = dbRef(db, `works/${workId}`);
            await remove(workRef);
            showMessage('success', 'تم حذف العمل بنجاح');
        } catch (error) {
            console.error('Error deleting work:', error);
            showMessage('error', 'حدث خطأ أثناء حذف العمل');
        }
    }
};

window.editTestimonial = async (testimonialId) => {
    try {
        const testimonialRef = dbRef(db, `testimonials/${testimonialId}`);
        const snapshot = await get(testimonialRef);
        const testimonial = snapshot.val();

        document.getElementById('clientName').value = testimonial.name;
        document.getElementById('clientTitle').value = testimonial.title;
        document.getElementById('testimonialText').value = testimonial.text;
        document.getElementById('rating').value = testimonial.rating;
        updateStars(testimonial.rating);

        const submitBtn = document.querySelector('#testimonialForm .submit-btn');
        submitBtn.textContent = 'تحديث التقييم';
        submitBtn.dataset.editId = testimonialId;
        submitBtn.dataset.oldImageUrl = testimonial.imageUrl || '';

        document.querySelector('.testimonial-form-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading testimonial:', error);
        showMessage('error', 'حدث خطأ أثناء تحميل بيانات التقييم');
    }
};

window.deleteTestimonial = async (testimonialId) => {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
        try {
            const testimonialRef = dbRef(db, `testimonials/${testimonialId}`);
            const snapshot = await get(testimonialRef);
            const testimonial = snapshot.val();

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

            await remove(testimonialRef);
            showMessage('success', 'تم حذف التقييم بنجاح');
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            showMessage('error', 'حدث خطأ أثناء حذف التقييم');
        }
    }
};

// إضافة دالة handleWorkSubmit
async function handleWorkSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const isEdit = submitBtn.dataset.editId;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'جاري التحديث...' : 'جاري الرفع...';
        
        const category = document.getElementById('category').value;
        const title = document.getElementById('title').value;
        const imageFile = document.getElementById('image').files[0];
        
        let imageUrl = isEdit ? submitBtn.dataset.oldImageUrl : '';
        
        if (imageFile) {
            const base64Image = await convertToBase64(imageFile);
            const imgurResponse = await uploadToImgur(base64Image);
            imageUrl = imgurResponse.data.link;
            
            if (isEdit && submitBtn.dataset.oldImageUrl) {
                try {
                    await fetch(`https://api.imgur.com/3/image/${submitBtn.dataset.oldImageUrl.split('/').pop()}`, {
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

        if (isEdit) {
            const workRef = dbRef(db, `works/${submitBtn.dataset.editId}`);
            await set(workRef, workData);
            showMessage('success', 'تم تحديث العمل بنجاح');
        } else {
            workData.createdAt = workData.updatedAt;
            const worksRef = dbRef(db, 'works');
            const newWorkRef = push(worksRef);
            await set(newWorkRef, workData);
            showMessage('success', 'تم إضافة العمل بنجاح');
        }

        // إعادة تعيين النموذج
        e.target.reset();
        submitBtn.textContent = 'إضافة العمل';
        submitBtn.disabled = false;
        delete submitBtn.dataset.editId;
        delete submitBtn.dataset.oldImageUrl;

    } catch (error) {
        console.error('Error:', error);
        showMessage('error', isEdit ? 'حدث خطأ أثناء تحديث العمل' : 'حدث خطأ أثناء إضافة العمل');
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? 'تحديث العمل' : 'إضافة العمل';
    }
}

// إضافة دالة handleFilter
function handleFilter(e) {
    if (e.target.classList.contains('filter-btn')) {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const category = e.target.dataset.category;
        loadWorks(category);
    }
}

// إضافة دالة handleTestimonialSubmit
async function handleTestimonialSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const isEdit = submitBtn.dataset.editId;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'جاري التحديث...' : 'جاري الإضافة...';

        const testimonialData = {
            name: document.getElementById('clientName').value,
            title: document.getElementById('clientTitle').value,
            rating: Number(document.getElementById('rating').value),
            text: document.getElementById('testimonialText').value,
            updatedAt: new Date().toISOString()
        };

        const imageFile = document.getElementById('clientImage').files[0];
        if (imageFile) {
            const base64Image = await convertToBase64(imageFile);
            const imgurResponse = await uploadToImgur(base64Image);
            testimonialData.imageUrl = imgurResponse.data.link;

            if (isEdit && submitBtn.dataset.oldImageUrl) {
                try {
                    await fetch(`https://api.imgur.com/3/image/${submitBtn.dataset.oldImageUrl.split('/').pop()}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                        }
                    });
                } catch (error) {
                    console.warn('Error deleting old image:', error);
                }
            }
        } else if (isEdit) {
            testimonialData.imageUrl = submitBtn.dataset.oldImageUrl;
        }

        if (isEdit) {
            const testimonialRef = dbRef(db, `testimonials/${submitBtn.dataset.editId}`);
            await set(testimonialRef, testimonialData);
            showMessage('success', 'تم تحديث التقييم بنجاح');
        } else {
            testimonialData.createdAt = testimonialData.updatedAt;
            const testimonialsRef = dbRef(db, 'testimonials');
            const newTestimonialRef = push(testimonialsRef);
            await set(newTestimonialRef, testimonialData);
            showMessage('success', 'تم إضافة التقييم بنجاح');
        }

        // إعادة تعيين النموذج
        e.target.reset();
        submitBtn.textContent = 'إضافة تقييم';
        submitBtn.disabled = false;
        delete submitBtn.dataset.editId;
        delete submitBtn.dataset.oldImageUrl;
        updateStars(5);

    } catch (error) {
        console.error('Error:', error);
        showMessage('error', isEdit ? 'حدث خطأ أثناء تحديث التقييم' : 'حدث خطأ أثناء إضافة التقييم');
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? 'تحديث التقييم' : 'إضافة تقييم';
    }
}