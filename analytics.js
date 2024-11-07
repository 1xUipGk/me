import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import firebaseConfig from './firebase-config.js';

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

const Analytics = {
    // تتبع النقرات على أزرار التواصل
    trackContact: (method) => {
        logEvent(analytics, 'contact', {
            'event_category': 'engagement',
            'event_label': method
        });
    },

    // تتبع مشاهدة الأعمال
    trackPortfolioView: (category) => {
        logEvent(analytics, 'view_portfolio', {
            'event_category': 'engagement',
            'event_label': category
        });
    },

    // تتبع التفاعل مع الخدمات
    trackService: (service) => {
        logEvent(analytics, 'view_service', {
            'event_category': 'engagement',
            'event_label': service
        });
    },

    // تتبع النقرات على السياسات
    trackPolicy: (policy) => {
        logEvent(analytics, 'view_policy', {
            'event_category': 'engagement',
            'event_label': policy
        });
    },

    // تتبع البحث
    trackSearch: (query) => {
        logEvent(analytics, 'search', {
            'event_category': 'engagement',
            'event_label': query
        });
    },

    // تتبع مشاهدة الصور
    trackImageView: (imageId) => {
        logEvent(analytics, 'view_image', {
            'event_category': 'engagement',
            'event_label': imageId
        });
    },

    // تتبع وقت القراءة
    trackReadTime: (page, timeInSeconds) => {
        logEvent(analytics, 'read_time', {
            'event_category': 'engagement',
            'event_label': page,
            'value': timeInSeconds
        });
    },

    // دالة جلب الإحصائيات الفعلية
    getStats: async () => {
        try {
            // جلب إحصائيات Firebase Analytics
            const analyticsRef = ref(db, 'analytics_data');
            const snapshot = await get(analyticsRef);
            const analyticsData = snapshot.val() || {};

            // جلب إحصائيات اليوم
            const today = new Date().toISOString().split('T')[0];
            const todayStats = analyticsData[today] || {
                pageviews: 0,
                users: 0,
                avgSessionDuration: 0
            };

            // حساب التغيير مقارنة باليوم السابق
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = yesterday.toISOString().split('T')[0];
            const yesterdayStats = analyticsData[yesterdayKey] || {
                pageviews: 0,
                users: 0,
                avgSessionDuration: 0
            };

            // حساب نسب التغيير
            const calculateChange = (current, previous) => {
                if (previous === 0) return 0;
                return Math.round(((current - previous) / previous) * 100);
            };

            // جلب بيانات آخر 6 أشهر
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthKey = date.toLocaleString('ar', { month: 'long' });
                const monthData = Object.values(analyticsData)
                    .filter(stat => new Date(stat.date).getMonth() === date.getMonth())
                    .reduce((acc, curr) => acc + (curr.pageviews || 0), 0);
                last6Months.push({
                    label: monthKey,
                    value: monthData
                });
            }

            // جلب مصادر الزيارات
            const sources = {
                google: 0,
                direct: 0,
                instagram: 0,
                twitter: 0
            };

            Object.values(analyticsData).forEach(stat => {
                if (stat.source) {
                    sources[stat.source] = (sources[stat.source] || 0) + 1;
                }
            });

            return {
                views: todayStats.pageviews,
                visitors: todayStats.users,
                avgTime: todayStats.avgSessionDuration,
                engagement: Math.round((todayStats.avgSessionDuration / 180) * 100), // 3 دقائق كمعيار
                viewsChange: calculateChange(todayStats.pageviews, yesterdayStats.pageviews),
                visitorsChange: calculateChange(todayStats.users, yesterdayStats.users),
                avgTimeChange: calculateChange(todayStats.avgSessionDuration, yesterdayStats.avgSessionDuration),
                engagementChange: calculateChange(
                    (todayStats.avgSessionDuration / 180) * 100,
                    (yesterdayStats.avgSessionDuration / 180) * 100
                ),
                visitsData: {
                    labels: last6Months.map(m => m.label),
                    values: last6Months.map(m => m.value)
                },
                sourcesData: {
                    labels: ['جوجل', 'مباشر', 'انستغرام', 'تويتر'],
                    values: [
                        sources.google,
                        sources.direct,
                        sources.instagram,
                        sources.twitter
                    ]
                }
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    },

    // دالة تسجيل الزيارة
    logVisit: async (source = 'direct') => {
        try {
            const db = getDatabase();
            const today = new Date().toISOString().split('T')[0];
            const visitRef = ref(db, `analytics/${today}`);
            
            // جلب إحصائيات اليوم الحالي
            const snapshot = await get(visitRef);
            const currentStats = snapshot.val() || {
                views: 0,
                visitors: 0,
                avgTime: 0,
                engagement: 0,
                source: source,
                date: today
            };

            // تحديث الإحصائيات
            await set(visitRef, {
                ...currentStats,
                views: currentStats.views + 1,
                visitors: currentStats.visitors + 1,
                source: source
            });

        } catch (error) {
            console.error('Error logging visit:', error);
        }
    },

    // دالة تحديث وقت التصفح
    updateEngagementTime: async (timeSpent) => {
        try {
            const db = getDatabase();
            const today = new Date().toISOString().split('T')[0];
            const statsRef = ref(db, `analytics/${today}`);
            
            const snapshot = await get(statsRef);
            const currentStats = snapshot.val() || {};
            
            const newAvgTime = currentStats.avgTime ? 
                Math.round((currentStats.avgTime + timeSpent) / 2) : 
                timeSpent;

            await set(statsRef, {
                ...currentStats,
                avgTime: newAvgTime,
                engagement: Math.min(100, Math.round((timeSpent / 180) * 100)) // 3 دقائق كمعيار للتفاعل الكامل
            });

        } catch (error) {
            console.error('Error updating engagement time:', error);
        }
    },

    // تتبع الزيارات
    trackPageView: (page) => {
        logEvent(analytics, 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: page
        });
    },

    // تتبع الأحداث
    trackEvent: (eventName, params = {}) => {
        logEvent(analytics, eventName, params);
    },

    // تتبع الأخطاء
    trackError: (errorType, errorMessage) => {
        logEvent(analytics, 'error', {
            'event_category': 'error',
            'event_label': errorType,
            'error_message': errorMessage
        });
    },

    // تحديث دالة تسجيل الزيارة
    logPageView: (pagePath) => {
        logEvent(analytics, 'page_view', {
            page_path: pagePath,
            page_title: document.title
        });
    },

    // تسجيل الأحداث في Analytics
    logEvent: (eventName, params = {}) => {
        logEvent(analytics, eventName, params);
    }
};

// تحديث script.js لإضافة التتبع
document.addEventListener('DOMContentLoaded', () => {
    // تتبع النقرات على أزرار التواصل
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            Analytics.trackContact(btn.getAttribute('href').includes('wa.me') ? 'whatsapp' : 'email');
        });
    });

    // تتبع مشاهدة الأعمال
    document.querySelectorAll('.portfolio-item').forEach(item => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Analytics.trackPortfolioView(item.dataset.category);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(item);
    });

    // تتبع وقت القراءة
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        Analytics.trackReadTime(window.location.pathname, timeSpent);
    });

    // تتبع مشاهدة الصفحة
    Analytics.trackPageView(window.location.pathname);

    // تتبع النقرات على الروابط
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            Analytics.trackEvent('link_click', {
                link_url: link.href,
                link_text: link.textContent
            });
        });
    });
});

export default Analytics; 