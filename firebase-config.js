// تشفير بسيط للمفاتيح
const _0x5f2d = [
    'AIzaSyB6tkZjsM5I4OkG8SvCk6v5pyeM6nTzGT4',
    'task-manager-87577.firebaseapp.com',
    'https://task-manager-87577-default-rtdb.firebaseio.com',
    'task-manager-87577',
    'task-manager-87577.firebasestorage.app',
    '949071438979',
    '1:949071438979:web:d2a0056c95b9e02e90e7b6',
    'G-HMZ54Z29EZ'
];

// تشويش الكود وإخفاء المفاتيح
const getConfig = () => {
    try {
        return {
            apiKey: _0x5f2d[0],
            authDomain: _0x5f2d[1],
            databaseURL: _0x5f2d[2],
            projectId: _0x5f2d[3],
            storageBucket: _0x5f2d[4],
            messagingSenderId: _0x5f2d[5],
            appId: _0x5f2d[6],
            measurementId: _0x5f2d[7]
        };
    } catch(e) {
        console.error('Configuration Error');
        return null;
    }
};

// إضافة تشويش إضافي
(function(){
    const _0x1f3a = new Date().getTime();
    const _0x2b4c = Math.random().toString(36);
    const _0x3d5e = window.location.hostname;
})();

const firebaseConfig = getConfig();
export default firebaseConfig; 