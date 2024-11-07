// كود حماية الموقع
(function(){
    // منع فتح أدوات المطور
    function preventDevTools() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 73 || e.keyCode === 123)) {
                e.preventDefault();
            }
            if (e.key === 'F12') {
                e.preventDefault();
            }
        });
    }

    // تشويش الكود المصدري
    function obfuscateCode() {
        const _0x5f2d = [
            'preventDefault',
            'contextmenu',
            'keydown',
            'ctrlKey',
            'keyCode',
            'addEventListener'
        ];
        
        function _0x2b4c() {
            return Math.random().toString(36).substring(7);
        }
        
        const _0x1f3a = new Date().getTime();
        const _0x3d5e = window.location.hostname;
        const _0x4c6f = _0x2b4c();
        
        setInterval(() => {
            console.clear();
            console.log(_0x2b4c());
        }, 100);
    }

    // منع النسخ والتحديد
    function preventCopy() {
        document.addEventListener('copy', e => e.preventDefault());
        document.addEventListener('cut', e => e.preventDefault());
        document.addEventListener('paste', e => e.preventDefault());
        document.addEventListener('selectstart', e => e.preventDefault());
    }

    // منع عرض المصدر
    function preventSourceView() {
        document.onkeypress = function(event) {
            if (event.ctrlKey && (event.keyCode === 10 || event.keyCode === 13)) {
                event.preventDefault();
            }
        };
    }

    // تعطيل الماوس الأيمن
    function disableRightClick() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }

    // تشغيل جميع وسائل الحماية
    function initProtection() {
        preventDevTools();
        obfuscateCode();
        preventCopy();
        preventSourceView();
        disableRightClick();
        
        // رسالة تحذير
        console.log('%cتحذير!', 'color: red; font-size: 30px; font-weight: bold;');
        console.log('%cهذا الموقع محمي ضد محاولات الاختراق والنسخ', 'font-size: 20px;');
    }

    // تشغيل الحماية
    initProtection();
})(); 